/* LOTTO NOTE · Diagonal survival audit. Separate from ticket/exclusion state. */
(function(){
  'use strict';
  const ROOT='ln-diagonal-survival-v1';
  const SOURCE='https://smok95.github.io/lotto/results/all.json';
  const CACHE='lotto_diagonal_survival_verified_v1';
  const BASE=6/45;

  function normalize(raw){
    const a=Array.isArray(raw)?raw:raw&&raw.results;
    if(!Array.isArray(a)||a.length<900)throw Error('과거 자료가 부족합니다.');
    const rows=a.map(x=>({r:Number(x.draw_no),n:(x.numbers||[]).map(Number).sort((a,b)=>a-b)})).sort((a,b)=>a.r-b.r);
    for(let i=0;i<rows.length;i++){
      const x=rows[i];
      if(x.r!==i+1||x.n.length!==6||new Set(x.n).size!==6||x.n.some(n=>!Number.isInteger(n)||n<1||n>45))
        throw Error((i+1)+'회 기록이 잘못됐거나 누락됐습니다.');
    }
    return rows;
  }
  function setsOf(rows){
    const a=[];
    rows.forEach(x=>a[x.r]=new Set(x.n));
    return a;
  }
  // A true survival chain contains at least 4 confirmed winning numbers.
  // At target t we inspect only rounds < t. gap and slope must remain fixed.
  function scan(target,draws){
    const found=[];
    for(let gap=1;4*gap<target;gap++){
      const lastRound=draws[target-gap];
      if(!lastRound)continue;
      for(const last of lastRound){
        for(let slope=-14;slope<=14;slope++){
          if(slope===0)continue; // diagonal only; horizontal repeats are a separate signal.
          const next=last+slope;
          if(next<1||next>45)continue;
          let count=1;
          while(target-(count+1)*gap>=1 && draws[target-(count+1)*gap]?.has(last-count*slope))count++;
          if(count<4)continue;
          const sequence=[];
          for(let p=count;p>=1;p--)sequence.push({r:target-p*gap,n:next-p*slope});
          found.push({target,gap,slope,points:count,next,sequence});
        }
      }
    }
    return found.sort((a,b)=>b.points-a.points||a.gap-b.gap||a.next-b.next);
  }
  async function audit(rows,onProgress){
    const ds=setsOf(rows),latest=rows[rows.length-1].r,results=[],totals={fifth:{n:0,hit:0},sixth:{n:0,hit:0}};
    for(let t=5;t<=latest;t++){
      const items=scan(t,ds),actual=ds[t];
      const row={round:t,all:items.length,fifth:0,sixth:0,hit5:0,hit6:0,unique:new Set(),uniqueHit:new Set()};
      for(const x of items){
        const k=x.points===4?'fifth':'sixth',hit=actual.has(x.next);
        totals[k].n++;if(hit)totals[k].hit++;
        row[k]++;if(hit)row[k==='fifth'?'hit5':'hit6']++;
        row.unique.add(x.next);if(hit)row.uniqueHit.add(x.next);
      }
      results.push({round:t,all:row.all,fifth:row.fifth,sixth:row.sixth,hit5:row.hit5,hit6:row.hit6,
        unique:row.unique.size,uniqueHit:row.uniqueHit.size});
      if(t%25===0){if(onProgress)onProgress(t,latest);await new Promise(resolve=>setTimeout(resolve,0));}
    }
    return {results,totals};
  }
  if(typeof window!=='undefined'&&window.LN_SURVIVAL_TEST){window.LN_SURVIVAL_TEST_API={normalize,setsOf,scan,audit};return;}

  const watch=document.getElementById('watch');
  if(!watch||document.getElementById(ROOT))return;
  const host=document.createElement('section');host.id=ROOT;host.className='panel';host.setAttribute('aria-label','실제 당첨으로 이어진 대각선 생존 추적');
  host.innerHTML=`
    <style>
      #${ROOT}{margin:20px 0 30px;border:1px solid #4f6c88;background:#12283c;padding:18px;border-radius:16px;color:#e9f1fc}
      #${ROOT} h2{color:#ffdf9a;margin:0 0 8px;font-size:22px}#${ROOT} h3{color:#d6e6ff;font-size:17px;margin:19px 0 10px}
      #${ROOT} p{color:#b9c9df;font-size:13px;line-height:1.75;margin:8px 0}
      #${ROOT} .lnsv-stages{background:#0c1b2d;border-radius:12px;padding:12px 14px;color:#dbe8f8;font-size:13px;line-height:1.9;margin:14px 0}
      #${ROOT} .lnsv-stages b{color:#ffd88c}#${ROOT} .lnsv-head{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px}
      #${ROOT} button{border:1px solid #476788;border-radius:8px;padding:8px 12px;color:#e7f1ff;background:#203c57;cursor:pointer;font-size:13px;font-weight:700}
      #${ROOT} .lnsv-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:14px 0}
      #${ROOT} .lnsv-stat{background:#1a354e;border-radius:12px;padding:12px;min-width:0}#${ROOT} .lnsv-stat small{display:block;color:#c3d2e6;font-size:12px}
      #${ROOT} .lnsv-stat strong{display:block;color:#fff0cb;font-size:22px;font-weight:850}
      #${ROOT} .lnsv-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:9px}
      #${ROOT} .lnsv-card{background:#152f48;border:1px solid #436181;border-radius:12px;padding:12px;min-width:0}
      #${ROOT} .lnsv-card b{color:#ffe4ab;font-size:18px}#${ROOT} .lnsv-card small{color:#b8d0ec}
      #${ROOT} .lnsv-path{line-height:1.9;overflow-wrap:anywhere;font-size:12px;color:#dce8f8;margin-top:8px}
      #${ROOT} .lnsv-path strong{color:#f8c97c}#${ROOT} summary{color:#cce1ff;cursor:pointer;font-weight:750;font-size:14px}
      #${ROOT} details{margin-top:15px;border-top:1px solid #355374;padding-top:13px}
      #${ROOT} .lnsv-scroll{max-height:460px;overflow:auto;margin-top:10px}
      #${ROOT} table{border-collapse:collapse;font-size:12px;min-width:550px;width:100%;color:#e4eefb}
      #${ROOT} th{position:sticky;top:0;background:#25415e;color:#fff1d5;padding:8px;white-space:nowrap}
      #${ROOT} td{border-bottom:1px solid #34516c;padding:8px 6px;text-align:center;white-space:nowrap}
      #${ROOT} .lnsv-hit{color:#b0efcc;font-weight:800}
      #${ROOT} .lnsv-note{color:#b9c9df;font-size:12px;line-height:1.7}
      @media(max-width:560px){#${ROOT}{padding:13px;margin:16px 0}#${ROOT} h2{font-size:19px}#${ROOT} .lnsv-stats{gap:5px}#${ROOT} .lnsv-stat{padding:9px 7px}#${ROOT} .lnsv-stat strong{font-size:19px}#${ROOT} .lnsv-cards{grid-template-columns:1fr}}
    </style>
    <div class="lnsv-head"><div><h2>🔥 대각선 생존 추적 · 3→4→5→6…</h2>
    <p>검색에 반복 등장하는 번호가 아니라, <strong>실제 당첨번호로 대각선 연결이 연장된 경우</strong>만 다음 단계로 넘깁니다.</p></div>
    <button type="button" data-lnsv-refresh>연결 다시 확인</button></div>
    <div class="lnsv-stages">3점 연결 → <b>4번째 실제 당첨 확인</b> → <b>★ 5번째 도전</b> → 5번째도 당첨 → <b>🔥 6번째 도전</b> → 이후에도 같은 간격·변화폭으로 추적<br>
    한 번이라도 예상 위치에서 미당첨이면 해당 대각선 연결은 종료합니다. 회차 건너뛰기 간격(예: 64회)도 그대로 유지합니다.</div>
    <p data-lnsv-status>실제 당첨번호 자료를 준비하고 있습니다…</p>
    <div class="lnsv-stats"><div class="lnsv-stat"><small>★ 4→5 연결 도전</small><strong data-lnsv-five>—</strong></div>
    <div class="lnsv-stat"><small>🔥 5→6 이상 도전</small><strong data-lnsv-six>—</strong></div>
    <div class="lnsv-stat"><small>전체 연결 후보번호</small><strong data-lnsv-unique>—</strong></div></div>
    <h3>🔥 다섯 점 이상 생존한 연결</h3><div data-lnsv-cards class="lnsv-cards"></div>
    <details><summary>★ 4점 연결 후 5번째 도전 · 전체 보기 <span data-lnsv-five-count></span></summary>
      <p>실제 당첨으로 4점까지 연결된 패턴입니다. 다음 예정 번호가 아직 당첨됐다는 뜻이 아닙니다.</p>
      <div class="lnsv-scroll"><table><thead><tr><th>다음 번호</th><th>회차 간격</th><th>번호 변화폭</th><th>기존 연결</th></tr></thead><tbody data-lnsv-five-list></tbody></table></div></details>
    <details><summary>📊 지난 회차 생존·중단 전수 복기 <span data-lnsv-history-count></span></summary>
      <p>각 과거 회차의 <b>추첨 전까지 알려진 정보만</b> 사용해 다음 번호를 계산하고, 발표된 본번호와 대조합니다.</p>
      <p data-lnsv-score class="lnsv-note">연구 데이터를 계산하는 중입니다…</p>
      <div class="lnsv-scroll"><table><thead><tr><th>회차</th><th>4→5 도전</th><th>5번째 적중</th><th>5→6+ 도전</th><th>6번째+ 적중</th><th>고유 후보/적중</th></tr></thead><tbody data-lnsv-history></tbody></table></div></details>
    <p class="lnsv-note">★·🔥은 연결이 실제로 유지됐던 <b>과거 기록의 길이</b>만 구분합니다. 무작위 한 번호의 본번호 포함 기준은 6/45=13.3%이며, 긴 대각선이라도 당첨 가능성 상승이 검증된 것은 아닙니다.</p>
  `;
  const older=watch.querySelector('#ln-pattern-watch-v1');
  older?older.before(host):watch.appendChild(host);
  // Reclassify the previous labels as secondary overlap/repeat search evidence.
  if(older){
    const title=older.querySelector('h2');if(title)title.textContent='🔍 교차·반복 검색 (참고 기록)';
    const stat=older.querySelector('.lnpw-stat.focus small');if(stat)stat.textContent='★ 교차·반복 관찰';
    const note=document.createElement('p');note.textContent='아래 연속검색은 후보가 직전 검색에도 나왔다는 뜻으로, 위의 3→4→5 실제 당첨 연결 생존과는 다른 기준입니다.';
    note.className='lnpw-note';older.querySelector('.lnpw-head')?.after(note);
  }
  const $=s=>host.querySelector(s);
  const put=(s,v)=>{const n=$(s);if(n)n.textContent=String(v);};
  const safe=n=>Number(n).toLocaleString('ko-KR');
  let busy=false,checkedAt=0,run=0;
  function pathText(x){
    return x.sequence.map(p=>p.r+'회 '+p.n+'번').join(' → ')+' → '+x.target+'회 '+x.next+'번 ?';
  }
  function renderCurrent(target,chains){
    const fifth=chains.filter(x=>x.points===4),sixth=chains.filter(x=>x.points>=5),unique=new Set(chains.map(x=>x.next));
    put('[data-lnsv-five]',fifth.length+'개 연결');
    put('[data-lnsv-six]',sixth.length+'개 연결');
    put('[data-lnsv-unique]',unique.size+'수');
    put('[data-lnsv-five-count]','('+fifth.length+'건)');
    const cards=$('[data-lnsv-cards]');cards.textContent='';
    if(!sixth.length)cards.textContent='이번 회차에 5점 이상 생존한 대각선은 없습니다.';
    sixth.forEach(x=>{
      const div=document.createElement('div');div.className='lnsv-card';
      const title=document.createElement('b');title.textContent='🔥 '+x.next+'번 · '+x.points+'→'+(x.points+1)+'점 도전';
      const desc=document.createElement('p');desc.textContent='회차 +'+x.gap+' · 번호 '+(x.slope>0?'+':'')+x.slope;
      const path=document.createElement('div');path.className='lnsv-path';path.textContent=pathText(x);
      div.append(title,desc,path);cards.appendChild(div);
    });
    const list=$('[data-lnsv-five-list]');list.textContent='';
    fifth.forEach(x=>{
      const tr=document.createElement('tr');
      [x.next,'+'+x.gap,(x.slope>0?'+':'')+x.slope,pathText(x)].forEach(value=>{
        const td=document.createElement('td');td.textContent=value;tr.appendChild(td);
      });list.appendChild(tr);
    });
  }
  function renderHistory(data,latest){
    const totals=data.totals,score=$('[data-lnsv-score]');
    const pct=x=>x.n?(100*x.hit/x.n).toFixed(2)+'%':'—';
    score.textContent='과거 '+safe(latest)+'회까지 · 4→5 도전 '+safe(totals.fifth.n)+'건 중 실제 5번째 당첨 '+safe(totals.fifth.hit)+'건 ('+pct(totals.fifth)+') · 5→6 이상 도전 '+safe(totals.sixth.n)+'건 중 실제 연결 '+safe(totals.sixth.hit)+'건 ('+pct(totals.sixth)+'). 중복 패턴 건별 통계로, 무작위 기준 13.3%와 비교해 보세요.';
    put('[data-lnsv-history-count]','('+data.results.length+'개 회차)');
    const rows=$('[data-lnsv-history]');rows.textContent='';
    data.results.slice().reverse().forEach(x=>{
      const tr=document.createElement('tr');
      [x.round,x.fifth,x.hit5,x.sixth,x.hit6,x.unique+' / '+x.uniqueHit].forEach((value,i)=>{
        const td=document.createElement('td');td.textContent=value;
        if((i===2||i===4)&&Number(value)>0)td.className='lnsv-hit';tr.appendChild(td);
      });rows.appendChild(tr);
    });
  }
  async function drawData(force){
    if(!force){
      try{const stored=localStorage.getItem('lotto_note_verified_draws_v2')||localStorage.getItem(CACHE);if(stored)return normalize(JSON.parse(stored));}catch(_){}
    }
    const response=await fetch(SOURCE+'?v='+Math.floor(Date.now()/3600000),{cache:'no-store'});
    if(!response.ok)throw Error('자료 HTTP '+response.status);
    const rows=normalize(await response.json());
    try{localStorage.setItem(CACHE,JSON.stringify(rows.map(x=>({draw_no:x.r,numbers:x.n}))));}catch(_){}
    return rows;
  }
  async function load(force){
    if(busy||(!force&&Date.now()-checkedAt<21600000))return;
    busy=true;const token=++run;const refresh=$('[data-lnsv-refresh]');refresh.disabled=true;
    try{
      put('[data-lnsv-status]','실제 당첨번호로 대각선 연결 상태를 확인 중입니다…');
      const rows=await drawData(force),latest=rows[rows.length-1].r,target=latest+1;
      const current=scan(target,setsOf(rows));renderCurrent(target,current);
      put('[data-lnsv-status]',latest+'회까지 확인 · '+target+'회 다음 연결 추적 · '+current.length+'개 대각선');
      put('[data-lnsv-score]','1회부터 '+latest+'회까지 매 회차 사전 검증을 진행 중입니다…');
      const historical=await audit(rows,(done,end)=>{if(token===run)put('[data-lnsv-score]',done+' / '+end+'회 과거 복기 중…');});
      if(token===run){renderHistory(historical,latest);checkedAt=Date.now();}
    }catch(e){put('[data-lnsv-status]','대각선 추적 오류: '+e.message);}
    busy=false;refresh.disabled=false;
  }
  $('[data-lnsv-refresh]').addEventListener('click',()=>load(true));
  function active(){return watch.classList.contains('active');}
  new MutationObserver(()=>{if(active())load(false);}).observe(watch,{attributes:true,attributeFilter:['class']});
  if(active())setTimeout(()=>load(false),0);
})();
