/* LOTTO NOTE: one comparison view for every search family. No ticket state writes. */
(function(){
  'use strict';
  const ID='ln-all-pattern-survival';
  const CODES=[
    ['F','fixed_phase4','정간격 4회','고정 회차간격에서 같은 번호를 연장'],
    ['D','long_diagonal5','사선 5점','건너뛰기 대각선의 5점 연결'],
    ['R','recent_diagonal3','직전 3회 사선','직전 세 회차의 같은 이동폭'],
    ['G','repeat_gap','출현 간격 반복','마지막 세 번의 실제 출현 간격이 동일'],
    ['N','both_neighbors','양옆 번호','직전 당첨의 양옆 번호로 가운데를 검색'],
    ['B','bonus_transition','보너스 전환','보너스 번호가 앞선 두 회차 본번호와 연결'],
    ['A','rank_aba','자리 ABA','정렬된 1~6구에서 A-B-A 흐름']
  ];
  const GROUP_ORDER=['고정위상','변화간격','사선','자리순서2','자리순서3','자리이동방향','자리공백','출현간격연결','간격연속3','이웃자리아래','이웃자리위','끝수자리','끝수이웃순서','이웃끝수순서','이웃수방향','보너스이동','본보이동','양옆이웃','이웃대체2','이웃대체3','이웃대체10','동일자리4'];
  const BASE=6/45;
  if(typeof window!=='undefined'&&window.LN_ALL_SURVIVAL_TEST){window.LN_ALL_SURVIVAL_TEST_API={indexDraws,nominate,structural,replay};return;}
  const rootPage=document.getElementById('watch');
  if(!rootPage||document.getElementById(ID))return;
  const host=document.createElement('section');host.id=ID;host.className='panel';
  host.innerHTML=`
    <style>
      #${ID}{border:1px solid #b79560;background:#14283f;padding:18px;border-radius:16px;margin:20px 0;color:#e5f0ff}
      #${ID} *{box-sizing:border-box}#${ID} h2{color:#ffe1a4;font-size:22px;margin:2px 0 10px}
      #${ID} p{color:#c8d6e8;font-size:13px;line-height:1.7;margin:8px 0}
      #${ID} h3{font-size:17px;color:#f0dfb5;margin:18px 0 10px}
      #${ID} .lnall-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
      #${ID} button{background:#244362;border:1px solid #6385a4;color:#f7e9c5;border-radius:9px;padding:8px 12px;cursor:pointer;font-size:12px}
      #${ID} button:disabled{opacity:.6}#${ID} .lnall-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:13px 0}
      #${ID} .lnall-tile{background:#1d3853;border-radius:12px;padding:11px;min-width:0}
      #${ID} .lnall-tile small{display:block;color:#b9cde2;font-size:11px}#${ID} .lnall-tile b{color:#ffdfa1;display:block;font-size:21px;margin-top:5px}
      #${ID} .lnall-scroll{overflow-x:auto;max-height:540px;overflow-y:auto;margin:9px 0}
      #${ID} table{width:100%;min-width:650px;border-collapse:collapse;font-size:12px}
      #${ID} th{background:#284765;color:#ffecbd;position:sticky;top:0;padding:9px 6px;white-space:nowrap;text-align:center}
      #${ID} td{border-bottom:1px solid #36516a;padding:9px 6px;text-align:center;vertical-align:middle}
      #${ID} td.left{text-align:left;min-width:170px}#${ID} td.nums{text-align:left;min-width:100px;white-space:normal;line-height:1.55;max-width:230px}
      #${ID} .lnall-rule{color:#fff0c9;font-weight:800}#${ID} .lnall-good{color:#87efc5;font-weight:750}
      #${ID} .lnall-tag{display:inline-block;background:#4c351d;border:1px solid #ab7d46;color:#ffe3ad;border-radius:8px;padding:3px 6px;font-size:11px}
      #${ID} .lnall-muted{font-size:11px;color:#aabdd3}#${ID} details{border-top:1px solid #39546e;margin-top:14px;padding-top:12px}
      #${ID} summary{cursor:pointer;color:#e4d5b8;font-size:15px;font-weight:780}
      #${ID} .lnall-status{color:#b8d2ea}#${ID} .lnall-keys{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
      #${ID} .lnall-key{background:#203e5b;border:1px solid #466383;color:#e7f3ff;border-radius:8px;font-size:11px;padding:5px 7px}
      #${ID} .lnall-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px;margin-top:10px}
      #${ID} .lnall-card{border:1px solid #496680;background:#1a354f;border-radius:12px;padding:12px}
      #${ID} .lnall-card strong{color:#ffdb93}#${ID} .lnall-card small{color:#b5cae2;display:block;margin-top:6px;line-height:1.7}
      #${ID} .lnall-matrix{width:100%;min-width:810px}#${ID} .lnall-matrix td{font-size:12px}
      #${ID} .lnall-matrix .lnall-matrix-rule{text-align:left;font-weight:700;min-width:165px}
      #${ID} .lnall-matrix .lnall-hit{color:#85f4bd;font-weight:800}#${ID} .lnall-matrix .lnall-miss{color:#fc9c97}
      #${ID} .lnall-filter{display:flex;flex-wrap:wrap;gap:7px;margin:9px 0}
      #${ID} .lnall-filter button[aria-pressed=true]{background:#7a4c1c;border-color:#edb969;color:#fff4d6}
      #${ID} .lnall-visual-scroll{overflow:auto;max-height:590px;border-radius:14px;background:#10253b;border:1px solid #45617b;margin:10px 0}
      #${ID} .lnall-visual-scroll svg{display:block;min-width:780px;width:100%;height:auto}
      #${ID} .lnall-visual-keys{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:#dbe8f4;margin:9px 0}
      #${ID} .lnall-visual-keys span{display:flex;align-items:center;gap:5px}
      #${ID} .lnall-dot{display:inline-block;width:12px;height:12px;border-radius:4px}
      #${ID} .lnall-path-control{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:10px 0}
      #${ID} .lnall-path-control select{min-width:190px;flex:1;background:#244362;color:#ffeac1;border:1px solid #6385a4;border-radius:9px;padding:9px}
      #${ID} .lnall-path-view{background:#112943;border:1px solid #41617e;border-radius:13px;overflow:auto;padding:6px}
      #${ID} .lnall-path-view svg{display:block;width:100%;min-width:540px;height:auto}
      @media(max-width:560px){#${ID}{padding:13px}#${ID} h2{font-size:19px}#${ID} .lnall-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
    </style>
    <div class="lnall-head"><div><h2>🧬 전체 검색패턴 생존·중단 비교</h2>
      <p>대각선만 따로 보지 않고, <b>7개 패턴 · 기본 45개 조건 · 번호별 동적 검색 · 16개 분석 모듈</b>을 한곳에서 대조합니다.</p></div>
      <button type="button" data-lnall-refresh>전체 다시 분석</button></div>
    <p class="lnall-status" data-lnall-status>기존 검색기 자료를 확인 중입니다…</p>
    <div class="lnall-stats">
      <div class="lnall-tile"><small>당번 동반 검색 규칙</small><b>7 / 7</b></div>
      <div class="lnall-tile"><small>기본 조건 전수</small><b>45 / 45</b></div>
      <div class="lnall-tile"><small>분석 모듈 비교</small><b>16 / 16</b></div>
      <div class="lnall-tile"><small>실제 연결 4점 이상</small><b data-lnall-struct>—</b></div>
    </div>
    <h3>한눈에: 모든 검색규칙 생존·중단 이력</h3>
    <p>아래는 대각선뿐 아니라 <b>7개 검색 · 기본 45개 · 현재 발동한 동적 검색 · 16개 모듈</b>을 한 표로 나열한 것입니다. 각 회차의 ✅는 그 패턴 후보에 실제 당번이 포함된 경우, ✖는 후보가 있었지만 맞지 않은 경우, —는 후보나 회차별 결과가 없는 경우입니다. <b>3회 이상 연속 ✅은 🔥, 직전 ✅은 ★, 직전 ✖는 끊김</b>으로 표시합니다. 다만 후보가 많은 규칙일수록 ✅가 쉬워집니다.</p>
    <div class="lnall-filter" data-lnall-filters>
      <button type="button" data-lnall-filter="all" aria-pressed="true">전체</button>
      <button type="button" data-lnall-filter="alive" aria-pressed="false">🔥 연속 생존</button>
      <button type="button" data-lnall-filter="recent" aria-pressed="false">★ 직전 당번</button>
      <button type="button" data-lnall-filter="stopped" aria-pressed="false">✖ 끊김</button>
      <button type="button" data-lnall-filter="untracked" aria-pressed="false">— 미추적</button>
    </div>
    <p data-lnall-matrix-count>패턴 자료를 취합 중입니다…</p>
    <div class="lnall-visual-keys"><span><i class="lnall-dot" style="background:#39b988"></i> 당번 포함</span><span><i class="lnall-dot" style="background:#e77571"></i> 당번 미포함</span><span><i class="lnall-dot" style="background:#41556d"></i> 해당 회차 미발동·미추적</span><span>💛 오른쪽 끝 = 다음 회차 후보</span></div>
    <div class="lnall-visual-scroll" data-lnall-heatmap-wrap><div data-lnall-heatmap>과거 회차별 패턴 그림을 만드는 중입니다…</div></div>
    <details><summary>숫자와 적중 건수를 글자 표로도 확인하기</summary><div class="lnall-scroll"><table class="lnall-matrix"><thead><tr><th>분류</th><th>검색패턴</th><th data-lnall-r="0">직전 5회</th><th data-lnall-r="1">직전 4회</th><th data-lnall-r="2">직전 3회</th><th data-lnall-r="3">직전 2회</th><th data-lnall-r="4">직전 회차</th><th data-lnall-target>이번 회차 후보</th><th>생존 상태</th></tr></thead><tbody data-lnall-matrix></tbody></table></div></details>
    <h3>① 실제 당첨으로 이어진 구조적 연결 · 전체</h3>
    <p>★는 4점까지 실제 당첨으로 이어져 5번째를 기다리는 연결, 🔥는 5점 이상까지 이어진 연결입니다. 같은 번호의 정간격(F)과 서로 다른 번호의 사선(D·R)을 모두 검색합니다. G(실제 출현 간격 반복)는 아래 7패턴에서 별도 판정합니다.</p>
    <div class="lnall-path-control"><button type="button" data-lnall-path-prev>◀ 이전 연결</button><select data-lnall-path-select aria-label="추적할 연속패턴 선택"><option>연결 검색 중…</option></select><button type="button" data-lnall-path-next>다음 연결 ▶</button></div>
    <div class="lnall-path-view" data-lnall-path-chart>실제 당번 연결을 그리는 중입니다…</div>
    <p data-lnall-path-caption>연속 흐름을 선택하면 과거 실제 당번과 다음 후보를 연결선으로 표시합니다.</p>
    <div data-lnall-struct-list class="lnall-cards"></div>
    <details><summary>구조적 연결 전체 보기 · 4점 이상</summary><div class="lnall-scroll"><table><thead><tr><th>상태</th><th>패턴</th><th>다음 번호</th><th>회차 간격</th><th>번호 변화</th><th>연결 기록</th></tr></thead><tbody data-lnall-struct-rows></tbody></table></div></details>
    <h3>② 7개 패턴 사전검색 → 실제 당번 동반 비교</h3>
    <p>예상번호를 추첨 전 계산한 뒤 당첨 여부를 기록합니다. <b>연속 성공 회차</b>는 그 검색 규칙에서 실제 당첨 포함이 이어진 회수이며, 대각선의 점 연결과는 별개입니다.</p>
    <div class="lnall-scroll"><table><thead><tr><th>규칙</th><th>이번 회차 후보번호</th><th>최근 당첨 동반 연속</th><th>과거 후보 적중</th><th>상태</th></tr></thead><tbody data-lnall-seven></tbody></table></div>
    <details><summary>📒 7패턴 회차별 성공·실패 기록 (최근 30회)</summary><div class="lnall-scroll"><table><thead><tr><th>회차</th>${CODES.map(x=>'<th>'+x[0]+'</th>').join('')}</tr></thead><tbody data-lnall-seven-history></tbody></table></div></details>
    <h3>③ 기본 45개 검색조건 · 모두 같은 기준</h3>
    <p>공백·재출현·이웃수·끝수·동일구간·출현횟수·교차 등 45개 조건을 1~45번에 동일 적용합니다. <b>조건별 적중 비율</b>과 후보 수를 비교하며, 조건이 넓어서 당첨을 자주 포함하는 경우를 구별합니다.</p>
    <div class="lnall-keys" data-lnall-base-categories></div>
    <details><summary>기본 45개 조건의 후보·당첨·미당첨 전체 표 펼치기</summary><div class="lnall-scroll"><table><thead><tr><th>조건</th><th>현재 후보 수</th><th>과거 적중 / 후보</th><th>적중 비율</th><th>최근 연속</th></tr></thead><tbody data-lnall-base></tbody></table></div></details>
    <h3>④ 자동 발견된 번호별 추가 패턴 · 전체 분류</h3>
    <p>자리·출현 간격·보너스 이동·이웃 대체·대각선 등 <b>현재 검색기에서 실제 발동한 동적 규칙</b>을 빠짐없이 분류합니다. 과거 적중과 최근 연속 동반도 보여주지만, 현재 규칙으로 과거를 다시 고른 <b>사후검색</b>이라 독립적인 예측 검증과는 구분합니다.</p>
    <div class="lnall-keys" data-lnall-dynamic-categories></div>
    <details><summary>동적 검색 분류별 현재 번호·실제 동반 기록 모두 보기</summary><div class="lnall-scroll"><table><thead><tr><th>검색 분류</th><th>발동 규칙</th><th>번호 수</th><th>최근 당번 동반</th><th>과거 적중 / 후보</th><th>이번 후보번호</th></tr></thead><tbody data-lnall-dynamic></tbody></table></div></details>
    <h3>⑤ 16개 분석 모듈 · 번호형과 집합형 구별</h3>
    <p>16개 모듈도 모두 나열합니다. <b>번호 직접</b>형과 <b>집합 관찰</b>형은 평가 단위가 달라 같은 ‘당첨수’로 섞지 않습니다.</p>
    <div class="lnall-keys" data-lnall-modules-categories></div>
    <details><summary>16개 모듈별 과거 당번 동반 기록 전부 보기</summary><div class="lnall-scroll"><table><thead><tr><th>모듈</th><th>분석 대상</th><th>관찰 항목</th><th>과거 당번 / 사례</th><th>번호 직접 후보</th></tr></thead><tbody data-lnall-modules></tbody></table></div></details>
    <p class="lnall-muted">연결 생존(★·🔥), 같은 규칙의 회차별 당번 동반, 과거 사후검색은 서로 다른 개념입니다. 고정수·제외수·최종 5조합을 자동 변경하지 않습니다. 개별 후보의 무작위 당번 포함 기준은 6/45=13.33%입니다.</p>
  `;
  const older=rootPage.querySelector('#ln-diagonal-survival-v1')||rootPage.querySelector('#ln-pattern-watch-v1');
  older?older.before(host):rootPage.append(host);
  // Retain original details, but let the user see a single unified overview first.
  [['#ln-diagonal-survival-v1','↘ 대각선 세부 연결 기록 열기'],
    ['#ln-pattern-watch-v1','📚 기존 7패턴 검색·용어·기록 열기']].forEach(([selector,title])=>{
    const node=rootPage.querySelector(selector);if(!node)return;
    const fold=document.createElement('details');fold.className='lnall-old-section';
    fold.style.cssText='margin:14px 0;border:1px solid #385470;border-radius:12px;padding:12px;background:#182d44;color:#e6eeff';
    const summary=document.createElement('summary');summary.textContent=title;summary.style.cssText='cursor:pointer;font-weight:800';
    node.before(fold);fold.append(summary,node);
  });
  const $=s=>host.querySelector(s);
  const put=(s,t)=>{const e=$(s);if(e)e.textContent=String(t);};
  const uniq=a=>[...new Set(a)].sort((a,b)=>a-b);
  const list=a=>a.length?a.join(', '):'—';
  const percent=(w,n)=>n?(100*w/n).toFixed(2)+'%':'—';
  const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const NS='http://www.w3.org/2000/svg';
  const svgEl=(tag,attrs={},content)=>{
    const el=document.createElementNS(NS,tag);
    Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));
    if(content!==undefined)el.textContent=String(content);
    return el;
  };

  function indexDraws(rows){
    const d={bonus:[],sorted:[]};
    rows.forEach(x=>{d[x.draw_no]=new Set(x.numbers);d.bonus[x.draw_no]=x.bonus_no;d.sorted[x.draw_no]=x.numbers;});
    return d;
  }
  // These seven rules reproduce the visible PATTERN WATCH definitions exactly.
  function nominate(t,d){
    const sig={};CODES.forEach(x=>sig[x[1]]=new Set());
    if(t<4)return sig;
    const has=(r,n)=>!!(d[r]&&d[r].has(n));
    for(let gap=1;gap*4<t;gap++)d[t-gap]?.forEach(n=>{
      if(has(t-gap*2,n)&&has(t-gap*3,n)&&has(t-gap*4,n))sig.fixed_phase4.add(n);
    });
    for(let gap=1;gap*5<t;gap++)d[t-gap]?.forEach(first=>{
      for(let k=-10;k<=10;k++){
        if(k===0)continue;const n=first+k;
        if(n<1||n>45||n-5*k<1||n-5*k>45)continue;
        if(has(t-2*gap,n-2*k)&&has(t-3*gap,n-3*k)&&has(t-4*gap,n-4*k)&&has(t-5*gap,n-5*k))sig.long_diagonal5.add(n);
      }
    });
    d[t-1]?.forEach(first=>{
      for(let k=-10;k<=10;k++){
        if(!k)continue;const n=first+k;
        if(n>=1&&n<=45&&n-3*k>=1&&n-3*k<=45&&has(t-2,n-2*k)&&has(t-3,n-3*k))sig.recent_diagonal3.add(n);
      }
    });
    for(let n=1;n<=45;n++){
      const hits=[];
      for(let r=t-1;r>=1&&hits.length<3;r--)if(has(r,n))hits.push(r);
      if(hits.length===3&&hits[0]-hits[1]===hits[1]-hits[2]&&t-hits[0]===hits[0]-hits[1])sig.repeat_gap.add(n);
      if(n>1&&n<45&&has(t-1,n-1)&&has(t-1,n+1))sig.both_neighbors.add(n);
    }
    const b=d.bonus[t-1];if(has(t-2,b)&&has(t-3,b))sig.bonus_transition.add(b);
    for(let p=0;p<6;p++)if(d.sorted[t-3]?.[p]===d.sorted[t-1]?.[p])sig.rank_aba.add(d.sorted[t-2][p]);
    return sig;
  }

  // Each structural path has one immutable (draw gap, number shift) identity.
  function structural(t,d){
    const out=[];
    for(let gap=1;gap*4<t;gap++){
      const prev=d[t-gap];if(!prev)continue;
      for(const last of prev){
        for(let shift=-14;shift<=14;shift++){
          const next=last+shift;if(next<1||next>45)continue;
          let count=1;
          while(t-(count+1)*gap>=1&&d[t-(count+1)*gap]?.has(last-count*shift))count++;
          if(count<4)continue;
          const steps=[];for(let k=count;k>=1;k--)steps.push({r:t-k*gap,n:next-k*shift});
          out.push({gap,shift,next,count,steps,family:shift===0?'F 정간격':gap===1?'R 최근 사선':'D 건너뛰기 사선'});
        }
      }
    }
    return out.sort((a,b)=>b.count-a.count||a.gap-b.gap||a.next-b.next);
  }

  function seed(){return {nom:0,hit:0,streak:0,history:[],any:0,rounds:0};}
  function advance(s,nums,winning,round){
    const arr=Array.from(nums),hits=arr.filter(n=>winning.has(n));
    s.nom+=arr.length;s.hit+=hits.length;s.rounds++;
    if(hits.length){s.streak++;s.any++;}else{s.streak=0;}
    s.history.push({round,candidates:arr.length,hits:hits.length,hitNums:hits});
  }

  async function replay(rows,baseRules,onProgress){
    const byDraw=indexDraws(rows),watch=CODES.map(()=>seed()),basic=baseRules.map(()=>seed());
    const start=15;
    for(let i=start;i<rows.length;i++){
      const target=i+1,win=byDraw[target],nom=nominate(target,byDraw);
      CODES.forEach((code,j)=>advance(watch[j],nom[code[1]],win,target));
      for(let r=0;r<baseRules.length;r++){
        const rule=baseRules[r],nums=[];
        for(let n=1;n<=45;n++)if(rule.test(rows,i,n))nums.push(n);
        advance(basic[r],nums,win,target);
      }
      if(i%20===0){if(onProgress)onProgress(i+1,rows.length);await new Promise(resolve=>setTimeout(resolve,0));}
    }
    return {watch,basic};
  }

  let busy=false,last=0,completed=-1,matrixFilter='all',matrixData=[],matrixTarget=0,structurePaths=[],structureTarget=0,pathIndex=0;
  function addCells(tr,values){values.forEach((value,j)=>{
    const td=document.createElement('td');td.textContent=value;
    if(j===0)td.className='left';if(j===1)td.className='nums';
    tr.append(td);
  });}
  function renderStructural(target,items){
    structurePaths=items;structureTarget=target;pathIndex=0;
    const star=items.filter(x=>x.count===4),fire=items.filter(x=>x.count>=5);
    put('[data-lnall-struct]',items.length+'개');
    const cards=$('[data-lnall-struct-list]');cards.textContent='';
    const groups=[['F · 같은 번호 정간격',items.filter(x=>x.shift===0)],['D·R · 번호 이동 사선',items.filter(x=>x.shift!==0)]];
    groups.forEach(([name,xs])=>{
      const card=document.createElement('div');card.className='lnall-card';
      const title=document.createElement('strong');title.textContent=name;
      const detail=document.createElement('small');detail.textContent='★ 4점→5점 도전 '+xs.filter(x=>x.count===4).length+'건 · 🔥 5점 이상→다음 '+xs.filter(x=>x.count>=5).length+'건';
      const nums=document.createElement('small');nums.textContent='현재 후보 '+list(uniq(xs.map(x=>x.next)));
      card.append(title,detail,nums);cards.append(card);
    });
    const body=$('[data-lnall-struct-rows]');body.textContent='';
    items.forEach(x=>{
      const tr=document.createElement('tr');
      const p=x.steps.map(y=>y.r+'회 '+y.n+'번').join(' → ');
      addCells(tr,[(x.count>=5?'🔥':'★')+' '+x.count+'→'+(x.count+1),x.family,x.next+'번',x.gap+'회',x.shift>0?'+'+x.shift:String(x.shift),p+' → '+target+'회 '+x.next+'번?']);
      body.append(tr);
    });
    const select=$('[data-lnall-path-select]');select.textContent='';
    items.forEach((x,i)=>{
      const opt=document.createElement('option');opt.value=String(i);
      opt.textContent=(x.count>=5?'🔥 ':'★ ')+x.family+' · '+x.count+'점 · 다음 '+x.next+'번 · '+x.gap+'회 간격';
      select.append(opt);
    });
    renderPathDiagram(target);
  }

  function renderPathDiagram(target){
    const hostNode=$('[data-lnall-path-chart]');hostNode.textContent='';
    const item=structurePaths[pathIndex];if(!item){hostNode.textContent='현재 4점 이상 이어진 연결 없음';return;}
    $('[data-lnall-path-select]').value=String(pathIndex);
    const pts=[...item.steps,{r:target,n:item.next,pending:true}];
    const svg=svgEl('svg',{viewBox:'0 0 900 273',role:'img','aria-label':item.family+' 실제 당첨 '+item.count+'점 연결과 다음 '+item.next+'번 후보'});
    svg.append(svgEl('rect',{x:0,y:0,width:900,height:273,fill:'#112943'}));
    svg.append(svgEl('text',{x:24,y:27,fill:'#ffe6b1','font-size':18,'font-weight':800},(item.count>=5?'🔥 ':'★ ')+item.family+' · 실제 '+item.count+'점 연속 · 다음 '+(item.count+1)+'점 확인'));
    [1,15,30,45].forEach(n=>{
      const y=211-(n-1)*3.33;
      svg.append(svgEl('line',{x1:48,y1:y,x2:865,y2:y,stroke:'#30445e','stroke-dasharray':'4 6'}));
      svg.append(svgEl('text',{x:13,y:y+4,fill:'#839db9','font-size':11},n));
    });
    const xy=pts.map((p,i)=>({x:78+i*755/(pts.length-1),y:211-(p.n-1)*3.33}));
    for(let i=1;i<xy.length;i++){
      svg.append(svgEl('line',{x1:xy[i-1].x,y1:xy[i-1].y,x2:xy[i].x,y2:xy[i].y,stroke:i===xy.length-1?'#ffd56e':'#48d2a2','stroke-width':4,'stroke-linecap':'round','stroke-dasharray':i===xy.length-1?'8 6':'none'}));
    }
    pts.forEach((p,i)=>{
      const {x,y}=xy[i],pending=!!p.pending;
      svg.append(svgEl('circle',{cx:x,cy:y,r:11,fill:pending?'#112943':'#40c99d',stroke:pending?'#ffd56e':'#b6ffe8','stroke-width':pending?4:2}));
      svg.append(svgEl('text',{x,y:y-18,'text-anchor':'middle',fill:pending?'#ffe1a1':'#f3fff9','font-size':16,'font-weight':800},p.n+'번'+(pending?'?':'')));
      svg.append(svgEl('text',{x,y:256,'text-anchor':'middle',fill:pending?'#ffdc8e':'#b1c5da','font-size':12},p.r+'회'));
    });
    hostNode.append(svg);
    put('[data-lnall-path-caption]',`${item.family} · 회차 간격 ${item.gap} · 번호 이동 ${item.shift>0?'+':''}${item.shift} · 초록 원은 실제 본당첨, 노란 빈 원은 ${target}회 검증을 기다리는 ${item.next}번 후보입니다. 다음 회차의 출현이 보장되지는 않습니다.`);
  }
  $('[data-lnall-path-prev]').addEventListener('click',()=>{if(!structurePaths.length)return;pathIndex=(pathIndex-1+structurePaths.length)%structurePaths.length;renderPathDiagram(structureTarget);});
  $('[data-lnall-path-next]').addEventListener('click',()=>{if(!structurePaths.length)return;pathIndex=(pathIndex+1)%structurePaths.length;renderPathDiagram(structureTarget);});
  $('[data-lnall-path-select]').addEventListener('change',e=>{pathIndex=Number(e.target.value);if(structurePaths.length)renderPathDiagram(structureTarget);});

  function renderSeven(current,history,rows){
    const body=$('[data-lnall-seven]');body.textContent='';
    const recentBody=$('[data-lnall-seven-history]');recentBody.textContent='';
    CODES.forEach(([code,key,name,meaning],i)=>{
      const st=history&&history.watch[i],nums=uniq([...current[key]]),tr=document.createElement('tr');
      const status=st?(st.streak>=3&&nums.length?'★ 연속 동반':st.streak>0&&nums.length?'관찰 유지':'다음 도전'):'복기 계산 중';
      addCells(tr,[code+' · '+name,list(nums),st?st.streak+'회':'계산 중',st?st.hit+'/'+st.nom+' ('+percent(st.hit,st.nom)+')':'계산 중',status]);
      tr.cells[0].title=meaning;body.append(tr);
    });
    if(!history)return;
    const records=history.watch[0].history.slice(-30).reverse();
    records.forEach((x,j)=>{
      const tr=document.createElement('tr');
      const arr=[String(x.round)];
      history.watch.forEach(st=>{
        const row=st.history[st.history.length-1-j];
        arr.push(row.candidates===0?'—':row.hits?'✅ '+row.hitNums.join('·'):'✖ '+row.candidates+'수');
      });
      addCells(tr,arr);recentBody.append(tr);
    });
  }

  function renderBase(rules,cur,history){
    const stats=$('[data-lnall-base-categories]');stats.textContent='';
    const groups=new Map();
    rules.forEach((r,i)=>{
      const arr=groups.get(r.group)||[];arr.push({r,i});groups.set(r.group,arr);
    });
    groups.forEach((items,name)=>{
      const span=document.createElement('span');span.className='lnall-key';
      span.textContent=name+' '+items.length+'종';stats.append(span);
    });
    const body=$('[data-lnall-base]');body.textContent='';
    rules.forEach((r,j)=>{
      const st=history&&history.basic[j],tr=document.createElement('tr');
      const status=st?st.streak>=3?' · 최근 '+st.streak+'회 연속 당번 동반':'':' · 계산 중';
      addCells(tr,[r.group+' · '+r.label.replace('{n}','번호'),cur[j].length+'수',st?st.hit+' / '+st.nom:'계산 중',st?percent(st.hit,st.nom):'—',st?st.streak+'회':'—']);
      tr.cells[0].title=r.why||'';tr.cells[1].title=list(cur[j]);
      if(st?.streak>=3)tr.cells[4].className='lnall-good';body.append(tr);
    });
  }

  function renderDynamic(profiles){
    const map=new Map();
    profiles.forEach(p=>p.list.forEach(e=>{
      if(!e.rule.dynamic)return;
      const g=e.rule.group,a=map.get(g)||{rules:0,nums:new Set(),events:new Map()};
      a.rules++;a.nums.add(p.n);
      // Candidate and result pairs are deduplicated by draw+number, although rules are selected retrospectively.
      (e.events||[]).forEach(ev=>{
        const round=Number(ev.i),old=a.events.get(round)||{candidates:new Set(),wins:new Set()};
        old.candidates.add(p.n);if(ev.hit)old.wins.add(p.n);
        a.events.set(round,old);
      });
      map.set(g,a);
    }));
    const body=$('[data-lnall-dynamic]'),chips=$('[data-lnall-dynamic-categories]');body.textContent='';chips.textContent='';
    const ordered=[...map].sort((a,b)=>{
      const ai=GROUP_ORDER.indexOf(a[0]),bi=GROUP_ORDER.indexOf(b[0]);
      return (ai<0?999:ai)-(bi<0?999:bi)||a[0].localeCompare(b[0],'ko');
    });
    ordered.forEach(([g,x])=>{
      const tr=document.createElement('tr');const nums=uniq([...x.nums]);
      let wins=0,cases=0,streak=0;
      x.events.forEach(v=>{wins+=v.wins.size;cases+=v.candidates.size;});
      let idx=state.draws.length-1;
      while(x.events.get(idx)?.wins.size){streak++;idx--;}
      addCells(tr,[g,x.rules+'개',nums.length+'수',streak+'회',wins+' / '+cases+' ('+percent(wins,cases)+')',list(nums)]);body.append(tr);
      const chip=document.createElement('span');chip.className='lnall-key';chip.textContent=(streak>=2?'★ ':'')+g+' '+nums.length+'수'+(streak?' · 연속 '+streak:'');chips.append(chip);
    });
    if(!ordered.length)chips.textContent='현재 발동한 동적 규칙 없음';
  }

  function renderModules(mods){
    const body=$('[data-lnall-modules]'),chips=$('[data-lnall-modules-categories]');body.textContent='';chips.textContent='';
    mods.forEach((mod,i)=>{
      const nums=uniq(mod.items.filter(x=>Number.isInteger(x.n)&&x.n>=1&&x.n<=45).map(x=>x.n));
      const audits=mod.items.map(x=>x.audit).filter(x=>x&&Number.isFinite(x.cases));
      const attempts=audits.reduce((acc,x)=>acc+x.cases,0),hits=audits.reduce((acc,x)=>acc+x.wins,0);
      const rate=audits.length?hits+' / '+attempts+' ('+percent(hits,attempts)+') · 중복 가능':'집합 관찰 / 사례 없음';
      const tr=document.createElement('tr');addCells(tr,[(i+1)+'. '+mod.name,mod.scope,mod.items.length+'개',rate,list(nums)]);body.append(tr);
      const chip=document.createElement('span');chip.className='lnall-key';chip.textContent=(i+1)+'. '+mod.name+' '+mod.items.length;chips.append(chip);
    });
  }

  function renderMatrixRows(){
    const body=$('[data-lnall-matrix]');body.textContent='';
    const filtered=matrixData.filter(x=>matrixFilter==='all'||x.kind===matrixFilter);
    const rank={alive:0,recent:1,stopped:2,untracked:3};
    filtered.sort((a,b)=>rank[a.kind]-rank[b.kind]||a.familyOrder-b.familyOrder||a.name.localeCompare(b.name,'ko'));
    const fragment=document.createDocumentFragment();
    filtered.forEach(x=>{
      const tr=document.createElement('tr');const vals=[x.family,x.name,...x.history,x.candidates,x.label];
      vals.forEach((v,j)=>{
        const td=document.createElement('td');td.textContent=String(v);if(j===1)td.className='lnall-matrix-rule';
        if(j>=2&&j<=6)td.classList.add(v.startsWith('✅')?'lnall-hit':v.startsWith('✖')?'lnall-miss':'lnall-muted');
        tr.append(td);
      });
      tr.title=x.note||'';fragment.append(tr);
    });body.append(fragment);
    renderHeatmap(filtered);
    const totals={alive:0,recent:0,stopped:0,untracked:0};matrixData.forEach(x=>totals[x.kind]++);
    put('[data-lnall-matrix-count]',`전체 ${matrixData.length}개 규칙 중 🔥 연속 ${totals.alive}개 · ★ 직전 당번 ${totals.recent}개 · ✖ 끊김 ${totals.stopped}개 · — 미발동·회차 미추적 ${totals.untracked}개 · 현재 표시 ${filtered.length}개`);
    $('[data-lnall-filters]').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lnallFilter===matrixFilter)));
  }

  function renderHeatmap(rows){
    const node=$('[data-lnall-heatmap]');node.textContent='';
    if(!rows.length){node.textContent='이 조건에 해당하는 검색패턴이 없습니다.';return;}
    const width=1100,rowHeight=33,top=49,height=top+rows.length*rowHeight+12;
    const svg=svgEl('svg',{viewBox:`0 0 ${width} ${height}`,role:'img','aria-label':'전체 검색패턴의 최근 다섯 회차 당번 포함 여부를 색으로 비교한 지도'});
    svg.append(svgEl('rect',{width,height,fill:'#11253c'}));
    svg.append(svgEl('text',{x:18,y:29,fill:'#cbd9e8','font-size':14,'font-weight':750},'분류'));
    svg.append(svgEl('text',{x:135,y:29,fill:'#cbd9e8','font-size':14,'font-weight':750},'검색패턴'));
    for(let i=0;i<5;i++)svg.append(svgEl('text',{x:480+102*i,y:29,fill:'#ffe1ab','text-anchor':'middle','font-size':14,'font-weight':800},(matrixTarget-5+i)+'회'));
    svg.append(svgEl('text',{x:1011,y:29,fill:'#ffe1ab','text-anchor':'middle','font-size':14,'font-weight':800},matrixTarget+'회 후보'));
    rows.forEach((x,r)=>{
      const y=top+r*rowHeight;
      if(r%2===0)svg.append(svgEl('rect',{x:0,y:y-3,width,height:rowHeight,fill:'#1b3853',opacity:0.6}));
      const color=x.kind==='alive'?'#49d8a2':x.kind==='recent'?'#ffd36d':x.kind==='stopped'?'#f58b88':'#758ca6';
      svg.append(svgEl('rect',{x:11,y:y+2,width:5,height:23,rx:2,fill:color}));
      svg.append(svgEl('text',{x:23,y:y+19,fill:'#afc9e1','font-size':11},x.family));
      svg.append(svgEl('text',{x:135,y:y+19,fill:'#eff5ff','font-size':13,'font-weight':x.kind==='alive'?800:500},x.name.length>25?x.name.slice(0,24)+'…':x.name));
      x.history.forEach((v,j)=>{
        const pos=440+102*j,win=v.startsWith('✅'),miss=v.startsWith('✖');
        const rect=svgEl('rect',{x:pos,y,width:80,height:26,rx:7,fill:win?'#258765':miss?'#aa4f50':'#374c64',stroke:win?'#59dfb6':miss?'#e88783':'#546c84','stroke-width':1});
        rect.append(svgEl('title',{},(matrixTarget-5+j)+'회 · '+x.name+' · '+(win?'당첨번호 '+v.replace('✅','').trim()+'개 포함':miss?'후보 있음, 당첨번호 미포함':'후보 없음 또는 회차별 미추적')));
        svg.append(rect);
        svg.append(svgEl('text',{x:pos+40,y:y+18,'text-anchor':'middle','font-size':13,'font-weight':800,fill:'#fff9ef'},win?'● '+v.slice(2).trim():miss?'×':'·'));
      });
      svg.append(svgEl('rect',{x:955,y,width:115,height:26,rx:8,fill:x.candidates==='0수'?'#374c64':'#705327',stroke:x.candidates==='0수'?'#647b91':'#d3aa57'}));
      svg.append(svgEl('text',{x:1012,y:y+18,'text-anchor':'middle',fill:'#ffebbe','font-size':13,'font-weight':800},x.candidates));
    });
    node.append(svg);
  }

  function renderMatrix(target,baseRules,baseCurrent,current,profiles,modules,history){
    matrixTarget=target;
    const rounds=Array.from({length:5},(_,i)=>target-5+i);
    host.querySelectorAll('[data-lnall-r]').forEach((th,i)=>{th.textContent=rounds[i]+'회';});
    put('[data-lnall-target]',target+'회 후보');
    const data=[];
    const classify=(last,streak)=>{
      if(last?.candidates>0&&streak>=3)return ['alive','🔥 '+streak+'회 연속'];
      if(last?.hits>0)return ['recent','★ '+streak+'회 동반'];
      if(last?.candidates>0)return ['stopped','✖ 직전 끊김'];
      return ['untracked','— 직전 미발동'];
    };
    const snapshot=st=>{
      const records=st.history.slice(-5),last=records[records.length-1];
      const cells=records.map(e=>e.candidates>0?(e.hits>0?'✅ '+e.hits:'✖'):'—');
      return {cells,...{last},...{streak:st.streak}};
    };
    CODES.forEach(([code,key,name,meaning],i)=>{
      const st=history.watch[i],recent=snapshot(st),[kind,label]=classify(recent.last,recent.streak);
      data.push({family:'기존 7',familyOrder:0,name:code+' · '+name,history:recent.cells,candidates:current[key].size+'수',kind,label,note:meaning});
    });
    baseRules.forEach((rule,i)=>{
      const st=history.basic[i],recent=snapshot(st),[kind,label]=classify(recent.last,recent.streak);
      data.push({family:'기본 45',familyOrder:1,name:rule.group+' · '+rule.label.replace('{n}','번호'),history:recent.cells,candidates:baseCurrent[i].length+'수',kind,label,note:rule.why||''});
    });
    const dm=new Map();
    profiles.forEach(p=>(p.list||[]).forEach(e=>{
      if(!e.rule.dynamic)return;
      let x=dm.get(e.rule.group);if(!x){x={numbers:new Set(),events:new Map()};dm.set(e.rule.group,x);}
      x.numbers.add(p.n);
      (e.events||[]).forEach(ev=>{
        const r=Number(ev.i)+1;if(!Number.isInteger(r))return;
        let item=x.events.get(r);if(!item){item={candidates:new Set(),wins:new Set()};x.events.set(r,item);}
        item.candidates.add(p.n);if(ev.hit)item.wins.add(p.n);
      });
    }));
    dm.forEach((x,name)=>{
      const lastFive=rounds.map(r=>x.events.get(r));const cells=lastFive.map(e=>e?.candidates.size?(e.wins.size?'✅ '+e.wins.size:'✖'):'—');
      let streak=0,r=target-1;while(x.events.get(r)?.wins.size){streak++;r--;}
      const latest=lastFive[lastFive.length-1];const [kind,raw]=classify(latest?{candidates:latest.candidates.size,hits:latest.wins.size}:null,streak);
      data.push({family:'동적 · 사후',familyOrder:2,name,history:cells,candidates:x.numbers.size+'수',kind,label:raw,note:'현재 발견한 규칙을 과거에 대조한 사후검색. 사전 예측 검증과 구분해야 합니다.'});
    });
    modules.forEach((mod,i)=>{
      const nums=uniq(mod.items.filter(x=>Number.isInteger(x.n)&&x.n>=1&&x.n<=45).map(x=>x.n));
      data.push({family:'분석 16',familyOrder:3,name:(i+1)+'. '+mod.name,history:['—','—','—','—','—'],candidates:nums.length?nums.length+'수':'집합',kind:'untracked',label:'— 회차별 추적 없음',note:'모듈의 사례별 사후 감사와 회차별 사전 후보 연속 성공은 다릅니다.'});
    });
    matrixData=data;renderMatrixRows();
  }
  $('[data-lnall-filters]').addEventListener('click',ev=>{
    const b=ev.target.closest('button[data-lnall-filter]');if(!b)return;
    matrixFilter=b.dataset.lnallFilter;renderMatrixRows();
  });

  async function load(force){
    if(busy)return;
    if(!force&&Date.now()-last<1800000){
      try{if(completed===state.draws[state.draws.length-1].draw_no+1)return;}catch(_){}
    }
    let ds,baseRules,profiles,modules;
    try{
      if(typeof state==='undefined'||!state.draws.length||typeof RULES==='undefined'){
        put('[data-lnall-status]','기존 45개 번호 검색기가 로딩 중입니다. 잠시 후 자동 분석합니다…');
        setTimeout(()=>{if(rootPage.classList.contains('active'))load(false);},1000);return;
      }
      ds=state.draws;baseRules=RULES;profiles=state.profiles;modules=state.module16;
    }catch(e){put('[data-lnall-status]','검색기 로딩을 확인하지 못했습니다: '+e.message);return;}
    if(!modules||!profiles.length){setTimeout(()=>load(false),1000);return;}
    busy=true;const btn=$('[data-lnall-refresh]');btn.disabled=true;
    try{
      const target=ds[ds.length-1].draw_no+1,d=indexDraws(ds),current=nominate(target,d),paths=structural(target,d);
      const basicCurrent=baseRules.map(rule=>{
        const out=[];for(let n=1;n<=45;n++)if(rule.test(ds,ds.length,n))out.push(n);return out;
      });
      renderStructural(target,paths);renderSeven(current,null,ds);renderBase(baseRules,basicCurrent,null);
      renderDynamic(profiles);renderModules(modules);
      put('[data-lnall-status]',ds.length+'회까지 확인 · '+target+'회 현재 후보 · 구조적 연결 '+paths.length+'건 · 과거 모든 조건의 실제 당첨 복기 계산 중…');
      const history=await replay(ds,baseRules,(done,total)=>put('[data-lnall-status]',done+' / '+total+'회 · 7패턴 + 기본 45조건 복기 중…'));
      renderSeven(current,history,ds);renderBase(baseRules,basicCurrent,history);
      renderMatrix(target,baseRules,basicCurrent,current,profiles,modules,history);
      put('[data-lnall-status]',ds.length+'회까지 전체 비교 완료 · '+target+'회 사전 검색 · 7패턴·45기본조건의 과거 당첨 포함 기록 계산 완료 · 16모듈·현재 동적 규칙 목록 확인');
      last=Date.now();completed=target;
    }catch(e){put('[data-lnall-status]','전체 패턴 분석 중 오류: '+e.message);}
    busy=false;btn.disabled=false;
  }
  $('[data-lnall-refresh]').addEventListener('click',()=>load(true));
  new MutationObserver(()=>{if(rootPage.classList.contains('active'))load(false);}).observe(rootPage,{attributes:true,attributeFilter:['class']});
  if(rootPage.classList.contains('active'))setTimeout(()=>load(false),0);
})();
