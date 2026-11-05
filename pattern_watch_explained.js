/* PATTERN LAB: 별도 연구용 추적판, 기존 조합 및 제외수 상태를 수정하지 않음 */
(function(){
  'use strict';
  var ROOT_ID='ln-pattern-watch-v1';
  var SOURCE='https://smok95.github.io/lotto/results/all.json';
  var CACHE='lotto-note-pattern-watch-records-v1';
  var NAMES={fixed_phase4:['F','정간격 4회'],long_diagonal5:['D','사선 5점'],recent_diagonal3:['R','직전 3회 사선'],repeat_gap:['G','간격 반복'],both_neighbors:['N','양옆'],bonus_transition:['B','보너스 전환'],rank_aba:['A','ABA']};
  var KEYS=Object.keys(NAMES);
  function normalize(raw){
    if(!Array.isArray(raw))throw new Error('공개 기록 형식이 바뀌었습니다.');
    var rows=raw.map(function(x){
      var r=Number(x.draw_no!==undefined?x.draw_no:(x.r!==undefined?x.r:x.round));
      var n=x.numbers||x.d;
      var b=Number(x.bonus_no!==undefined?x.bonus_no:x.b);
      if(!Number.isInteger(r)||r<1||!Array.isArray(n)||n.length!==6)return null;
      n=n.map(Number).sort(function(a,b){return a-b;});
      if(n.some(function(v){return !Number.isInteger(v)||v<1||v>45;})||new Set(n).size!==6||
        !Number.isInteger(b)||b<1||b>45||n.includes(b))return null;
      return {r:r,n:n,b:b};
    }).filter(Boolean).sort(function(a,b){return a.r-b.r;});
    if(rows.length<900)throw new Error('연구에 필요한 과거 기록이 부족합니다.');
    var dict=new Map();
    rows.forEach(function(x){if(dict.has(x.r))throw new Error('회차가 중복됐습니다.');dict.set(x.r,x);});
    for(var r=1;r<=rows[rows.length-1].r;r++)if(!dict.has(r))throw new Error(r+'회 기록이 누락됐습니다.');
    return rows;
  }
  function nominate(t,draws){
    var signals={};KEYS.forEach(function(k){signals[k]=new Set();});
    var get=function(r){return draws[r];};
    var has=function(r,n){return !!(draws[r]&&draws[r].has(n));};
    // For every historical gap, look for four equal occurrences.
    for(var d=1;4*d<t;d++){
      var prev=get(t-d);if(!prev)continue;
      prev.forEach(function(n){if(has(t-2*d,n)&&has(t-3*d,n)&&has(t-4*d,n))signals.fixed_phase4.add(n);});
    }
    // Five points of the same arithmetic diagonal with phase d and slope k.
    for(var gd=1;5*gd<t;gd++){
      var recent=get(t-gd);if(!recent)continue;
      recent.forEach(function(first){
        for(var k=-10;k<=10;k++){
          if(!k)continue;
          var n=first+k;
          if(n<1||n>45||n-5*k<1||n-5*k>45)continue;
          if(has(t-2*gd,n-2*k)&&has(t-3*gd,n-3*k)&&has(t-4*gd,n-4*k)&&has(t-5*gd,n-5*k))signals.long_diagonal5.add(n);
        }
      });
    }
    // Consecutive 3-draw diagonal.
    get(t-1).forEach(function(first){
      for(var k=-10;k<=10;k++){
        if(!k)continue;
        var n=first+k;
        if(n>=1&&n<=45&&n-3*k>=1&&n-3*k<=45&&has(t-2,n-2*k)&&has(t-3,n-3*k))signals.recent_diagonal3.add(n);
      }
    });
    for(var n=1;n<=45;n++){
      var occurrences=[];
      for(var r=t-1;r>=1&&occurrences.length<3;r--)if(has(r,n))occurrences.push(r);
      if(occurrences.length===3 && occurrences[0]-occurrences[1]===occurrences[1]-occurrences[2] && t-occurrences[0]===occurrences[0]-occurrences[1])signals.repeat_gap.add(n);
      if(n>1&&n<45&&has(t-1,n-1)&&has(t-1,n+1))signals.both_neighbors.add(n);
    }
    var b=draws.bonus[t-1];
    if(has(t-2,b)&&has(t-3,b))signals.bonus_transition.add(b);
    for(var pos=0;pos<6;pos++)if(draws.sorted[t-3][pos]===draws.sorted[t-1][pos])signals.rank_aba.add(draws.sorted[t-2][pos]);
    var numbers=Array.from(new Set(KEYS.flatMap(function(k){return Array.from(signals[k]);}))).sort(function(a,b){return a-b;});
    return {signals:signals,numbers:numbers};
  }
  function analyze(raw,start){
    var items=normalize(raw),latest=items[items.length-1].r;
    var draws={bonus:[],sorted:[]};items.forEach(function(x){draws[x.r]=new Set(x.n);draws.bonus[x.r]=x.b;draws.sorted[x.r]=x.n;});
    var previous=null,hits=[],focusHistory=[],rounds=[],totals={};KEYS.forEach(function(k){totals[k]={total:0,wins:0};});
    // An earlier draw cannot use future outcomes; evaluation is post-facto.
    for(var t=Math.max(901,start||901);t<=latest+1;t++){
      var pick=nominate(t,draws),actual=t<=latest?draws[t]:null,rows=[];
      pick.numbers.forEach(function(n){
        var src=KEYS.filter(function(k){return pick.signals[k].has(n);});
        var continued=!!(previous&&previous.numbers.includes(n));
        var why=[];if(src.length>=2)why.push('다중패턴');if(continued)why.push('연속검색');
        var hit=!!(actual&&actual.has(n));
        if(t<=latest){src.forEach(function(k){totals[k].total++;if(hit)totals[k].wins++;});}
        var row={round:t,n:n,signal:src,continued:continued,important:why.length>0,reason:why,hit:hit};
        rows.push(row);if(hit)hits.push(row);
        if(t<=latest&&row.important)focusHistory.push(row);
      });
      rounds.push({round:t,items:rows,signals:pick.signals});
      previous=pick;
    }
    return {latest:latest,target:latest+1,current:rounds[rounds.length-1],hits:hits.reverse(),
      focusHistory:focusHistory.reverse(),totals:totals,rounds:rounds};
  }
  // Test-only hook, deliberately inactive on the public blog.
  if(typeof window!=='undefined'&&window.LN_PATTERN_WATCH_TEST){window.LN_PATTERN_WATCH_TEST_API={normalize:normalize,nominate:nominate,analyze:analyze};return;}
  var root=document.getElementById(ROOT_ID);if(!root)return;
  var $=function(selector){return root.querySelector(selector);};
  var setText=function(selector,value){var el=$(selector);if(el)el.textContent=String(value);};
  // Keep the meaning of every observation flag directly beside the numbers.
  // All examples are refreshed for the current research round.
  var guide=document.createElement('div');
  guide.className='lnpw-guide';
  guide.setAttribute('aria-label','중요표시와 패턴 약어 설명');
  guide.innerHTML=''
    +'<div class="lnpw-guide-title">ℹ️ 이 표시, 어떻게 읽나요?</div>'
    +'<p><strong>다중패턴</strong>은 같은 번호가 <b>서로 다른 검색 규칙 2개 이상</b>에 동시에 걸린 경우입니다. <span data-ln-guide-multi></span></p>'
    +'<p><strong>연속검색</strong>은 같은 번호가 <b>직전 회차를 위한 사전 검색에도</b> 걸렸다는 뜻입니다. <span data-ln-guide-repeat></span> <em>연속 당첨이라는 뜻은 아닙니다.</em></p>'
    +'<p><strong>★ 중요표시</strong>는 위 두 가지 중 하나라도 해당할 때 붙습니다. 두 조건이 겹칠 수도 있습니다. ★가 당첨 가능성이 높다는 뜻은 아닙니다.</p>'
    +'<details class="lnpw-guide-detail"><summary>🔎 F·D·R·G·N·B·A, 7가지 패턴 뜻 보기</summary>'
    +'<dl>'
    +'<div><dt>F · 정간격 4회</dt><dd>같은 번호가 일정한 회차 간격으로 과거 4번 나타난 뒤, 다음 간격 위치를 검색합니다.</dd></div>'
    +'<div><dt>D · 긴 사선 5점</dt><dd>회차 간격과 번호 변화폭이 일정한 과거 5개 지점을 사선으로 연결한 뒤 다음 번호를 검색합니다.</dd></div>'
    +'<div><dt>R · 최근 3회 사선</dt><dd>직전 3회에서 같은 폭으로 올라가거나 내려가는 번호 배열을 한 칸 더 연장합니다.</dd></div>'
    +'<div><dt>G · 간격 반복</dt><dd>해당 번호가 마지막 3번 등장한 간격이 같을 때, 그 간격이 다시 이어지는 위치를 검색합니다.</dd></div>'
    +'<div><dt>N · 양옆 번호</dt><dd>직전 회차 본번호에 해당 번호의 양옆 숫자(−1과 +1)가 모두 있을 때 가운데 번호를 검색합니다.</dd></div>'
    +'<div><dt>B · 보너스 전환</dt><dd>직전 회차 보너스 번호가 그전 2개 회차의 본번호에도 나왔던 경우를 추적합니다.</dd></div>'
    +'<div><dt>A · 정렬위치 ABA</dt><dd>3회 전과 직전 회차의 같은 정렬 자리가 동일하면, 가운데 회차의 같은 자리 번호를 검색합니다.</dd></div>'
    +'</dl><p>패턴 코드는 <b>검색에 사용한 규칙</b>을 표시합니다. 여러 코드가 겹쳐도 예측력이 검증됐다는 뜻은 아닙니다.</p></details>';
  var guideStyle=document.createElement('style');
  guideStyle.textContent='#ln-pattern-watch-v1 .lnpw-guide{border:1px solid #426382;background:#142940;border-radius:12px;padding:13px 15px;margin:16px 0;color:#dae6f7;font-size:13px;line-height:1.65}'
    +'#ln-pattern-watch-v1 .lnpw-guide-title{font-size:16px;font-weight:850;color:#ffe0a1;margin-bottom:8px}'
    +'#ln-pattern-watch-v1 .lnpw-guide p{margin:6px 0}'
    +'#ln-pattern-watch-v1 .lnpw-guide strong{color:#ffda8a}'
    +'#ln-pattern-watch-v1 .lnpw-guide em{color:#b4c6dc;font-style:normal}'
    +'#ln-pattern-watch-v1 .lnpw-guide-detail{margin-top:10px;padding-top:10px;border-top:1px solid #426382}'
    +'#ln-pattern-watch-v1 .lnpw-guide-detail summary{color:#cbe2ff;font-size:13px}'
    +'#ln-pattern-watch-v1 .lnpw-guide-detail dl{margin:10px 0;display:grid;gap:8px}'
    +'#ln-pattern-watch-v1 .lnpw-guide-detail dl>div{border:1px solid #345471;border-radius:8px;padding:9px 11px;background:#10243a}'
    +'#ln-pattern-watch-v1 .lnpw-guide-detail dt{font-weight:800;color:#f6d28c}'
    +'#ln-pattern-watch-v1 .lnpw-guide-detail dd{margin:4px 0 0;color:#cfdef0}';
  guide.appendChild(guideStyle);
  var overview=root.querySelector('.lnpw-summary');
  if(overview)overview.after(guide);
  var refreshButton=$('[data-ln-watch-refresh]');
  var busy=false,checkedAt=0;
  function pill(row,focused){
    var el=document.createElement('div');el.className='lnpw-pill'+(focused?' focus':'');
    var n=document.createElement('b');n.textContent=(focused?'★ ':'')+row.n;
    var info=document.createElement('small');
    info.textContent=(focused?row.reason.join('·')+' / ':'')+row.signal.map(function(k){return NAMES[k][0];}).join('+');
    el.append(n,info);return el;
  }
  function render(res){
    var items=res.current.items,flagged=items.filter(function(x){return x.important;});
    var multi=flagged.find(function(x){return x.signal.length>=2;});
    var repeat=flagged.find(function(x){return x.continued&&x.signal.length===1;});
    setText('[data-ln-guide-multi]',multi?'예: '+res.target+'회 '+multi.n+'번 ('+multi.signal.map(function(k){return NAMES[k][0];}).join('+')+')':'이번 회차 해당 사례 없음');
    setText('[data-ln-guide-repeat]',repeat?'예: '+res.target+'회 '+repeat.n+'번 ('+repeat.signal.map(function(k){return NAMES[k][0];}).join('+')+')':'이번 회차 단일패턴 반복 사례 없음');
    setText('[data-ln-watch-target]',res.target+'회');
    setText('[data-ln-watch-total]',items.length+'개');
    setText('[data-ln-watch-flagged]',flagged.length+'개');
    var focus=$('[data-ln-watch-focus]'),other=$('[data-ln-watch-other]');focus.textContent='';other.textContent='';
    flagged.forEach(function(x){focus.appendChild(pill(x,true));});
    items.filter(function(x){return !x.important;}).forEach(function(x){other.appendChild(pill(x,false));});
    if(!flagged.length)focus.textContent='현재 집중관찰 표시 없음';
    if(!other.childNodes.length)other.textContent='다른 패턴 후보 없음';
    var lastResult=res.rounds[res.rounds.length-2];
    if(lastResult){
      var prevFocus=lastResult.items.filter(function(x){return x.important;});
      var prevWins=prevFocus.filter(function(x){return x.hit;});
      setText('[data-ln-watch-last-result]',lastResult.round+'회 중요표시 복기: '+prevFocus.length+'개 중 실제 당첨 '+prevWins.length+'개'+
        (prevWins.length?' ('+prevWins.map(function(x){return x.n;}).join(', ')+')':''));
    }
    setText('[data-ln-watch-focus-history-count]','('+res.focusHistory.length+'건)');
    var focusHitCount=res.focusHistory.filter(function(x){return x.hit;}).length;
    setText('[data-ln-watch-focus-rate]','과거 ★ 기록 '+res.focusHistory.length+'건 중 실제 당첨 '+focusHitCount+'건 ('+
      (res.focusHistory.length?100*focusHitCount/res.focusHistory.length:0).toFixed(1)+'%). 무작위 번호의 기준은 13.3%입니다.');
    var fbody=$('[data-ln-watch-focus-history]');fbody.textContent='';
    res.focusHistory.forEach(function(x){
      var tr=document.createElement('tr');
      [x.round,x.n,x.reason.join('·'),x.hit?'당첨':'미당첨'].forEach(function(value,i){
        var td=document.createElement('td');td.textContent=value;
        if(i===3&&x.hit)td.className='lnpw-winner';tr.appendChild(td);
      });fbody.appendChild(tr);
    });
    setText('[data-ln-watch-history-count]','('+res.hits.length+'건)');
    var tbody=$('[data-ln-watch-history]');tbody.textContent='';
    res.hits.forEach(function(x){
      var tr=document.createElement('tr'),c1=document.createElement('td'),c2=document.createElement('td'),c3=document.createElement('td'),c4=document.createElement('td');
      c1.textContent=x.round;c2.textContent=x.n;c2.className='lnpw-winner';
      c3.className='lnpw-text';c3.textContent=x.signal.map(function(k){return NAMES[k][1];}).join(' + ');
      c4.textContent=x.reason.join('·')||'일반 기록';tr.append(c1,c2,c3,c4);tbody.appendChild(tr);
    });
    var rules=$('[data-ln-watch-rules]');rules.textContent='';
    KEYS.forEach(function(k){
      var x=res.totals[k],tr=document.createElement('tr');
      [NAMES[k][1],x.total,x.wins,x.total?(100*x.wins/x.total).toFixed(1)+'%':'—'].forEach(function(value){
        var td=document.createElement('td');td.textContent=value;tr.appendChild(td);
      });rules.appendChild(tr);
    });
  }
  async function load(force){
    if(busy || (!force&&Date.now()-checkedAt<21600000))return;
    busy=true;refreshButton.disabled=true;setText('[data-ln-watch-state]','공개 당첨번호와 패턴을 확인하고 있습니다…');
    var records=null,offline=false;
    try{
      var controller=new AbortController();var timeout=setTimeout(function(){controller.abort();},12000);
      try{
        var response=await fetch(SOURCE+'?v='+Math.floor(Date.now()/3600000),{cache:'no-store',mode:'cors',signal:controller.signal});
        if(!response.ok)throw new Error('HTTP '+response.status);
        records=await response.json();normalize(records);
        try{localStorage.setItem(CACHE,JSON.stringify(records));}catch(ignore){}
      }finally{clearTimeout(timeout);}
    }catch(error){
      try{records=JSON.parse(localStorage.getItem(CACHE)||'null');if(records)normalize(records);else throw new Error('캐시 없음');offline=true;}
      catch(err){setText('[data-ln-watch-state]','자료를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.');busy=false;refreshButton.disabled=false;return;}
    }
    try{
      // Yield to the page so the existing combination generator stays usable.
      await new Promise(function(resolve){setTimeout(resolve,0);});
      var analysis=analyze(records,901);render(analysis);
      setText('[data-ln-watch-state]',analysis.latest+'회까지 검증 완료 · '+analysis.target+'회 사전 패턴 추적'+(offline?' · 저장된 기록 사용':' · 최신 자료 확인'));
      checkedAt=Date.now();
    }catch(err){setText('[data-ln-watch-state]','패턴 분석 중 오류가 발생했습니다: '+err.message);}
    busy=false;refreshButton.disabled=false;
  }
  refreshButton.addEventListener('click',function(){load(true);});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)load(false);});
  var page=document.getElementById('watch');
  function isPageActive(){return !!(page&&page.classList.contains('active'));}
  if(page){new MutationObserver(function(){if(isPageActive())load(false);}).observe(page,{attributes:true,attributeFilter:['class']});}
  if(isPageActive())setTimeout(function(){load(false);},0);
})();

