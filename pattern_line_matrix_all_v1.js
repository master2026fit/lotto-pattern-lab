/* Lotto Note: all-round six-lane matrix (non-destructive companion to detailed replay). */
(function installFullHistoryLineMatrix(){
  'use strict';
  const host=document.querySelector('#ln-connection-schedule-v1 [data-lncm-master]');
  if(!host||host.querySelector('[data-lnmx]'))return;
  const css=document.createElement('style');
  css.textContent=`
  #ln-connection-schedule-v1 .lnmx{background:#f6faff;color:#193d57;border:2px solid #9bbbd0;border-radius:14px;padding:12px;margin:16px 0;min-width:0;max-width:100%;box-sizing:border-box}
  #ln-connection-schedule-v1 .lnmx h5{color:#214762;font-size:18px;margin:0 0 8px;line-height:1.5}
  #ln-connection-schedule-v1 .lnmx p{font-size:12px;color:#4b667b;margin:7px 0;line-height:1.7}
  #ln-connection-schedule-v1 .lnmx .lnmx-controls{display:flex;align-items:end;flex-wrap:wrap;gap:7px;margin:12px 0}
  #ln-connection-schedule-v1 .lnmx .lnmx-controls label{flex:1 1 120px;display:flex;flex-direction:column;gap:5px;color:#2c516e;font-size:12px;font-weight:800;min-width:0}
  #ln-connection-schedule-v1 .lnmx select,#ln-connection-schedule-v1 .lnmx input{color:#193a55;background:#fff;border:1px solid #9cb8cb;border-radius:8px;padding:10px 7px;width:100%;min-height:42px;box-sizing:border-box;font-size:13px}
  #ln-connection-schedule-v1 .lnmx button{touch-action:manipulation;cursor:pointer;min-height:40px;border-radius:8px;font-weight:850;font-size:12px;color:#24455e;background:#e5f0fb;border:1px solid #a1bdd2;padding:8px}
  #ln-connection-schedule-v1 .lnmx button:focus-visible{outline:2px solid #cf9b34;outline-offset:2px}
  #ln-connection-schedule-v1 .lnmx button:disabled{opacity:.55;cursor:wait}
  #ln-connection-schedule-v1 .lnmx .lnmx-toolbar{display:flex;gap:7px;flex-wrap:wrap;margin:8px 0 12px}
  #ln-connection-schedule-v1 .lnmx .lnmx-toolbar button{flex:1 1 100px}
  #ln-connection-schedule-v1 .lnmx .lnmx-toolbar button.primary{background:#f7d18b;color:#493509;border-color:#c69b50}
  #ln-connection-schedule-v1 .lnmx .lnmx-status{background:#e4f0fb;border-radius:9px;padding:9px;color:#254e69;font-size:12px;line-height:1.6;margin:10px 0}
  #ln-connection-schedule-v1 .lnmx .lnmx-legend{display:flex;flex-wrap:wrap;gap:5px;margin:7px 0}
  #ln-connection-schedule-v1 .lnmx .lnmx-legend span{border-radius:7px;border:1px solid #b0c4d4;padding:6px 8px;background:white;font-size:11px;color:#234862}
  #ln-connection-schedule-v1 .lnmx .lnmx-legend .hit{background:#d0f4de;color:#17653d}
  #ln-connection-schedule-v1 .lnmx .lnmx-legend .miss{background:#ffe1e4;color:#913740}
  #ln-connection-schedule-v1 .lnmx .lnmx-legend .none{background:#e9edf2;color:#657583}
  #ln-connection-schedule-v1 .lnmx .lnmx-matrix{width:100%;max-width:100%;min-width:0;box-sizing:border-box}
  #ln-connection-schedule-v1 .lnmx .lnmx-matrix table{width:100%;min-width:0;table-layout:fixed;border-collapse:separate;border-spacing:3px;font-variant-numeric:tabular-nums;font-size:12px}
  #ln-connection-schedule-v1 .lnmx .lnmx-matrix thead{display:table-header-group}
  #ln-connection-schedule-v1 .lnmx .lnmx-matrix tbody{display:table-row-group}
  #ln-connection-schedule-v1 .lnmx .lnmx-matrix tr{display:table-row;background:transparent;border:0;padding:0;overflow:visible}
  #ln-connection-schedule-v1 .lnmx .lnmx-matrix th,#ln-connection-schedule-v1 .lnmx .lnmx-matrix td{display:table-cell;box-sizing:border-box;text-align:center;border:0;background:none;padding:0;vertical-align:middle;grid-column:auto;overflow:visible}
  #ln-connection-schedule-v1 .lnmx .lnmx-matrix th{background:#dcebf8;color:#28506c;font-size:12px;padding:8px 2px;border-radius:6px;font-weight:900}
  #ln-connection-schedule-v1 .lnmx .lnmx-matrix th:first-child{width:67px}
  #ln-connection-schedule-v1 .lnmx .lnmx-matrix td:first-child{background:#e6f2fc;border-radius:7px;border:1px solid #c7d9e8}
  #ln-connection-schedule-v1 .lnmx .lnmx-round{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:#23506f;min-height:37px;font-size:12px;font-weight:900}
  #ln-connection-schedule-v1 .lnmx .lnmx-round small{font-size:9px;color:#66849a;font-weight:700}
  #ln-connection-schedule-v1 .lnmx .lnmx-slot{width:100%;min-width:0;min-height:37px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-weight:950;font-size:15px;padding:2px 0}
  #ln-connection-schedule-v1 .lnmx .lnmx-slot.hit{background:#bdebcf;color:#115e37;border:1px solid #71b993}
  #ln-connection-schedule-v1 .lnmx .lnmx-slot.miss{background:#ffdade;color:#922c3e;border:1px solid #e5a0a9}
  #ln-connection-schedule-v1 .lnmx .lnmx-slot.none{background:#eef1f5;color:#8794a1;border:1px solid #d5dee8}
  #ln-connection-schedule-v1 .lnmx .lnmx-slot[aria-expanded="true"]{outline:3px solid #e8ae48;outline-offset:-2px}
  #ln-connection-schedule-v1 .lnmx .lnmx-detailrow>td{background:#fff9e9!important;border:2px solid #e0ae5c!important;border-radius:10px!important;padding:10px!important;text-align:left!important}
  #ln-connection-schedule-v1 .lnmx .lnmx-detailrow strong{color:#644313;font-size:13px}
  #ln-connection-schedule-v1 .lnmx .lnmx-detailrow p{color:#584d3c;font-size:12px;margin:7px 0}
  #ln-connection-schedule-v1 .lnmx .lnmx-six{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:4px;margin:10px 0}
  #ln-connection-schedule-v1 .lnmx .lnmx-six span{display:flex;min-width:0;min-height:37px;align-items:center;justify-content:center;border-radius:7px;background:#e5edf6;border:1px solid #afc4d2;color:#274561;font-weight:850;font-size:13px}
  #ln-connection-schedule-v1 .lnmx .lnmx-six .focus{background:#ffe199;border:2px solid #e1a235;color:#554016}
  #ln-connection-schedule-v1 .lnmx .lnmx-six .actual{background:#baefd0;color:#166343;border:1px solid #68b68c}
  #ln-connection-schedule-v1 .lnmx .lnmx-six .actual.focus{background:#8ee0ae;border:2px solid #c18a1d;color:#174e35}
  #ln-connection-schedule-v1 .lnmx .lnmx-load{display:block;width:100%;margin-top:12px;background:#e6f1fc;border-color:#9cbdd2;min-height:44px}
  #ln-connection-schedule-v1 .lnmx .lnmx-loadAll{background:#ffe1ac;border-color:#c79b55}
  #ln-connection-schedule-v1 .lnmx .lnmx-analysis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin:10px 0}
  #ln-connection-schedule-v1 .lnmx .lnmx-stat{border:1px solid #bed1df;background:#fff;border-radius:8px;padding:8px 3px;text-align:center;color:#315774;font-size:11px;line-height:1.5}
  #ln-connection-schedule-v1 .lnmx .lnmx-stat b{display:block;color:#244b67;font-size:13px}
  #ln-connection-schedule-v1 .lnmx .lnmx-notice{padding:9px 10px;border-left:4px solid #d5ac6a;background:#edf4fa;font-size:11px;color:#45667d;line-height:1.6;margin:10px 0}
  @media(max-width:700px){
    #ln-connection-schedule-v1 .lnmx{padding:9px}
    #ln-connection-schedule-v1 .lncm-master .lnmx .lnmx-matrix table{display:table!important;table-layout:fixed!important;width:100%!important;border-spacing:2px!important}
    #ln-connection-schedule-v1 .lncm-master .lnmx .lnmx-matrix thead{display:table-header-group!important}
    #ln-connection-schedule-v1 .lncm-master .lnmx .lnmx-matrix tbody{display:table-row-group!important}
    #ln-connection-schedule-v1 .lncm-master .lnmx .lnmx-matrix tr{display:table-row!important;background:transparent!important;border:0!important;padding:0!important;overflow:visible!important}
    #ln-connection-schedule-v1 .lncm-master .lnmx .lnmx-matrix td,#ln-connection-schedule-v1 .lncm-master .lnmx .lnmx-matrix th{display:table-cell!important;grid-column:auto!important;border:0!important;border-radius:5px!important;padding:0!important;background:none!important;text-align:center!important}
    #ln-connection-schedule-v1 .lncm-master .lnmx .lnmx-matrix th{background:#dcebf8!important;padding:7px 1px!important}
    #ln-connection-schedule-v1 .lncm-master .lnmx .lnmx-matrix td:first-child{background:#e6f2fc!important}
    #ln-connection-schedule-v1 .lncm-master .lnmx .lnmx-matrix .lnmx-detailrow>td{background:#fff9e9!important;border:2px solid #e0ae5c!important;padding:9px!important}
    #ln-connection-schedule-v1 .lnmx .lnmx-matrix th:first-child{width:55px}
    #ln-connection-schedule-v1 .lnmx .lnmx-slot{font-size:13px;min-height:34px}
    #ln-connection-schedule-v1 .lnmx .lnmx-round{font-size:11px;min-height:34px}
  }`;
  host.append(css);
  const panel=document.createElement('section');
  panel.className='lnmx';panel.dataset.lnmx='1';
  panel.innerHTML=`
    <h5>📊 전체 회차 라인 매트릭스 (1회~최신)</h5>
    <p>사진처럼 <b>회차를 세로로</b>, 라인 <b>1·2·3·4·5·6을 가로로</b> 배치합니다. 기존 상세 복기는 그대로 유지합니다.</p>
    <div class="lnmx-controls">
      <label>중복번호군 <select data-lnmx-tier>
        <option value="1">1건</option><option value="2">2건</option><option value="3">3건</option>
        <option value="4">4건</option><option value="5">5건</option><option value="6">6건 이상</option>
      </select></label>
      <label>라인 방향 <select data-lnmx-kind>
        <option value="V">세로 1~6열</option><option value="H">가로 1~6줄</option>
        <option value="D">↘ 대각 1~6 시작칸</option><option value="A">↙ 대각 1~6 시작칸</option>
      </select></label>
      <label>칸 표시 <select data-lnmx-mode>
        <option value="symbol">출현 O / 미출현 X</option><option value="count">출현 개수 0·1·2…</option>
      </select></label>
    </div>
    <div class="lnmx-toolbar">
      <button type="button" data-lnmx-latest class="primary">최신 회차부터</button>
      <button type="button" data-lnmx-first>1회부터</button>
      <button type="button" data-lnmx-full>전체 펼치기</button>
    </div>
    <div class="lnmx-controls">
      <label>회차 바로 이동 <input data-lnmx-jump type="number" inputmode="numeric" min="1" placeholder="예: 1207" aria-label="조회할 회차"></label>
      <button type="button" data-lnmx-goto>선택 회차로 이동</button>
    </div>
    <div class="lnmx-status" data-lnmx-status>전체 복기표 준비 중…</div>
    <div class="lnmx-legend"><span class="hit">O 출현</span><span class="miss">X 전부 미출현</span><span class="none">· 해당 라인 없음</span><span>칸 선택 → 바로 아래 그림</span></div>
    <div class="lnmx-matrix">
      <table aria-label="전체 회차 6칸 라인 매트릭스">
        <thead><tr><th scope="col">회차</th><th scope="col">1</th><th scope="col">2</th><th scope="col">3</th><th scope="col">4</th><th scope="col">5</th><th scope="col">6</th></tr></thead>
        <tbody data-lnmx-body></tbody>
      </table>
    </div>
    <div class="lnmx-analysis" data-lnmx-stats></div>
    <button type="button" class="lnmx-load" data-lnmx-more>다음 60회 더 보기</button>
    <div class="lnmx-notice">연결은 각 회차 <b>추첨 이전 기록으로만</b> 계산합니다. 1~4회는 과거 4지점이 부족해 해당 없음으로 표시됩니다. 검색번호가 적어 라인이 2수 미만이면 X가 아니라 ·로 구분합니다. 대각은 각 번호군의 첫째 줄 1~6칸에서 시작하는 경로를 요약합니다. 이 표의 반복 미출현은 미래 제외 성능이 검증됐다는 뜻이 아닙니다.</div>`;
  const after=host.querySelector('[data-lna-six]')||host.querySelector('[data-lnco]');
  if(after)after.after(panel);else host.querySelector('[data-lncm-stats]')?.after(panel);
  const $=q=>panel.querySelector(q);
  const body=$('[data-lnmx-body]'),status=$('[data-lnmx-status]');
  const symbols=['O','X','·'];
  let model=null,cache=new Map(),last=0,mode='latest',anchor=0,shown=60,rendered=0,expanded=null,allRunning=false,taskId=0;
  const tier=n=>n>=6?'6':String(n);
  const getTierArray=(round,group)=>{
    let mapped=cache.get(round);
    if(!mapped){
      const counts=window.LNOverlapAudit?.countConnections(round,model.byDraw);
      if(!counts)return null;
      mapped=Object.fromEntries(['1','2','3','4','5','6'].map(k=>[k,[]]));
      for(let n=1;n<=45;n++)if(counts[n]>0)mapped[tier(counts[n])].push(n);
      cache.set(round,mapped);
    }
    return mapped[group]||[];
  };
  // Six comparable positions per round, within its own sorted multiplicity group.
  // Two or more numbers are required for a line to exist.
  function lineAt(nums,kind,slot){
    const point=(r,c)=>r>=0&&c>=0&&c<6?nums[r*6+c]:undefined;
    const list=[],rows=Math.ceil(nums.length/6);
    if(kind==='V')for(let r=0;r<rows;r++)list.push(point(r,slot));
    if(kind==='H')for(let c=0;c<6;c++)list.push(point(slot,c));
    if(kind==='D')for(let r=0;r<rows;r++)list.push(point(r,slot+r));
    if(kind==='A')for(let r=0;r<rows;r++)list.push(point(r,slot-r));
    return list.filter(n=>Number.isInteger(n));
  }
  function evaluate(round,position){
    if(round<5)return {numbers:[],state:'none',hit:0};
    const nums=getTierArray(round,$('[data-lnmx-tier]').value);
    if(!nums)return {numbers:[],state:'none',hit:0};
    const line=lineAt(nums,$('[data-lnmx-kind]').value,position);
    if(line.length<2)return {numbers:line,state:'none',hit:0};
    const official=model.byDraw[round];
    if(!(official instanceof Set)||official.size!==6)return {numbers:line,state:'none',hit:0};
    const hits=line.filter(n=>official.has(n)).length;
    return {numbers:line,hit:hits,state:hits?'hit':'miss'};
  }
  function lineLabel(slot){
    const kind=$('[data-lnmx-kind]').value,position=slot+1;
    return kind==='V'?'세로 '+position+'열':kind==='H'?'가로 '+position+'줄':
      (kind==='D'?'↘':'↙')+' 대각 '+position+'칸 시작';
  }
  function closeDetail(){
    body.querySelector('.lnmx-detailrow')?.remove();
    const open=body.querySelector('[aria-expanded="true"]');
    if(open)open.setAttribute('aria-expanded','false');
    expanded=null;
  }
  function showDetail(row,round,position,button){
    if(expanded?.round===round&&expanded?.position===position){closeDetail();return;}
    closeDetail();
    expanded={round,position};
    button.setAttribute('aria-expanded','true');
    const all=getTierArray(round,$('[data-lnmx-tier]').value)||[];
    const detail=evaluate(round,position),actual=model.byDraw[round];
    const tr=document.createElement('tr');tr.className='lnmx-detailrow';
    const td=document.createElement('td');td.colSpan=7;
    const head=document.createElement('strong');
    head.textContent=round+'회 · '+$('[data-lnmx-tier]').value+'건'+($('[data-lnmx-tier]').value==='6'?'+':'')+' · '+lineLabel(position);
    td.append(head);
    const p=document.createElement('p');
    p.textContent=detail.state==='none'?'해당 칸에 두 개 이상의 번호가 연결되지 않았습니다.':
      detail.numbers.join(' · ')+'번 · '+(detail.hit?'출현 '+detail.hit+'수':'전부 미출현');
    td.append(p);
    const grid=document.createElement('div');grid.className='lnmx-six';
    if(all.length){
      for(const n of all){
        const el=document.createElement('span');
        el.className=(actual instanceof Set&&actual.has(n)?'actual ':'')+(detail.numbers.includes(n)?'focus':'');
        el.textContent=n;grid.append(el);
      }
    }else{
      const empty=document.createElement('p');empty.textContent='이 회차의 해당 중복번호군은 비어 있습니다.';td.append(empty);
    }
    td.append(grid);
    const foot=document.createElement('p');
    foot.textContent=round<=4?'첫 네 회차는 4지점 연결을 정의할 수 없습니다.':
      '금색은 선택한 라인의 번호, 초록은 실제 본당첨 번호입니다. 6개씩 줄바꿈한 원래 검색 결과 배열입니다.';
    td.append(foot);
    const close=document.createElement('button');close.type='button';close.textContent='✕ 그림 닫기';
    close.addEventListener('click',closeDetail);
    td.append(close);
    tr.append(td);row.after(tr);
    tr.scrollIntoView({behavior:'smooth',block:'nearest',inline:'nearest'});
  }
  function displayRow(round){
    const tr=document.createElement('tr');
    tr.dataset.round=String(round);
    const head=document.createElement('td');const label=document.createElement('div');label.className='lnmx-round';
    const bold=document.createElement('span');bold.textContent=round;
    const suffix=document.createElement('small');suffix.textContent='회';
    label.append(bold,suffix);head.append(label);tr.append(head);
    for(let pos=0;pos<6;pos++){
      const td=document.createElement('td'),ev=evaluate(round,pos);
      const button=document.createElement('button');button.type='button';
      button.className='lnmx-slot '+ev.state;
      button.textContent=ev.state==='none'?'·':$('[data-lnmx-mode]').value==='count'?String(ev.hit):ev.state==='hit'?'O':'X';
      button.setAttribute('aria-label',round+'회 '+lineLabel(pos)+' '+(ev.state==='none'?'라인 없음':ev.state==='hit'?'출현 '+ev.hit+'개':'전부 미출현'));
      button.setAttribute('aria-expanded','false');
      button.addEventListener('click',()=>showDetail(tr,round,pos,button));
      td.append(button);tr.append(td);
    }
    return tr;
  }
  const indexFor=(i)=>mode==='latest'?anchor-i:anchor+i;
  const countAvailable=()=>mode==='latest'?anchor:Math.max(0,last-anchor+1);
  function summary(){
    const items=body.querySelectorAll('tr[data-round]');
    let valid=0,hits=0,miss=0;
    const lanes=Array.from({length:6},()=>({valid:0,hit:0}));
    for(const el of items){
      const round=Number(el.dataset.round);
      for(let p=0;p<6;p++){
        const ev=evaluate(round,p);if(ev.state==='none')continue;
        valid++;lanes[p].valid++;
        if(ev.state==='hit'){hits++;lanes[p].hit++;}else miss++;
      }
    }
    const stats=$('[data-lnmx-stats]');stats.textContent='';
    const header=[['표시 회차',items.length+'회'],['출현 라인',hits+'/'+valid],['전부 미출현',miss+'/'+valid]];
    for(const [k,v] of header){
      const item=document.createElement('div');item.className='lnmx-stat';
      const bold=document.createElement('b');bold.textContent=v;
      item.append(k,bold);stats.append(item);
    }
    const rounds=[...items].map(el=>Number(el.dataset.round));
    status.textContent=rounds.length?Math.min(...rounds)+'~'+Math.max(...rounds)+'회 표시 · 전체 1~'+last+
      '회 중 '+items.length+'회 · '+(mode==='latest'?'최신에서 과거 순':'1회부터 최신 순'):'당첨 데이터를 불러오는 중…';
    const next=$('[data-lnmx-more]');
    next.hidden=rendered>=countAvailable();
    next.textContent='다음 '+Math.min(60,countAvailable()-rendered)+'회 더 보기 ('+rendered+'/'+countAvailable()+')';
  }
  function appendNewRows(){
    if(!model)return;
    const max=Math.min(shown,countAvailable()),fragment=document.createDocumentFragment();
    for(let i=rendered;i<max;i++){
      const round=indexFor(i);
      if(round>=1&&round<=last)fragment.append(displayRow(round));
    }
    body.append(fragment);rendered=max;summary();
  }
  function resetView(nextMode,round){
    mode=nextMode||mode;
    anchor=Math.max(1,Math.min(last,Number(round)|| (mode==='latest'?last:1)));
    shown=60;rendered=0;cache.clear();
    closeDetail();body.replaceChildren();appendNewRows();
  }
  async function expandAll(){
    if(allRunning)return;
    allRunning=true;
    const button=$('[data-lnmx-full]');button.disabled=true;button.textContent='전체 표 생성 중…';
    const token=++taskId;
    try{
      while(rendered<countAvailable()&&token===taskId){
        shown=Math.min(countAvailable(),shown+60);
        appendNewRows();
        await new Promise(resolve=>requestAnimationFrame(resolve));
      }
    }finally{
      allRunning=false;button.disabled=false;button.textContent='전체 펼치기';
    }
  }
  function resetForFilter(){
    ++taskId;
    allRunning=false;
    const button=$('[data-lnmx-full]');button.disabled=false;button.textContent='전체 펼치기';
    closeDetail();cache.clear();
    const keep=rendered||60;
    rendered=0;shown=keep;body.replaceChildren();appendNewRows();
  }
  function refresh(){
    const next=window.LNConnectionSchedule?.getModel();
    if(!next?.byDraw||!next.last||!window.LNOverlapAudit){
      status.textContent='연결 데이터를 불러오는 중입니다.';return;
    }
    const previous=last,previousModel=model;
    model=next;last=next.last;
    $('[data-lnmx-jump]').max=last;
    if(last!==previous||model!==previousModel){
      ++taskId;allRunning=false;
      const button=$('[data-lnmx-full]');button.disabled=false;button.textContent='전체 펼치기';
      cache.clear();closeDetail();
      if(!previous||mode==='latest'&&anchor===previous)anchor=last;
      if(!anchor)anchor=last;
      shown=Math.max(60,shown);rendered=0;body.replaceChildren();appendNewRows();
    }
  }
  $('[data-lnmx-more]').addEventListener('click',()=>{
    const old=rendered;shown+=60;appendNewRows();
    const first=body.querySelectorAll('tr[data-round]')[old];
    if(first)requestAnimationFrame(()=>first.scrollIntoView({behavior:'smooth',block:'start',inline:'nearest'}));
  });
  $('[data-lnmx-latest]').addEventListener('click',()=>resetView('latest',last));
  $('[data-lnmx-first]').addEventListener('click',()=>resetView('oldest',1));
  $('[data-lnmx-full]').addEventListener('click',expandAll);
  $('[data-lnmx-goto]').addEventListener('click',()=>{
    const raw=$('[data-lnmx-jump]').value,round=Number(raw);
    if(!raw||!Number.isInteger(round)||round<1||round>last){status.textContent='1회부터 '+last+'회 사이의 회차를 입력하세요.';return;}
    resetView(mode,round);
    panel.scrollIntoView({behavior:'smooth',block:'start'});
  });
  for(const name of ['tier','kind','mode'])$('[data-lnmx-'+name+']').addEventListener('change',resetForFilter);
  window.addEventListener('lncs:schedule-ready',refresh);
  window.addEventListener('lnco:ready',refresh);
  refresh();
})();
