/* Lotto Note: archived overlapping-count line map (seven-column & ending-digit layouts). */
(function installOverlapLineAtlas(){
  'use strict';
  const master=document.querySelector('#ln-connection-schedule-v1 [data-lncm-master]');
  if(!master||master.querySelector('[data-lna-atlas]'))return;
  const css=document.createElement('style');
  css.textContent=`
  #ln-connection-schedule-v1 .lna{margin:14px 0;max-width:100%;min-width:0;box-sizing:border-box;padding:12px;border-radius:14px;border:2px solid #c3a06f;background:#0b2940;color:#edf7ff}
  #ln-connection-schedule-v1 .lna h6{font-size:17px;margin:0 0 7px;color:#ffe1ab}
  #ln-connection-schedule-v1 .lna h5{font-size:14px;color:#e4ffef;margin:16px 0 7px}
  #ln-connection-schedule-v1 .lna p,#ln-connection-schedule-v1 .lna .lna-hint{font-size:12px;color:#c2d8e7;line-height:1.7;margin:6px 0}
  #ln-connection-schedule-v1 .lna-options{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0;align-items:end}
  #ln-connection-schedule-v1 .lna-options label{display:flex;flex:1 1 115px;flex-direction:column;gap:5px;font-size:12px;color:#dcebf5}
  #ln-connection-schedule-v1 .lna-options select,#ln-connection-schedule-v1 .lna-options input{width:100%;min-height:41px;box-sizing:border-box;background:#edf7ff;color:#102b3b;border:1px solid #9ec9dc;border-radius:8px;padding:9px;font-size:13px}
  #ln-connection-schedule-v1 .lna-options button{flex:1 1 120px;min-height:42px;background:#d5ad69;color:#182f3c;border:1px solid #ffe2a7;font-size:13px;font-weight:900;border-radius:8px}
  #ln-connection-schedule-v1 .lna button{touch-action:manipulation;cursor:pointer}
  #ln-connection-schedule-v1 .lna button:disabled{opacity:.65;cursor:wait}
  #ln-connection-schedule-v1 .lna-round-nav{display:flex;gap:7px;align-items:center;margin:9px 0}
  #ln-connection-schedule-v1 .lna-round-nav button{min-height:40px;flex:1;background:#315c74;border:1px solid #7da8ba;color:#e5fff3;border-radius:8px;font-weight:800}
  #ln-connection-schedule-v1 .lna-round-nav strong{flex:1;white-space:nowrap;text-align:center;color:#ffe1a7;font-size:15px}
  #ln-connection-schedule-v1 .lna-grid{display:grid;gap:3px;box-sizing:border-box;width:100%;margin:9px 0;padding:5px;border:1px solid #597994;border-radius:10px;background:#082033}
  #ln-connection-schedule-v1 .lna-cell{display:flex;min-width:0;min-height:45px;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:#133149;border:1px solid #48667e;border-radius:6px;color:#b7c8d5;padding:2px 0}
  #ln-connection-schedule-v1 .lna-cell b{font-size:14px;color:#e7f2fc}
  #ln-connection-schedule-v1 .lna-cell small{font-size:9px;color:#b9cfdd}
  #ln-connection-schedule-v1 .lna-cell.active{background:#2e5064;border-color:#d7b16c}
  #ln-connection-schedule-v1 .lna-cell.hit{background:#174d3e;border-color:#74d1a4}
  #ln-connection-schedule-v1 .lna-cell.outline{outline:3px solid #ffe09a;outline-offset:-3px;background:#59462e}
  #ln-connection-schedule-v1 .lna-cell.hit.outline{background:#1a7450}
  #ln-connection-schedule-v1 .lna-key{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}
  #ln-connection-schedule-v1 .lna-key span{font-size:11px;padding:5px 7px;border-radius:7px;background:#25485f;border:1px solid #597e96}
  #ln-connection-schedule-v1 .lna-row{display:flex;flex-wrap:wrap;gap:5px;align-items:flex-start;padding:7px 0;border-bottom:1px solid #35566e}
  #ln-connection-schedule-v1 .lna-row >strong{flex:none;min-width:55px;font-size:12px;color:#ffdfa5;padding:6px 0}
  #ln-connection-schedule-v1 .lna-balls{display:flex;flex:1;flex-wrap:wrap;gap:5px}
  #ln-connection-schedule-v1 .lna-ball{display:inline-flex;min-width:34px;min-height:32px;padding:5px;box-sizing:border-box;align-items:center;justify-content:center;background:#293c50;border:1px solid #547891;border-radius:8px;color:#e5eff8;font-size:12px;font-weight:850}
  #ln-connection-schedule-v1 .lna-ball.hit{color:#caffdf;background:#184e40;border-color:#7bd3a6}
  #ln-connection-schedule-v1 .lna-ball.miss{color:#ffe1e4;background:#4b313b;border-color:#c2848e}
  #ln-connection-schedule-v1 .lna-note{font-size:11px;color:#a9cadd;line-height:1.6}
  #ln-connection-schedule-v1 .lna-line-list{display:grid;gap:7px;margin:10px 0}
  #ln-connection-schedule-v1 .lna-line-item{display:flex;align-items:center;gap:7px;border:1px solid #53798d;background:#16384e;border-radius:9px;padding:9px;min-height:50px;box-sizing:border-box;text-align:left;color:#f1f8ff}
  #ln-connection-schedule-v1 .lna-line-item span{flex:1;min-width:0;font-size:12px;line-height:1.5;overflow-wrap:anywhere}
  #ln-connection-schedule-v1 .lna-line-item b{color:#ffe2aa}
  #ln-connection-schedule-v1 .lna-line-item strong{flex:none;max-width:92px;font-size:11px;color:#b3f4d7}
  #ln-connection-schedule-v1 .lna-line-item.missline{border-color:#cb949d}
  #ln-connection-schedule-v1 .lna-line-item.missline strong{color:#ffb9be}
  #ln-connection-schedule-v1 .lna-line-item.selected{outline:2px solid #ffdc90}
  #ln-connection-schedule-v1 .lna-tables{overflow-x:auto;max-width:100%}
  #ln-connection-schedule-v1 .lna-tables table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:12px}
  #ln-connection-schedule-v1 .lna-tables th,#ln-connection-schedule-v1 .lna-tables td{padding:8px 5px;color:#eaf5ff;border:1px solid #4a6a80;overflow-wrap:anywhere;vertical-align:top;background:#193e55}
  #ln-connection-schedule-v1 .lna-tables th{background:#2c5067;color:#ffdc9d}
  #ln-connection-schedule-v1 .lna-tables tr.focus td{background:#305663}
  #ln-connection-schedule-v1 .lna-tables small{display:block;font-size:10px;color:#b9d2e2;line-height:1.5;margin-top:3px}
  #ln-connection-schedule-v1 .lna-tables .lna-numbers{font-size:11px;line-height:1.7;word-break:break-word}
  #ln-connection-schedule-v1 .lna-range-status{font-size:12px;color:#c1f2db;margin:8px 0;line-height:1.7}
  #ln-connection-schedule-v1 .lna-more{width:100%;min-height:42px;border-radius:8px;border:1px solid #87b6c8;background:#305774;color:#e6fbff;font-size:12px;margin:7px 0}
  #ln-connection-schedule-v1 .lna-round-list{display:grid;gap:8px;margin:8px 0}
  #ln-connection-schedule-v1 .lna-round-list details{background:#13344b;border:1px solid #567a8d;border-radius:9px;padding:10px}
  #ln-connection-schedule-v1 .lna-round-list summary{font-size:12px;color:#ffe3ad;cursor:pointer;line-height:1.6;font-weight:800}
  #ln-connection-schedule-v1 .lna-round-list button{padding:6px 9px;background:#285672;border:1px solid #72a5b5;border-radius:8px;color:#dcf1ff;font-size:11px;margin-top:6px}
  #ln-connection-schedule-v1 .lna-alert{font-size:11px;line-height:1.7;color:#bcd7e7;border-left:3px solid #ddae69;padding:7px 10px;background:#163548;margin-top:10px}
  #ln-connection-schedule-v1 .lna-trace{display:grid;gap:8px;margin:10px 0}
  #ln-connection-schedule-v1 .lna-trace-item{border:1px solid #52748a;border-radius:9px;padding:9px;background:#193b53}
  #ln-connection-schedule-v1 .lna-trace-item>strong{font-size:12px;color:#ffe1ab}
  #ln-connection-schedule-v1 .lna-trace-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:3px;margin-top:5px}
  #ln-connection-schedule-v1 .lna-trace-grid button{display:flex;flex-direction:column;gap:2px;align-items:center;justify-content:center;min-width:0;min-height:40px;padding:2px 0;background:#26455b;border:1px solid #55738a;border-radius:5px;color:#d3e2ed}
  #ln-connection-schedule-v1 .lna-trace-grid button.hit{background:#205844;color:#d3ffe2;border-color:#7fdaad}
  #ln-connection-schedule-v1 .lna-trace-grid button.miss{background:#5e3646;color:#ffe2e8;border-color:#dd9ba5}
  #ln-connection-schedule-v1 .lna-trace-grid button span{font-size:10px;font-weight:900}
  #ln-connection-schedule-v1 .lna-trace-grid button small{font-size:9px}
  @media(max-width:700px){
   #ln-connection-schedule-v1 .lna{padding:9px}
   #ln-connection-schedule-v1 .lna-grid{gap:2px;padding:4px}
   #ln-connection-schedule-v1 .lna-cell{min-height:40px;padding:2px 0}
   #ln-connection-schedule-v1 .lna-cell b{font-size:12px}
   #ln-connection-schedule-v1 .lna-cell small{font-size:8px}
   #ln-connection-schedule-v1 .lna-tables{overflow:visible}
   #ln-connection-schedule-v1 .lncm-master .lna-tables table{display:table!important;width:100%!important;table-layout:fixed!important}
   #ln-connection-schedule-v1 .lncm-master .lna-tables thead{display:table-header-group!important}
   #ln-connection-schedule-v1 .lncm-master .lna-tables tbody{display:table-row-group!important}
   #ln-connection-schedule-v1 .lncm-master .lna-tables tr{display:table-row!important;background:none!important;border:0!important;overflow:visible!important}
   #ln-connection-schedule-v1 .lncm-master .lna-tables th,#ln-connection-schedule-v1 .lncm-master .lna-tables td{display:table-cell!important;padding:7px 3px!important;border:1px solid #4a6a80!important;border-radius:0!important;font-size:11px}
   #ln-connection-schedule-v1 [data-lna-round-table]{display:none}
   #ln-connection-schedule-v1 .lna-balls{gap:4px}
   #ln-connection-schedule-v1 .lna-ball{min-width:30px;min-height:30px}
  }`;
  master.append(css);
  const panel=document.createElement('section');panel.className='lna';panel.dataset.lnaAtlas='1';
  panel.innerHTML=`
    <h6>📐 회차별 중복번호 · 가로·세로·대각 제외라인 지도</h6>
    <p>회차마다 1~6건 이상 겹친 번호를 세로로 나열하고, 번호판의 가로·세로·대각 라인별로 출현/미출현을 복기합니다. 10열 끝수판과 7열 로또판을 바꿔볼 수 있습니다.</p>
    <div class="lna-options">
      <label>번호판 배열 <select data-lna-layout>
        <option value="10">10열 끝수판 (1·11·21…)</option>
        <option value="7">7열 로또판 (1·8·15…)</option>
      </select></label>
      <label>복기 범위 <select data-lna-period>
        <option value="20">최근 20회</option><option value="50" selected>최근 50회</option>
        <option value="100">최근 100회</option><option value="250">최근 250회</option>
        <option value="all">전체 회차</option>
      </select></label>
      <button type="button" data-lna-run>🔎 회차·라인 전체 복기</button>
    </div>
    <div class="lna-round-nav">
      <button type="button" data-lna-prev>◀ 이전</button>
      <strong data-lna-round-label>회차 확인 중</strong>
      <button type="button" data-lna-next>다음 ▶</button>
    </div>
    <div class="lna-options">
      <label>직접 회차 <input data-lna-round type="number" min="5" inputmode="numeric" aria-label="라인 검증 회차"></label>
      <label>중복 군 <select data-lna-tier>
        <option value="all">1~6건+ 전체</option><option value="1">1건</option><option value="2">2건</option>
        <option value="3">3건</option><option value="4">4건</option><option value="5">5건</option><option value="6">6건+</option>
      </select></label>
      <label>라인 종류 <select data-lna-type>
        <option value="all">가로·세로·대각 전체</option><option value="H">가로</option>
        <option value="V">세로</option><option value="D">↘ 대각</option><option value="A">↙ 대각</option>
      </select></label>
    </div>
    <div class="lna-range-status" data-lna-status>복기 데이터를 불러오는 중입니다.</div>
    <h5>① 선택 회차 번호판</h5>
    <div class="lna-grid" data-lna-grid></div>
    <div class="lna-key">
      <span>회색: 연결 없음</span><span>숫자 아래: 겹친 경로 수</span><span>초록: 본당첨 출현</span><span>금색 테두리: 선택 라인</span>
    </div>
    <h5>② 선택 회차 1~6건+ 번호군</h5>
    <div data-lna-tier-list></div>
    <h5>③ 해당 회차의 가로·세로·대각 라인</h5>
    <p class="lna-hint">한 라인 안에 같은 중복 군 번호가 2개 이상 있는 경우부터 표시합니다. 라인을 누르면 위 번호판에서 위치를 강조합니다.</p>
    <div class="lna-line-list" data-lna-lines></div>
    <button type="button" data-lna-line-more class="lna-more" hidden>다른 라인 더 보기</button>
    <h5>④ 회차를 세로로 쌓은 중복번호 복기표</h5>
    <p class="lna-hint">회차 → 1건 → 2건 → 3건 → 4건 → 5건 → 6건+의 순서로 정렬합니다. 각 군의 번호 옆 ✓는 출현, ×는 미출현입니다.</p>
    <div class="lna-tables" data-lna-round-table></div>
    <div class="lna-round-list" data-lna-round-list></div>
    <button type="button" data-lna-round-more class="lna-more" hidden>이전 회차 더 보기</button>
    <h5>⑤ 라인별 반복 미출현 · 기대치 비교</h5>
    <div class="lna-tables" data-lna-stats></div>
    <button type="button" data-lna-stats-more class="lna-more" hidden>추가 라인 통계 보기</button>
    <h5>⑥ 라인별 최근 12회 변화</h5>
    <p class="lna-hint">× 전부 미출현 · ✓ 1개 이상 출현 · – 해당 라인·중복군의 번호가 2수 미만. 각 칸을 누르면 해당 회차 번호판으로 이동합니다.</p>
    <div class="lna-trace" data-lna-trace></div>
    <div class="lna-alert">
      <b>해석 기준:</b> 미출현은 기본적으로 흔합니다. 특정 번호 한 개가 본당첨에 없을 확률은 39/45 = 86.67%입니다.
      라인에서 여러 번호가 전부 미출현한 비율은 <b>같은 번호 수를 무작위 선택했을 때의 기대 비율</b>과 나란히 비교합니다.
      이 표는 과거 시점별 재계산이며, 앞으로 제외해도 된다는 보장이 아닙니다.
    </div>`;
  const overlap=master.querySelector('[data-lnco]');
  if(overlap)overlap.after(panel);else master.querySelector('[data-lncm-stats]')?.after(panel);
  const $=key=>panel.querySelector(key);
  let model=null,target=0,history=[],busy=false,shown=8,lineShown=15,statsShown=14,selectedLine='',ranked=[],aggregate=[];
  const bins=['1','2','3','4','5','6'];
  const tier=n=>n>=6?'6':String(n);
  const tierLabel=n=>n==='6'?'6건+':n+'건';
  const format=n=>n.toLocaleString('ko-KR');
  const zeroProbability=n=>{
    let p=1;
    for(let i=0;i<6;i++)p*=Math.max(0,45-n-i)/(45-i);
    return p;
  };
  const linesFor=cols=>{
    const rows=Math.ceil(45/cols),list=[];
    const number=(r,c)=>r*cols+c+1;
    function add(type,positions){
      const ns=positions.map(([r,c])=>number(r,c)).filter(n=>n>=1&&n<=45);
      if(ns.length<3)return;
      const start=ns[0],end=ns[ns.length-1];
      const title=type==='H'?`가로 ${positions[0][0]+1}줄 (${start}~${end})`:
        type==='V'?`세로 ${positions[0][1]+1}줄 (${ns.slice(0,3).join('·')}…)`:
        `${type==='D'?'↘':'↙'} 대각 ${start}→${end}`;
      list.push({id:cols+'-'+type+'-'+start+'-'+end,type,title,ns});
    }
    for(let r=0;r<rows;r++){const pos=[];for(let c=0;c<cols;c++)pos.push([r,c]);add('H',pos);}
    for(let c=0;c<cols;c++){const pos=[];for(let r=0;r<rows;r++)pos.push([r,c]);add('V',pos);}
    for(let c=0;c<cols;c++){const d=[],a=[];for(let r=0;r<rows&&c+r<cols;r++)d.push([r,c+r]);for(let r=0;r<rows&&c-r>=0;r++)a.push([r,c-r]);add('D',d);add('A',a);}
    for(let r=1;r<rows;r++){const d=[],a=[];for(let k=0;r+k<rows&&k<cols;k++)d.push([r+k,k]);for(let k=0;r+k<rows&&k<cols;k++)a.push([r+k,cols-1-k]);add('D',d);add('A',a);}
    return list;
  };
  const countRound=round=>{
    const api=window.LNOverlapAudit;
    if(!api||!model?.byDraw)return null;
    return api.countConnections(round,model.byDraw);
  };
  const classify=count=>{
    const groups=Object.fromEntries(bins.map(k=>[k,[]]));
    for(let n=1;n<=45;n++)if(count[n]>0)groups[tier(count[n])].push(n);
    return groups;
  };
  const cellBall=(n,outcome)=>{
    const span=document.createElement('span');
    span.className='lna-ball'+(outcome?(outcome.has(n)?' hit':' miss'):'');
    span.textContent=n+(outcome?(outcome.has(n)?' ✓':' ×'):'');
    return span;
  };
  function tierRow(group,actual,groups){
    const wrap=document.createElement('div');wrap.className='lna-row';
    const name=document.createElement('strong');name.textContent=tierLabel(group);
    const balls=document.createElement('div');balls.className='lna-balls';
    for(const n of groups[group])balls.append(cellBall(n,actual));
    if(!groups[group].length){const empty=document.createElement('small');empty.textContent='없음';balls.append(empty);}
    wrap.append(name,balls);return wrap;
  }
  function availableRound(){
    const max=Math.max(model?.last||0,...(model?.due?.keys?.()||[]));
    return Math.max(5,max);
  }
  function getRoundData(round){
    if(round<=model.last){
      const found=history.find(x=>x.round===round);
      if(found)return found;
    }
    const count=countRound(round);
    if(!count)return null;
    const actual=model.byDraw[round] instanceof Set?model.byDraw[round]:null;
    return {round,count,actual};
  }
  function activeLines(line,count){
    const chosen=$('[data-lna-tier]').value;
    return line.ns.filter(n=>count[n]>0&&(chosen==='all'||tier(count[n])===chosen));
  }
  function renderGrid(data,highlight){
    const cols=Number($('[data-lna-layout]').value),grid=$('[data-lna-grid]');
    grid.style.gridTemplateColumns=`repeat(${cols},minmax(0,1fr))`;grid.textContent='';
    for(let n=1;n<=45;n++){
      const cell=document.createElement('div');
      const overlap=data.count[n],hit=data.actual?.has(n);
      cell.className='lna-cell'+(overlap?' active':'')+(hit?' hit':'')+(highlight?.includes(n)?' outline':'');
      const value=document.createElement('b');value.textContent=n;
      const sub=document.createElement('small');sub.textContent=overlap?overlap+'건':'—';
      cell.append(value,sub);grid.append(cell);
    }
  }
  function renderCurrent(){
    model=window.LNConnectionSchedule?.getModel()||null;
    if(!model||!window.LNOverlapAudit)return;
    if(!target)target=model.last+1;
    const max=availableRound();
    target=Math.max(5,Math.min(max,target));
    $('[data-lna-round]').value=target;
    $('[data-lna-round]').max=max;
    $('[data-lna-round-label]').textContent=target+'회'+(target>model.last?' · 예정':' · 복기');
    const data=getRoundData(target);
    if(!data)return;
    const groups=classify(data.count),actual=data.actual;
    const area=$('[data-lna-tier-list]');area.textContent='';
    for(const group of bins)area.append(tierRow(group,actual,groups));
    const count=Object.values(groups).reduce((sum,nums)=>sum+nums.length,0);
    const notes=document.createElement('p');
    notes.className='lna-note';
    notes.textContent=`${target}회 · 4점 이상 연결 대상 ${count}수 · ${actual?'본당첨 대조 완료':'아직 추첨/검증 전'} · 같은 번호는 군별 한 번만 표시`;
    area.prepend(notes);
    const all=linesFor(Number($('[data-lna-layout]').value));
    const type=$('[data-lna-type]').value;
    const tierFilter=$('[data-lna-tier]').value;
    const list=[];
    for(const line of all){
      if(type!=='all'&&type!==line.type)continue;
      const ns=activeLines(line,data.count);
      if(ns.length<2)continue;
      const hits=actual?ns.filter(n=>actual.has(n)).length:null;
      list.push({line,ns,hits,expected:zeroProbability(ns.length)});
    }
    ranked=list.sort((a,b)=>b.ns.length-a.ns.length||(a.hits===0?-1:1)||a.line.title.localeCompare(b.line.title,'ko'));
    lineShown=Math.max(15,lineShown);
    renderCurrentLines(data);
  }
  function renderCurrentLines(data){
    const area=$('[data-lna-lines]');area.textContent='';
    const current=data||getRoundData(target);
    const allAvailable=ranked.slice(0,lineShown);
    for(const item of allAvailable){
      const line=item.line,button=document.createElement('button');
      button.type='button';button.className='lna-line-item'+(item.hits===0?' missline':'')+(selectedLine===line.id?' selected':'');
      const label=document.createElement('span');const heading=document.createElement('b');
      heading.textContent=line.title+' · '+item.ns.length+'수';
      const detail=document.createElement('small');
      detail.textContent=item.ns.join(' · ')+' · 무출현 기대 '+(item.expected*100).toFixed(1)+'%';
      label.append(heading,document.createElement('br'),detail);
      const result=document.createElement('strong');
      result.textContent=item.hits===null?'⏳ 예정':item.hits===0?'× 전부 미출현':'✓ '+item.hits+'수 출현';
      button.append(label,result);
      button.addEventListener('click',()=>{
        selectedLine=selectedLine===line.id?'':line.id;
        renderGrid(current,selectedLine?item.ns:[]);
        renderCurrentLines(current);
      });area.append(button);
    }
    const more=$('[data-lna-line-more]');
    more.hidden=ranked.length<=lineShown;
    more.textContent=`추가 라인 ${Math.min(15,ranked.length-lineShown)}개 보기 (${Math.min(lineShown,ranked.length)}/${ranked.length})`;
    const currentLine=ranked.find(x=>x.line.id===selectedLine);
    renderGrid(current,currentLine?currentLine.ns:[]);
  }
  function tableElement(headers,rows){
    const table=document.createElement('table'),head=document.createElement('thead'),tr=document.createElement('tr');
    for(const title of headers){const th=document.createElement('th');th.textContent=title;tr.append(th);}
    head.append(tr);table.append(head);
    const body=document.createElement('tbody');
    for(const cells of rows){
      const row=document.createElement('tr');
      for(const content of cells){
        const td=document.createElement('td');
        if(content instanceof Node)td.append(content);else td.textContent=String(content);
        row.append(td);
      }
      body.append(row);
    }
    table.append(body);return table;
  }
  function tinyList(data,group){
    const numbers=classify(data.count)[group];
    const div=document.createElement('div');div.className='lna-numbers';
    const title=document.createElement('b');
    const hits=data.actual?numbers.filter(n=>data.actual.has(n)).length:null;
    title.textContent=(hits===null?'예정':hits+'/'+numbers.length+' 출현');
    const small=document.createElement('small');
    small.textContent=numbers.map(n=>String(n)+(data.actual?(data.actual.has(n)?'✓':'×'):'' )).join(' · ')||'없음';
    div.append(title,small);return div;
  }
  function renderRounds(){
    const tableBox=$('[data-lna-round-table]'),list=$('[data-lna-round-list]');
    tableBox.textContent='';list.textContent='';
    if(!history.length)return;
    const rows=history.slice(0,shown);
    const summaries=rows.map(item=>[
      item.round+'회',...bins.map(group=>tinyList(item,group))
    ]);
    // Desktop and mobile: compact table; long numbers wrap inside each cell.
    const table=tableElement(['회차',...bins.map(tierLabel)],summaries);
    tableBox.append(table);
    for(const item of rows){
      const details=document.createElement('details');
      const title=document.createElement('summary');
      title.textContent=item.round+'회 자세히 보기 · '+[...item.actual].sort((a,b)=>a-b).join(' · ');
      details.append(title);
      details.addEventListener('toggle',()=>{
        if(!details.open||details.dataset.loaded)return;
        details.dataset.loaded='1';
        const groups=classify(item.count);
        for(const group of bins)details.append(tierRow(group,item.actual,groups));
        const view=document.createElement('button');view.type='button';view.textContent='📐 이 회차 번호판과 라인 보기';
        view.addEventListener('click',()=>{target=item.round;selectedLine='';lineShown=15;renderCurrent();panel.scrollIntoView({behavior:'smooth',block:'start'});});
        details.append(view);
      });
      list.append(details);
      if(typeof window!=='undefined'&&window.innerWidth<=700)details.open=true;
    }
    const more=$('[data-lna-round-more]');
    more.hidden=history.length<=shown;
    more.textContent=`다음 ${Math.min(8,history.length-shown)}회 더 보기 (${Math.min(shown,history.length)}/${history.length})`;
  }
  function buildAggregate(){
    if(!history.length)return [];
    const lines=linesFor(Number($('[data-lna-layout]').value)),stat=new Map();
    for(const line of lines)for(const group of bins){
      stat.set(line.id+'|'+group,{line,group,eligible:0,zero:0,expected:0,numberSamples:0,hits:0});
    }
    for(const record of history){
      for(const line of lines){
        for(const group of bins){
          const matching=line.ns.filter(n=>tier(record.count[n])===group&&record.count[n]>0);
          if(matching.length<2)continue;
          const hit=matching.filter(n=>record.actual.has(n)).length;
          const item=stat.get(line.id+'|'+group);
          item.eligible++;item.zero+=hit===0?1:0;
          item.expected+=zeroProbability(matching.length);item.numberSamples+=matching.length;item.hits+=hit;
        }
      }
    }
    return [...stat.values()].filter(x=>x.eligible>=5).map(x=>({
      ...x,rate:x.zero/x.eligible,expectedRate:x.expected/x.eligible,
      diff:(x.zero-x.expected)/x.eligible
    })).sort((a,b)=>b.diff-a.diff||b.eligible-a.eligible);
  }
  function renderTrace(){
    const area=$('[data-lna-trace]');area.textContent='';
    if(!history.length)return;
    const type=$('[data-lna-type]').value,t=$('[data-lna-tier]').value;
    const top=aggregate.filter(x=>(type==='all'||type===x.line.type)&&(t==='all'||t===x.group)).slice(0,6);
    const recent=history.slice(0,12).reverse();
    for(const entry of top){
      const wrapper=document.createElement('div');wrapper.className='lna-trace-item';
      const title=document.createElement('strong');
      title.textContent=entry.line.title+' · '+tierLabel(entry.group)+
        ' · 관찰 '+entry.eligible+'회 중 전부 미출현 '+entry.zero+'회';
      wrapper.append(title);
      const grid=document.createElement('div');grid.className='lna-trace-grid';
      for(const item of recent){
        const numbers=entry.line.ns.filter(n=>item.count[n]>0&&tier(item.count[n])===entry.group);
        const hit=numbers.some(n=>item.actual.has(n));
        const state=numbers.length<2?'none':hit?'hit':'miss';
        const btn=document.createElement('button');btn.type='button';
        btn.className=state==='none'?'':state;
        btn.title=item.round+'회 · '+(state==='none'?'해당 없음':state==='hit'?'출현':'전부 미출현')+' · '+numbers.join(', ');
        btn.setAttribute('aria-label',btn.title);
        const no=document.createElement('small');no.textContent=String(item.round%100).padStart(2,'0');
        const outcome=document.createElement('span');outcome.textContent=state==='none'?'–':state==='hit'?'✓':'×';
        btn.append(no,outcome);
        btn.addEventListener('click',()=>{
          target=item.round;
          $('[data-lna-tier]').value=entry.group;
          $('[data-lna-type]').value=entry.line.type;
          selectedLine=entry.line.id;lineShown=15;statsShown=14;
          renderCurrent();renderAggregate();
          panel.scrollIntoView({behavior:'smooth',block:'start'});
        });
        grid.append(btn);
      }
      wrapper.append(grid);area.append(wrapper);
    }
  }
  function renderAggregate(){
    const box=$('[data-lna-stats]');box.textContent='';
    if(!history.length)return;
    const type=$('[data-lna-type]').value,t=$('[data-lna-tier]').value;
    const filtered=aggregate.filter(x=>(type==='all'||type===x.line.type)&&(t==='all'||t===x.group));
    const cols=['라인 / 중복군','관찰 회차','모두 미출현','무작위 기대'];
    const rows=filtered.slice(0,statsShown).map(x=>[
      x.line.title+' · '+tierLabel(x.group),
      x.eligible+'회',
      x.zero+'회 ('+(100*x.rate).toFixed(1)+'%)',
      (100*x.expectedRate).toFixed(1)+'%'
    ]);
    box.append(tableElement(cols,rows));
    const explain=document.createElement('p');
    explain.textContent='표는 중복군과 라인에 2수 이상 포함된 회차만 비교합니다. 차이가 큰 순으로 정렬하며, 여러 라인을 동시에 검색한 결과이므로 우연한 차이일 수 있습니다.';
    box.append(explain);
    const more=$('[data-lna-stats-more]');
    more.hidden=statsShown>=filtered.length;
    more.textContent=`다른 라인 통계 ${Math.min(15,filtered.length-statsShown)}개 더 보기 (${Math.min(statsShown,filtered.length)}/${filtered.length})`;
    renderTrace();
  }
  async function audit(){
    if(busy)return;
    model=window.LNConnectionSchedule?.getModel()||null;
    if(!model||!window.LNOverlapAudit){$('[data-lna-status]').textContent='연결 데이터를 먼저 불러와 주세요.';return;}
    const selector=$('[data-lna-period]'),last=model.last,range=selector.value,
      start=range==='all'?5:Math.max(5,last-Number(range)+1);
    busy=true;
    const button=$('[data-lna-run]');button.disabled=true;selector.disabled=true;
    $('[data-lna-status]').textContent=start+'~'+last+'회 복기 계산 중…';
    const work=[];
    try{
      for(let round=last;round>=start;round--){
        const actual=model.byDraw[round];
        if(!(actual instanceof Set)||actual.size!==6)throw Error(round+'회 실제 당첨자료가 없습니다.');
        const count=countRound(round);
        if(!count)throw Error(round+'회 연결 계산 실패');
        work.push({round,count,actual});
        if((last-round+1)%6===0){
          $('[data-lna-status]').textContent='진행 '+(last-round+1)+'/'+(last-start+1)+'회 · 회차별 중복 계산 중';
          await new Promise(resolve=>setTimeout(resolve,0));
        }
      }
      if(window.LNConnectionSchedule?.getModel()?.last!==last)throw Error('새 회차가 로드되어 다시 계산해야 합니다.');
      history=work;shown=8;statsShown=14;
      $('[data-lna-status]').textContent='✓ '+start+'~'+last+'회 '+history.length+'회 복기 완료 · 당첨 전 데이터만 사용';
      renderRounds();
      aggregate=buildAggregate();
      renderAggregate();
      renderCurrent();
    }catch(e){$('[data-lna-status]').textContent='복기 완료 실패: '+e.message;}
    finally{busy=false;button.disabled=false;selector.disabled=false;}
  }
  const update=()=>{
    model=window.LNConnectionSchedule?.getModel()||null;
    if(!model||!window.LNOverlapAudit){$('[data-lna-status]').textContent='연결 통합표 데이터 준비 중';return;}
    if(!target||target<5)target=model.last+1;
    renderCurrent();
    if(!history.length)$('[data-lna-status]').textContent='선택 회차 그림은 바로 확인할 수 있습니다. 과거 전체 흐름은 위 복기 버튼으로 계산하세요.';
  };
  $('[data-lna-run]').addEventListener('click',audit);
  $('[data-lna-layout]').addEventListener('change',()=>{selectedLine='';lineShown=15;renderCurrent();if(history.length){aggregate=buildAggregate();renderAggregate();}});
  $('[data-lna-tier]').addEventListener('change',()=>{selectedLine='';lineShown=15;renderCurrent();renderAggregate();});
  $('[data-lna-type]').addEventListener('change',()=>{selectedLine='';lineShown=15;renderCurrent();renderAggregate();});
  $('[data-lna-prev]').addEventListener('click',()=>{target=Math.max(5,target-1);selectedLine='';renderCurrent();});
  $('[data-lna-next]').addEventListener('click',()=>{target=Math.min(availableRound(),target+1);selectedLine='';renderCurrent();});
  $('[data-lna-round]').addEventListener('change',()=>{target=Number($('[data-lna-round]').value)||model?.last+1;selectedLine='';renderCurrent();});
  $('[data-lna-line-more]').addEventListener('click',()=>{lineShown+=15;renderCurrentLines();});
  $('[data-lna-round-more]').addEventListener('click',()=>{shown+=8;renderRounds();});
  $('[data-lna-stats-more]').addEventListener('click',()=>{statsShown+=15;renderAggregate();});
  window.addEventListener('lncs:schedule-ready',()=>{if(!busy){history=[];aggregate=[];target=0;update();}});
  window.addEventListener('lnco:ready',update);
  update();
})();
