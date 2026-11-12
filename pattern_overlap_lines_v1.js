/* Lotto Note: six-column sorted-tier line replay matching the per-round search screenshot. */
(function installSixSlotLineReview(){
  'use strict';
  const main=document.querySelector('#ln-connection-schedule-v1 [data-lncm-master]');
  if(!main||main.querySelector('[data-lna-six]'))return;
  const css=document.createElement('style');
  css.textContent=`
    #ln-connection-schedule-v1 .lna{box-sizing:border-box;width:100%;max-width:100%;min-width:0;padding:13px;margin:14px 0;border:2px solid #d5a95e;border-radius:15px;background:#f4f8ff;color:#183249;box-shadow:0 5px 20px #0002}
    #ln-connection-schedule-v1 .lna h6{color:#17354d;font-size:19px;line-height:1.4;margin:0 0 6px}
    #ln-connection-schedule-v1 .lna h5{color:#214866;font-size:16px;margin:17px 0 7px}
    #ln-connection-schedule-v1 .lna p,#ln-connection-schedule-v1 .lna .lna-caption{font-size:12px;line-height:1.7;color:#425d75;margin:5px 0 10px}
    #ln-connection-schedule-v1 .lna .lna-controlrow{display:flex;flex-wrap:wrap;align-items:end;gap:8px;margin:12px 0}
    #ln-connection-schedule-v1 .lna .lna-controlrow label{flex:1 1 105px;display:flex;flex-direction:column;gap:5px;font-size:12px;font-weight:800;color:#254765;min-width:0}
    #ln-connection-schedule-v1 .lna .lna-controlrow select,#ln-connection-schedule-v1 .lna .lna-controlrow input{box-sizing:border-box;width:100%;min-height:42px;border:1px solid #8da9be;background:#fff;color:#18344a;border-radius:9px;font-size:13px;padding:9px}
    #ln-connection-schedule-v1 .lna button{touch-action:manipulation;cursor:pointer}
    #ln-connection-schedule-v1 .lna button:disabled{opacity:.5;cursor:wait}
    #ln-connection-schedule-v1 .lna .lna-controlrow button{flex:1 1 132px;min-height:42px;background:#f4be60;border:1px solid #bc8942;border-radius:8px;color:#273847;font-weight:900;font-size:13px}
    #ln-connection-schedule-v1 .lna .lna-nav{display:flex;gap:7px;align-items:center;justify-content:space-between;margin:12px 0}
    #ln-connection-schedule-v1 .lna .lna-nav button{flex:1;min-height:41px;background:#e3efff;border:1px solid #a6bfd0;border-radius:8px;color:#1e4965;font-weight:850}
    #ln-connection-schedule-v1 .lna .lna-nav strong{flex:1.15;text-align:center;color:#173b59;font-size:15px;white-space:nowrap}
    #ln-connection-schedule-v1 .lna .lna-status{padding:9px 11px;border-radius:9px;background:#e4effc;color:#264c66;font-size:12px;line-height:1.65;margin:8px 0}
    #ln-connection-schedule-v1 .lna .lna-round-card{padding:11px;margin:10px 0;background:#fff;border:1px solid #b6cddd;border-radius:12px;box-shadow:0 2px 6px #1d3f5d12}
    #ln-connection-schedule-v1 .lna .lna-round-title{font-size:14px;font-weight:900;color:#173954;line-height:1.6;margin:0 0 9px}
    #ln-connection-schedule-v1 .lna .lna-group{padding:10px 0;border-top:1px solid #d4e1ec}
    #ln-connection-schedule-v1 .lna .lna-group:first-of-type{border-top:0}
    #ln-connection-schedule-v1 .lna .lna-group-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;color:#21445f;font-size:12px}
    #ln-connection-schedule-v1 .lna .lna-group-head strong{color:#173852;font-size:14px}
    #ln-connection-schedule-v1 .lna .lna-group-head small{color:#4c6c82;font-size:11px;line-height:1.4}
    #ln-connection-schedule-v1 .lna .lna-six-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;max-width:100%;width:100%;box-sizing:border-box}
    #ln-connection-schedule-v1 .lna .lna-num{min-width:0;min-height:44px;box-sizing:border-box;display:flex;justify-content:center;align-items:center;flex-direction:column;gap:2px;background:#e8effb;color:#233f5d;border:1px solid #95b0c8;border-radius:8px;font-size:14px;font-weight:900;line-height:1.1}
    #ln-connection-schedule-v1 .lna .lna-num.hit{background:#bff0d1;border-color:#43ab77;color:#125a3b}
    #ln-connection-schedule-v1 .lna .lna-num.miss{background:#ffe0e2;border-color:#db8991;color:#962d38}
    #ln-connection-schedule-v1 .lna .lna-num.focus{outline:3px solid #efa322;outline-offset:-3px;background:#ffe7a0;color:#52390d}
    #ln-connection-schedule-v1 .lna .lna-num.hit.focus{background:#96e9ac;color:#154c32}
    #ln-connection-schedule-v1 .lna .lna-num small{font-size:9px;color:inherit;font-weight:800}
    #ln-connection-schedule-v1 .lna .lna-empty{padding:9px;font-size:11px;color:#75899a;background:#f0f4f8;border-radius:8px}
    #ln-connection-schedule-v1 .lna .lna-legend{display:flex;flex-wrap:wrap;gap:6px;margin:9px 0}
    #ln-connection-schedule-v1 .lna .lna-legend span{font-size:11px;padding:5px 7px;border-radius:7px;border:1px solid #b6c9d9;background:#fff;color:#38566d}
    #ln-connection-schedule-v1 .lna .lna-legend .good{background:#d9f8e7;color:#14643f}
    #ln-connection-schedule-v1 .lna .lna-legend .bad{background:#ffe5e7;color:#9a3440}
    #ln-connection-schedule-v1 .lna .lna-line-list{display:grid;gap:7px;margin:10px 0}
    #ln-connection-schedule-v1 .lna .lna-line-list button{width:100%;min-height:55px;padding:9px 10px;text-align:left;display:flex;align-items:center;gap:8px;justify-content:space-between;border:1px solid #b4cbdc;border-radius:10px;background:#fff;color:#254663}
    #ln-connection-schedule-v1 .lna .lna-line-list button.selected{border:2px solid #d99827;background:#fff1c9}
    #ln-connection-schedule-v1 .lna .lna-line-list button.exclude{border-color:#efacb0}
    #ln-connection-schedule-v1 .lna .lna-line-list .lna-description{flex:1;min-width:0;font-size:12px;line-height:1.55;color:#34546b}
    #ln-connection-schedule-v1 .lna .lna-line-list .lna-description b{font-size:13px;color:#1d3e58}
    #ln-connection-schedule-v1 .lna .lna-line-list .lna-result{flex:none;min-width:78px;max-width:90px;font-size:11px;font-weight:900;text-align:right;color:#386b59}
    #ln-connection-schedule-v1 .lna .lna-line-list button.exclude .lna-result{color:#a5424b}
    #ln-connection-schedule-v1 .lna .lna-note{background:#e8f2ff;border-left:4px solid #8daec9;border-radius:5px;color:#345269;font-size:11px;line-height:1.7;padding:9px;margin:10px 0}
    #ln-connection-schedule-v1 .lna .lna-history{display:grid;gap:9px;margin:9px 0}
    #ln-connection-schedule-v1 .lna .lna-history details{background:#fff;border:1px solid #b5cada;border-radius:10px;overflow:hidden}
    #ln-connection-schedule-v1 .lna .lna-history summary{cursor:pointer;padding:11px;background:#e2effc;color:#1f4663;font-size:12px;line-height:1.6;font-weight:850}
    #ln-connection-schedule-v1 .lna .lna-history details[open] summary{background:#d6e8f8}
    #ln-connection-schedule-v1 .lna .lna-history .lna-round-card{border:0;margin:0;box-shadow:none;border-radius:0}
    #ln-connection-schedule-v1 .lna .lna-history .lna-view-round{display:block;width:100%;border:1px solid #96b5ce;background:#e4f2ff;color:#214766;min-height:39px;margin:6px 0 0;border-radius:9px}
    #ln-connection-schedule-v1 .lna .lna-tablewrap{width:100%;max-width:100%;overflow-x:auto}
    #ln-connection-schedule-v1 .lna .lna-tablewrap table{width:100%;table-layout:auto;border-collapse:collapse;font-size:11px}
    #ln-connection-schedule-v1 .lna .lna-tablewrap th,#ln-connection-schedule-v1 .lna .lna-tablewrap td{border:1px solid #bed1dc;padding:9px 5px;color:#25455c;background:#fff;text-align:center;vertical-align:middle}
    #ln-connection-schedule-v1 .lna .lna-tablewrap th{background:#e2f0fc;color:#244c68}
    #ln-connection-schedule-v1 .lna .lna-tablewrap tr:nth-child(even) td{background:#f2f8ff}
    #ln-connection-schedule-v1 .lna .lna-trend{display:grid;gap:9px;margin:9px 0}
    #ln-connection-schedule-v1 .lna .lna-trend-item{border-radius:10px;border:1px solid #b3cada;background:#fff;padding:10px}
    #ln-connection-schedule-v1 .lna .lna-trend-item b{font-size:12px;color:#234760}
    #ln-connection-schedule-v1 .lna .lna-trend-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:3px;margin:7px 0 0}
    #ln-connection-schedule-v1 .lna .lna-trend-grid button{min-width:0;min-height:38px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:1px 0;border-radius:5px;border:1px solid #c0ccdb;background:#f2f5fa;color:#536776}
    #ln-connection-schedule-v1 .lna .lna-trend-grid button.hit{background:#c1efd3;border-color:#62bd88;color:#226442}
    #ln-connection-schedule-v1 .lna .lna-trend-grid button.miss{background:#ffd7db;border-color:#dc8e95;color:#9b3440}
    #ln-connection-schedule-v1 .lna .lna-trend-grid button span{font-size:11px;font-weight:900}
    #ln-connection-schedule-v1 .lna .lna-trend-grid button small{font-size:8px}
    #ln-connection-schedule-v1 .lna .lna-more{display:block;width:100%;min-height:42px;margin:10px 0;background:#e4effc;border:1px solid #9ab8d0;border-radius:8px;color:#24506e;font-weight:850}
    #ln-connection-schedule-v1 .lna [hidden]{display:none!important}
    @media(max-width:700px){
      #ln-connection-schedule-v1 .lna{padding:9px}
      #ln-connection-schedule-v1 .lna .lna-six-grid{gap:4px}
      #ln-connection-schedule-v1 .lna .lna-num{min-height:41px;font-size:13px}
      #ln-connection-schedule-v1 .lna .lna-round-card{padding:9px}
      #ln-connection-schedule-v1 .lna .lna-trend-grid{gap:2px}
      #ln-connection-schedule-v1 .lna .lna-trend-grid button{min-height:34px}
      #ln-connection-schedule-v1 .lncm-master .lna .lna-tablewrap table{display:table!important;table-layout:auto!important;width:100%!important}
      #ln-connection-schedule-v1 .lncm-master .lna .lna-tablewrap thead{display:table-header-group!important}
      #ln-connection-schedule-v1 .lncm-master .lna .lna-tablewrap tbody{display:table-row-group!important}
      #ln-connection-schedule-v1 .lncm-master .lna .lna-tablewrap tr{display:table-row!important;border:0!important;background:none!important;padding:0!important;overflow:visible!important}
      #ln-connection-schedule-v1 .lncm-master .lna .lna-tablewrap th,#ln-connection-schedule-v1 .lncm-master .lna .lna-tablewrap td{display:table-cell!important;grid-column:auto!important;border:1px solid #bed1dc!important;border-radius:0!important;background:#fff!important;font-size:11px;padding:8px 3px!important}
    }
  `;
  main.append(css);
  const panel=document.createElement('section');panel.className='lna';panel.dataset.lnaSix='1';
  panel.innerHTML=`
    <h6>📐 회차별 검색번호 6칸 배열 · 가로·세로·대각 복기</h6>
    <p>검색 결과를 사진처럼 <b>1건·2건·3건… 번호군별로 나누고, 작은 번호부터 한 줄에 정확히 6개씩</b> 배치합니다. 해당 번호군에서 만들어지는 실제 가로·세로·대각선 라인을 검증합니다.</p>
    <div class="lna-controlrow">
      <label>복기 기간<select data-lna-period>
        <option value="20">최근 20회</option><option value="50" selected>최근 50회</option>
        <option value="100">최근 100회</option><option value="250">최근 250회</option>
        <option value="all">전체 과거 회차</option>
      </select></label>
      <button type="button" data-lna-audit>📊 회차·라인 복기 실행</button>
    </div>
    <div class="lna-controlrow">
      <label>검증할 회차<input data-lna-round type="number" min="5" inputmode="numeric"></label>
      <label>중복번호군<select data-lna-tier>
        <option value="all">1건~6건+ 전체</option>
        <option value="1">1건</option><option value="2">2건</option><option value="3">3건</option>
        <option value="4">4건</option><option value="5">5건</option><option value="6">6건 이상</option>
      </select></label>
      <label>분석 방향<select data-lna-kind>
        <option value="all">가로·세로·대각 전체</option>
        <option value="H">가로</option><option value="V">세로 (첫·끝 열)</option>
        <option value="D">↘ 대각</option><option value="A">↙ 대각</option>
      </select></label>
    </div>
    <div class="lna-nav">
      <button type="button" data-lna-prev>◀ 이전 회차</button>
      <strong data-lna-heading>회차 연결 중</strong>
      <button type="button" data-lna-next>다음 회차 ▶</button>
    </div>
    <div class="lna-status" data-lna-status>해당 회차 검색번호를 준비하고 있습니다.</div>
    <h5>① 선택 회차 · 사진과 동일한 6칸 번호 배열</h5>
    <div data-lna-selected></div>
    <div class="lna-legend">
      <span>기본: 결과 대기</span><span class="good">초록: 출현</span><span class="bad">분홍: 미출현</span>
      <span>금색: 선택한 가로·세로·대각선</span>
    </div>
    <h5>② 번호군 안의 가로·세로·대각선</h5>
    <p class="lna-caption">각 번호군의 6칸 배열에서 두 칸 이상 이어지는 라인을 표시합니다. 라인을 누르면 위 숫자칸에서 위치를 확인할 수 있습니다.</p>
    <div class="lna-line-list" data-lna-lines></div>
    <button class="lna-more" type="button" data-lna-line-more hidden>다른 라인 더 보기</button>
    <h5>③ 회차별 검색번호 · 세로 연속 복기</h5>
    <p class="lna-caption">1207회, 1206회처럼 번호를 1건·2건·3건… 순서로 아래에 계속 쌓습니다. 각 회차를 펼치면 여섯 칸 배열로 나옵니다.</p>
    <div class="lna-history" data-lna-history></div>
    <button class="lna-more" type="button" data-lna-history-more hidden>이전 회차 더 보기</button>
    <h5>④ 같은 번호군·같은 라인의 과거 미출현 비교</h5>
    <div class="lna-tablewrap" data-lna-stats></div>
    <button class="lna-more" type="button" data-lna-stats-more hidden>다른 라인 통계 더 보기</button>
    <h5>⑤ 라인별 최근 12회 흐름</h5>
    <div class="lna-trend" data-lna-trend></div>
    <div class="lna-note">**주의:** 번호가 두 개 있는 라인이 전부 미출현할 확률은 원래 약 74.85%, 세 개면 약 64.40%입니다. 실제 미출현율과 동일 규모 무작위 기대치를 함께 보세요. 여기서의 가로·세로·대각은 매 회차의 <b>검색번호 정렬 위치</b>이며 고정 번호판의 위치가 아닙니다. 여러 라인을 탐색한 사후 결과는 미래 제외 가능성을 보증하지 않습니다.</div>
  `;
  const prev=main.querySelector('[data-lnco]');
  if(prev)prev.after(panel);else main.querySelector('[data-lncm-stats]')?.after(panel);
  const $=s=>panel.querySelector(s);
  const tiers=['1','2','3','4','5','6'];
  const tierName=t=>t==='6'?'6건+':t+'건';
  const classify=n=>n>=6?'6':String(n);
  let model=null,target=0,history=[],aggregate=[],selected='',linesVisible=18,historyVisible=8,statsVisible=12,busy=false;
  const fmt=n=>n.toLocaleString('ko-KR');
  const zeroProb=n=>{
    let p=1;
    for(let i=0;i<6;i++)p*=(45-n-i)/(45-i);
    return Math.max(0,p);
  };
  const groupsOf=count=>{
    const output=Object.fromEntries(tiers.map(t=>[t,[]]));
    if(!count)return output;
    for(let n=1;n<=45;n++)if(count[n]>0)output[classify(count[n])].push(n);
    return output;
  };
  // Slots are the photo's six sorted-number columns WITHIN EACH tier,
  // not a separate fixed 1–45 lottery board.
  function linesOf(numbers,t){
    const width=6,rows=Math.ceil(numbers.length/width),result=[];
    const at=(r,c)=>r>=0&&c>=0&&c<width&&r<rows?numbers[r*width+c]:undefined;
    const add=(kind,id,title,locs)=>{
      const ns=locs.map(([r,c])=>at(r,c)).filter(n=>Number.isInteger(n));
      if(ns.length<2)return;
      result.push({kind,id:t+':'+kind+':'+id,t,title,ns});
    };
    for(let r=0;r<rows;r++){
      const seq=[];for(let c=0;c<width;c++)seq.push([r,c]);
      add('H',r,'가로 '+(r+1)+'줄',seq);
    }
    for(let c=0;c<width;c++){
      const seq=[];for(let r=0;r<rows;r++)seq.push([r,c]);
      add('V',c,'세로 '+(c+1)+'열'+(c===0?' (첫수)':c===5?' (끝수)':''),seq);
    }
    for(const kind of ['D','A']){
      const shift=kind==='D'?1:-1,edge=kind==='D'?0:5,dir=kind==='D'?'↘':'↙';
      for(let c=0;c<width;c++){
        const seq=[];for(let r=0,curr=c;r<rows&&curr>=0&&curr<width;r++,curr+=shift)seq.push([r,curr]);
        add(kind,'T'+c,dir+' 대각 (윗줄 '+(c+1)+'칸 시작)',seq);
      }
      for(let start=1;start<rows;start++){
        const seq=[];for(let r=start,c=edge;r<rows&&c>=0&&c<width;r++,c+=shift)seq.push([r,c]);
        add(kind,'S'+start,dir+' 대각 ('+(start+1)+'줄 시작)',seq);
      }
    }
    return result;
  }
  const allLines=entry=>{
    const groups=groupsOf(entry.count);
    return tiers.flatMap(t=>linesOf(groups[t],t));
  };
  const currentData=()=>{
    const count=window.LNOverlapAudit?.countConnections(target,model?.byDraw);
    const actual=model?.byDraw?.[target] instanceof Set?model.byDraw[target]:null;
    return count?{round:target,count,actual}:null;
  };
  function renderTier(t,nums,actual,focus){
    const section=document.createElement('section');section.className='lna-group';
    const heading=document.createElement('div');heading.className='lna-group-head';
    const name=document.createElement('strong');name.textContent=tierName(t);
    const hits=actual?nums.filter(n=>actual.has(n)).length:null;
    const summary=document.createElement('small');summary.textContent=nums.length+'수'+(hits===null?' · 결과 대기':' · 출현 '+hits+'수 / 미출현 '+(nums.length-hits)+'수');
    heading.append(name,summary);section.append(heading);
    if(!nums.length){const empty=document.createElement('div');empty.className='lna-empty';empty.textContent='이 중복군 번호 없음';section.append(empty);return section;}
    const grid=document.createElement('div');grid.className='lna-six-grid';
    for(const n of nums){
      const node=document.createElement('div');
      node.className='lna-num'+(actual?(actual.has(n)?' hit':' miss'):'')+(focus?.has(n)?' focus':'');
      const main=document.createElement('span');main.textContent=n;
      node.append(main);
      if(actual){const small=document.createElement('small');small.textContent=actual.has(n)?'✓ 출현':'× 미출';node.append(small);}
      grid.append(node);
    }
    section.append(grid);return section;
  }
  function buildCard(entry,focus,compact=false){
    const box=document.createElement('div');box.className='lna-round-card';
    const groups=groupsOf(entry.count);
    const all=Object.values(groups).flat(),actual=entry.actual;
    const hits=actual?all.filter(n=>actual.has(n)).length:null;
    const title=document.createElement('div');title.className='lna-round-title';
    title.textContent='▼ '+entry.round+'회 · 연결 '+all.length+'수'+(actual?' 중 출현 '+hits+'수':' · 추첨 전 결과 대기')+
      (actual?' · 당첨 '+[...actual].sort((a,b)=>a-b).join(' · '):'');
    box.append(title);
    for(const t of tiers){if(compact&&!groups[t].length)continue;box.append(renderTier(t,groups[t],actual,focus?.t===t?new Set(focus.ns):null));}
    return box;
  }
  function makeTable(headers,rows){
    const table=document.createElement('table'),thead=document.createElement('thead'),tr=document.createElement('tr');
    for(const h of headers){const th=document.createElement('th');th.textContent=h;tr.append(th);}
    thead.append(tr);table.append(thead);
    const tbody=document.createElement('tbody');
    for(const data of rows){
      const row=document.createElement('tr');
      for(const v of data){const td=document.createElement('td');td.textContent=String(v);row.append(td);}
      tbody.append(row);
    }
    table.append(tbody);return table;
  }
  function selectRound(n){
    model=window.LNConnectionSchedule?.getModel()||null;
    if(!model)return;
    const limit=model.last+1;
    target=Math.max(5,Math.min(limit,Number(n)||limit));
    selected='';linesVisible=18;
    renderSelected();
  }
  function renderSelected(){
    model=window.LNConnectionSchedule?.getModel()||null;
    if(!model||!window.LNOverlapAudit)return;
    if(!target)target=model.last+1;
    target=Math.max(5,Math.min(model.last+1,target));
    $('[data-lna-round]').max=model.last+1;
    $('[data-lna-round]').value=target;
    $('[data-lna-heading]').textContent=target+'회'+(target>model.last?' · 예정':' · 복기');
    const entry=currentData();if(!entry)return;
    const lines=allLines(entry),focus=lines.find(l=>l.id===selected);
    const place=$('[data-lna-selected]');place.textContent='';place.append(buildCard(entry,focus));
    renderLineList(entry,lines);
    if(!history.length)$('[data-lna-status]').textContent='6칸 번호 배열을 표시했습니다. 과거 회차별 흐름은 위 복기 버튼을 눌러주세요.';
  }
  function filteredLines(entry){
    const filterTier=$('[data-lna-tier]').value,kind=$('[data-lna-kind]').value;
    return allLines(entry).filter(l=>(filterTier==='all'||l.t===filterTier)&&(kind==='all'||l.kind===kind));
  }
  function renderLineList(entry,source){
    const root=$('[data-lna-lines]');root.textContent='';
    const kind=$('[data-lna-kind]').value,t=$('[data-lna-tier]').value;
    const list=(source||allLines(entry)).filter(l=>(t==='all'||l.t===t)&&(kind==='all'||l.kind===kind))
      .sort((a,b)=>(a.kind==='V'?-1:0)-(b.kind==='V'?-1:0)||b.ns.length-a.ns.length||Number(a.t)-Number(b.t));
    for(const line of list.slice(0,linesVisible)){
      const misses=entry.actual?line.ns.filter(n=>!entry.actual.has(n)).length:null;
      const hits=misses===null?null:line.ns.length-misses;
      const button=document.createElement('button');button.type='button';
      button.className=(misses===line.ns.length?'exclude ':'')+(selected===line.id?'selected':'');
      const label=document.createElement('div');label.className='lna-description';
      const header=document.createElement('b');header.textContent=tierName(line.t)+' · '+line.title+' · '+line.ns.length+'수';
      const detail=document.createElement('div');detail.textContent=line.ns.join(' · ')+'  |  무출현 기대 '+(100*zeroProb(line.ns.length)).toFixed(1)+'%';
      label.append(header,detail);
      const result=document.createElement('strong');result.className='lna-result';
      result.textContent=hits===null?'⏳ 대기':hits===0?'× 전부 미출현':'✓ 출현 '+hits+'수';
      button.append(label,result);
      button.addEventListener('click',()=>{
        selected=selected===line.id?'':line.id;
        const focus=selected?line:null;
        const display=$('[data-lna-selected]');display.textContent='';display.append(buildCard(entry,focus));
        renderLineList(entry,source);
      });root.append(button);
    }
    const more=$('[data-lna-line-more]');more.hidden=list.length<=linesVisible;
    more.textContent='다른 라인 '+Math.min(18,list.length-linesVisible)+'개 더 보기 ('+Math.min(linesVisible,list.length)+'/'+list.length+')';
    if(!list.length)root.textContent='선택 조건에서 두 번호 이상 연결된 라인이 없습니다.';
  }
  function renderHistory(){
    const root=$('[data-lna-history]');root.textContent='';
    for(const [i,entry] of history.slice(0,historyVisible).entries()){
      const details=document.createElement('details');details.open=i<2;
      const heading=document.createElement('summary');
      const groups=groupsOf(entry.count),nums=Object.values(groups).flat();
      const hits=nums.filter(n=>entry.actual.has(n)).length;
      heading.textContent=entry.round+'회 · 연결 '+nums.length+'수 · 출현 '+hits+'수 · 당첨 '+[...entry.actual].sort((a,b)=>a-b).join(' · ');
      details.append(heading);
      const card=buildCard(entry,null,true);details.append(card);
      const visit=document.createElement('button');visit.type='button';visit.className='lna-view-round';visit.textContent='📐 이 회차 가로·세로·대각 분석';
      visit.addEventListener('click',()=>{selectRound(entry.round);panel.scrollIntoView({behavior:'smooth',block:'start'});});
      details.append(visit);root.append(details);
    }
    const more=$('[data-lna-history-more]');more.hidden=historyVisible>=history.length;
    more.textContent='이전 '+Math.min(8,history.length-historyVisible)+'회 더 보기 ('+Math.min(historyVisible,history.length)+'/'+history.length+')';
  }
  function makeStats(){
    const index=new Map();
    for(const entry of history){
      for(const line of allLines(entry)){
        const ns=line.ns;
        let row=index.get(line.id);
        if(!row){row={...line,rounds:0,none:0,expected:0,hits:0,total:0};index.set(line.id,row);}
        const hits=ns.filter(n=>entry.actual.has(n)).length;
        row.rounds++;row.none+=hits===0?1:0;row.expected+=zeroProb(ns.length);row.hits+=hits;row.total+=ns.length;
      }
    }
    return [...index.values()].filter(x=>x.rounds>=8)
      .map(x=>({...x,diff:x.none/x.rounds-x.expected/x.rounds}))
      .sort((a,b)=>b.diff-a.diff||b.rounds-a.rounds);
  }
  function filteredStats(){
    const t=$('[data-lna-tier]').value,kind=$('[data-lna-kind]').value;
    return aggregate.filter(x=>(t==='all'||x.t===t)&&(kind==='all'||x.kind===kind));
  }
  function renderStats(){
    const root=$('[data-lna-stats]');root.textContent='';
    if(!history.length){root.textContent='복기 범위를 선택해 실행하면 라인별 누적 통계가 나타납니다.';return;}
    const data=filteredStats(),rows=data.slice(0,statsVisible).map(x=>[
      tierName(x.t)+' · '+x.title,x.rounds+'회',
      x.none+'회 ('+(100*x.none/x.rounds).toFixed(1)+'%)',
      (100*x.expected/x.rounds).toFixed(1)+'%'
    ]);
    root.append(makeTable(['중복군 · 위치','관찰','전부 미출현','무작위 기대'],rows));
    if(!rows.length){const msg=document.createElement('p');msg.textContent='이 조건에서 8회 이상 관찰된 라인이 없습니다.';root.append(msg);}
    const more=$('[data-lna-stats-more]');more.hidden=statsVisible>=data.length;
    more.textContent='라인 통계 '+Math.min(12,data.length-statsVisible)+'개 더 보기';
    renderTrends();
  }
  function renderTrends(){
    const root=$('[data-lna-trend]');root.textContent='';
    const top=filteredStats().slice(0,5);
    const recent=history.slice(0,12).reverse();
    for(const line of top){
      const wrap=document.createElement('div');wrap.className='lna-trend-item';
      const heading=document.createElement('b');
      heading.textContent=tierName(line.t)+' · '+line.title+' (전부 미출현 '+line.none+'/'+line.rounds+'회)';
      wrap.append(heading);
      const grid=document.createElement('div');grid.className='lna-trend-grid';
      for(const entry of recent){
        const matched=allLines(entry).find(x=>x.id===line.id),hit=matched&&matched.ns.some(n=>entry.actual.has(n));
        const button=document.createElement('button');button.type='button';
        button.className=!matched?'':hit?'hit':'miss';
        const round=document.createElement('small');round.textContent=String(entry.round%100).padStart(2,'0');
        const symbol=document.createElement('span');symbol.textContent=!matched?'–':hit?'✓':'×';
        button.append(round,symbol);
        button.title=entry.round+'회 · '+(!matched?'해당 라인 없음':hit?'출현':'전부 미출현');
        button.setAttribute('aria-label',button.title);
        button.addEventListener('click',()=>{
          selectRound(entry.round);
          selected=matched?line.id:'';
          renderSelected();panel.scrollIntoView({behavior:'smooth',block:'start'});
        });grid.append(button);
      }
      wrap.append(grid);root.append(wrap);
    }
    if(!top.length)root.textContent='복기한 회차에서 충분히 반복된 라인이 없습니다.';
  }
  async function audit(){
    if(busy)return;
    model=window.LNConnectionSchedule?.getModel()||null;
    if(!model||!window.LNOverlapAudit){$('[data-lna-status]').textContent='당첨번호 연결 기록을 먼저 불러와 주세요.';return;}
    const last=model.last,choice=$('[data-lna-period]').value,start=choice==='all'?5:Math.max(5,last-Number(choice)+1);
    busy=true;
    const btn=$('[data-lna-audit]'),sel=$('[data-lna-period]');
    btn.disabled=true;sel.disabled=true;history=[];aggregate=[];
    $('[data-lna-history]').textContent='';$('[data-lna-stats]').textContent='';$('[data-lna-trend]').textContent='';
    try{
      const results=[];
      for(let r=last;r>=start;r--){
        const actual=model.byDraw[r],count=window.LNOverlapAudit.countConnections(r,model.byDraw);
        if(!(actual instanceof Set)||actual.size!==6)throw Error(r+'회 당첨번호가 올바르지 않습니다.');
        results.push({round:r,actual,count});
        if((last-r+1)%7===0){
          $('[data-lna-status]').textContent='복기 진행 '+(last-r+1)+'/'+(last-start+1)+'회';
          await new Promise(resolve=>setTimeout(resolve,0));
        }
      }
      if(window.LNConnectionSchedule?.getModel()?.last!==last)throw Error('새 회차가 로드되어 복기를 다시 실행해야 합니다.');
      history=results;aggregate=makeStats();historyVisible=8;statsVisible=12;
      renderHistory();renderStats();
      $('[data-lna-status]').textContent='✓ '+start+'~'+last+'회 '+history.length+'회 복기 완료 · 각 회차 이전 기록만 사용';
    }catch(e){history=[];aggregate=[];$('[data-lna-status]').textContent='복기 실패: '+e.message;}
    finally{busy=false;btn.disabled=false;sel.disabled=false;}
  }
  function refresh(){
    if(busy)return;
    model=window.LNConnectionSchedule?.getModel()||null;
    if(!model||!window.LNOverlapAudit){$('[data-lna-status]').textContent='연결 데이터를 불러오는 중입니다.';return;}
    if(!target||target>model.last+1)target=model.last+1;
    renderSelected();
  }
  $('[data-lna-audit]').addEventListener('click',audit);
  $('[data-lna-round]').addEventListener('change',()=>selectRound($('[data-lna-round]').value));
  $('[data-lna-prev]').addEventListener('click',()=>selectRound(target-1));
  $('[data-lna-next]').addEventListener('click',()=>selectRound(target+1));
  const changeFilters=()=>{selected='';linesVisible=18;renderSelected();renderStats();};
  $('[data-lna-tier]').addEventListener('change',changeFilters);
  $('[data-lna-kind]').addEventListener('change',changeFilters);
  $('[data-lna-line-more]').addEventListener('click',()=>{linesVisible+=18;renderSelected();});
  $('[data-lna-history-more]').addEventListener('click',()=>{historyVisible+=8;renderHistory();});
  $('[data-lna-stats-more]').addEventListener('click',()=>{statsVisible+=12;renderStats();});
  window.addEventListener('lnco:ready',refresh);
  window.addEventListener('lncs:schedule-ready',()=>{if(!busy){history=[];aggregate=[];target=0;refresh();}});
  refresh();
})();
