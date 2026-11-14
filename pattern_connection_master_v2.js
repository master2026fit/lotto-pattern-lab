/* LOTTO NOTE: cross-draw survival calendar and replayable verification log. */
(()=>{
  'use strict';
  const root=document.querySelector('#ln-connection-schedule-v1');
  const main=root?.querySelector('[data-lncs-main]');
  if(!main||main.querySelector('[data-lncm-master]'))return;
  const style=document.createElement('style');
  style.textContent=`
    #ln-connection-schedule-v1 .lncm-master{margin:14px 0;padding:13px;background:#092b3f;border:2px solid #d9b06d;border-radius:14px;color:#edf7ff}
    #ln-connection-schedule-v1 .lncm-master h5{font-size:19px;color:#ffdc99;margin:0 0 8px}
    #ln-connection-schedule-v1 .lncm-master h6{font-size:16px;color:#a8efd0;margin:18px 0 8px}
    #ln-connection-schedule-v1 .lncm-note{color:#bcd7e6;font-size:12px;line-height:1.65;margin:5px 0 10px}
    #ln-connection-schedule-v1 .lncm-status{padding:9px;color:#ffdfac;font-size:13px;font-weight:800}
    #ln-connection-schedule-v1 .lncm-stats{display:flex;gap:7px;flex-wrap:wrap;margin:9px 0}
    #ln-connection-schedule-v1 .lncm-stats span{border:1px solid #668da5;background:#163e59;border-radius:9px;padding:7px 10px;font-size:12px;font-weight:800}
    #ln-connection-schedule-v1 .lncm-filters{display:flex;gap:8px;flex-wrap:wrap;margin:11px 0}
    #ln-connection-schedule-v1 .lncm-filters label{display:flex;gap:5px;align-items:center;color:#d3e9f2;font-size:12px}
    #ln-connection-schedule-v1 .lncm-filters select{background:#e8f5ff;color:#17334a;border-radius:7px;border:1px solid #8fc5df;padding:7px;font-size:13px;font-weight:850}
    #ln-connection-schedule-v1 .lncm-scroll{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
    #ln-connection-schedule-v1 .lncm-master table{width:100%;border-spacing:0 5px;border-collapse:separate;table-layout:fixed;font-size:12px}
    #ln-connection-schedule-v1 .lncm-master th{text-align:left;color:#e8f2f9;padding:5px 4px;border-bottom:1px solid #67899b}
    #ln-connection-schedule-v1 .lncm-master td{padding:9px 4px;background:#1a4056;border-top:1px solid #456c83;border-bottom:1px solid #456c83;vertical-align:middle;overflow-wrap:anywhere}
    #ln-connection-schedule-v1 .lncm-master td:first-child{border-left:1px solid #456c83;border-radius:8px 0 0 8px}
    #ln-connection-schedule-v1 .lncm-master td:last-child{border-right:1px solid #456c83;border-radius:0 8px 8px 0}
    #ln-connection-schedule-v1 .lncm-master strong{color:#ffdfaa;font-size:13px}
    #ln-connection-schedule-v1 .lncm-master small{display:block;color:#b8d7e7;font-size:11px;line-height:1.5}
    #ln-connection-schedule-v1 .lncm-master button{cursor:pointer;border-radius:8px;border:1px solid #73baa7;background:#215b69;color:#e1ffe8;padding:9px 7px;font-size:12px;font-weight:900;min-height:39px}
    #ln-connection-schedule-v1 .lncm-master button:focus-visible{outline:3px solid #ffdc8b;outline-offset:2px}
    #ln-connection-schedule-v1 .lncm-target{font-size:15px;color:#ffdfaa;font-weight:900}
    #ln-connection-schedule-v1 .lncm-date{display:block;font-size:11px!important;white-space:nowrap;letter-spacing:-.35px;font-variant-numeric:tabular-nums}
    #ln-connection-schedule-v1 .lncm-detail{background:#0e324b;border:1px solid #638b98;padding:9px;border-radius:10px;margin:5px 0 12px}
    #ln-connection-schedule-v1 .lncm-detail-title{color:#d7f7e8;font-weight:850;margin:2px 0 7px;font-size:13px}
    #ln-connection-schedule-v1 .lncm-path-table tr.lncm-picked td{background:#365b6b;border-color:#f4bf63}
    #ln-connection-schedule-v1 .lncm-path-table tr.lncm-flash td{background:#725128!important;border-color:#ffe3a0}
    #ln-connection-schedule-v1 .lncm-path-table tr{scroll-margin-top:90px;scroll-margin-bottom:95px}
    #ln-connection-schedule-v1 .lncm-load{width:100%;margin:7px 0;background:#315d75!important;border-color:#8eaebd!important}
    #ln-connection-schedule-v1 .lncm-recap{font-size:12px;line-height:1.5}
    #ln-connection-schedule-v1 .lncm-recap strong{font-size:12px}
    #ln-connection-schedule-v1 .lncm-master{max-width:100%;min-width:0;box-sizing:border-box}
    #ln-connection-schedule-v1 .lncm-group{margin:8px 0 12px}
    #ln-connection-schedule-v1 .lncm-filter-row{display:flex;align-items:flex-end;flex-wrap:wrap;gap:8px}
    #ln-connection-schedule-v1 .lncm-filters label{flex-direction:column;align-items:stretch;gap:5px;min-width:95px}
    #ln-connection-schedule-v1 .lncm-filters input{width:100%;box-sizing:border-box;background:#e8f5ff;color:#17334a;border-radius:7px;border:1px solid #8fc5df;padding:8px;font-size:13px;min-height:38px}
    #ln-connection-schedule-v1 .lncm-filters select{box-sizing:border-box;min-height:38px;max-width:100%}
    #ln-connection-schedule-v1 .lncm-master [hidden]{display:none!important}
    #ln-connection-schedule-v1 .lncm-path-view{padding:11px;background:#0b263c;border:1px solid #8cbbcd;border-radius:10px;margin:5px 0;max-width:100%;box-sizing:border-box}
    #ln-connection-schedule-v1 .lncm-path-heading{color:#ffde9b;font-size:14px;font-weight:850;margin-bottom:8px;line-height:1.55}
    #ln-connection-schedule-v1 .lncm-steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;width:100%}
    #ln-connection-schedule-v1 .lncm-step{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:4px;min-width:0;min-height:74px;background:#234a63;border:1px solid #56798c;border-radius:8px;padding:6px 1px;box-sizing:border-box;text-align:center}
    #ln-connection-schedule-v1 .lncm-step b{font-size:16px;color:#ffdfaa;line-height:1.2}
    #ln-connection-schedule-v1 .lncm-step small{font-size:10px;color:#d1e7f5;line-height:1.2}
    #ln-connection-schedule-v1 .lncm-step em{font-size:10px;color:#b5d7e6;font-style:normal;line-height:1.2}
    #ln-connection-schedule-v1 .lncm-step.final{border:2px solid #ffd17c;background:#4a3c2b}
    #ln-connection-schedule-v1 .lncm-step.final.hit{border-color:#75d2a5;background:#184e40}
    #ln-connection-schedule-v1 .lncm-step.final.miss{border-color:#f6a5b0;background:#542e41}
    #ln-connection-schedule-v1 .lncm-result{font-size:12px;font-weight:850;margin-top:6px}
    #ln-connection-schedule-v1 .lncm-result.hit{color:#aaf5c9}
    #ln-connection-schedule-v1 .lncm-result.miss{color:#ffabb6}
    #ln-connection-schedule-v1 .lncm-result.pending{color:#ffdfa2}
    #ln-connection-schedule-v1 .lncm-close{width:100%;margin-top:9px;background:#315672!important}
    #ln-connection-schedule-v1 .lncm-recap-outcome{line-height:1.65;color:#e9f5fd}
    #ln-connection-schedule-v1 .lncm-recap details{margin-top:7px}
    #ln-connection-schedule-v1 .lncm-recap summary{color:#d8f6e4;cursor:pointer;font-weight:800;border:1px solid #7498a9;border-radius:6px;padding:7px}
    #ln-connection-schedule-v1 .lncm-recap-buttons{display:flex;gap:5px;flex-wrap:wrap;margin:8px 0}
    #ln-connection-schedule-v1 .lncm-recap-buttons button{min-height:35px;padding:6px 9px;font-size:12px}
    #ln-connection-schedule-v1 .lncm-recap-buttons .hit{border-color:#74d3a6;color:#b1f5d1}
    #ln-connection-schedule-v1 .lncm-recap-buttons .miss{border-color:#f3aab0;color:#ffc9cd}
    #ln-connection-schedule-v1 .lncm-recap-view{margin:8px 0}
    #ln-connection-schedule-v1 .lncm-feedback{font-size:12px;color:#b8dceb;line-height:1.6}
    #ln-connection-schedule-v1 .lncm-master button{touch-action:manipulation}
    #ln-connection-schedule-v1 .lncs-float.lncm-hide{display:none!important}
    #ln-connection-schedule-v1 .lncm-round-actions{display:flex;gap:7px;flex-wrap:wrap;margin:6px 0 12px}
    #ln-connection-schedule-v1 .lncm-round-actions button{flex:1 1 165px;min-height:44px}
    #ln-connection-schedule-v1 .lncm-show-all{background:#d8a753!important;border-color:#ffe0a0!important;color:#132c40!important;font-size:13px!important}
    #ln-connection-schedule-v1 .lncm-overview{max-width:100%;min-width:0;box-sizing:border-box;background:#0c283d;border:1px solid #88bdc2;border-radius:12px;padding:10px;margin:9px 0 14px;scroll-margin-top:65px}
    #ln-connection-schedule-v1 .lncm-overview h6{color:#ffe0a5;font-size:16px;margin:3px 0 7px}
    #ln-connection-schedule-v1 .lncm-overview .lncm-note{margin:6px 0}
    #ln-connection-schedule-v1 .lncm-num-grid{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:5px;padding:9px 0 12px}
    #ln-connection-schedule-v1 .lncm-num-grid button,#ln-connection-schedule-v1 .lncm-num-grid span{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1px;min-width:0;min-height:43px;border:1px solid #4c6d84;border-radius:8px;background:#17334a;color:#8fa9c0;box-sizing:border-box;font-size:13px;font-weight:850}
    #ln-connection-schedule-v1 .lncm-num-grid button.active{border:2px solid #d7ae66;background:#304f5f;color:#fff0be}
    #ln-connection-schedule-v1 .lncm-num-grid button.hit{border-color:#68d3a4;background:#185342;color:#d6ffe9}
    #ln-connection-schedule-v1 .lncm-num-grid button.miss{border-color:#f4a2b1;background:#563347;color:#ffe4e6}
    #ln-connection-schedule-v1 .lncm-num-grid small{display:block;font-size:9px;line-height:1.2;color:inherit;font-weight:700}
    #ln-connection-schedule-v1 .lncm-num-section{background:#12334b;border:1px solid #58778d;border-radius:11px;margin:10px 0;padding:9px;scroll-margin-top:80px}
    #ln-connection-schedule-v1 .lncm-num-heading{font-size:14px;font-weight:850;color:#ffe3a7;margin:2px 0 7px}
    #ln-connection-schedule-v1 .lncm-num-section .lncm-path-view{margin:6px 0;padding:8px}
    #ln-connection-schedule-v1 .lncm-alt{width:100%;margin-top:8px}
    #ln-connection-schedule-v1 .lncm-overview-close{display:block;width:100%;margin:12px 0 0;background:#34576f!important}
    #ln-connection-schedule-v1 .lncm-overview-banner{padding:8px 10px;background:#173b54;color:#e9f7ff;font-size:12px;line-height:1.7;border-radius:9px}
    @media(max-width:700px){
      #ln-connection-schedule-v1 .lncm-num-grid{grid-template-columns:repeat(5,minmax(0,1fr));gap:4px}
      #ln-connection-schedule-v1 .lncm-num-grid button,#ln-connection-schedule-v1 .lncm-num-grid span{min-height:43px;font-size:12px}
      #ln-connection-schedule-v1 .lncm-round-actions{gap:6px}
      #ln-connection-schedule-v1 .lncm-num-section{padding:7px}
      #ln-connection-schedule-v1 .lncm-overview{padding:8px}
    }
    @media(max-width:700px){
      #ln-connection-schedule-v1 .lncm-master{width:100%;padding:9px}
      #ln-connection-schedule-v1 .lncm-master .lncm-scroll{overflow:visible;max-width:100%}
      #ln-connection-schedule-v1 .lncm-master table{display:block;width:100%;min-width:0;table-layout:auto;font-size:12px}
      #ln-connection-schedule-v1 .lncm-master colgroup,#ln-connection-schedule-v1 .lncm-master thead{display:none}
      #ln-connection-schedule-v1 .lncm-master tbody{display:grid;gap:8px}
      #ln-connection-schedule-v1 .lncm-master tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:#507186;border-radius:10px;padding:1px;overflow:hidden}
      #ln-connection-schedule-v1 .lncm-master td{display:block;min-width:0;border-radius:0!important;border:0!important;background:#193f57;padding:9px 8px;overflow-wrap:anywhere}
      #ln-connection-schedule-v1 .lncm-master td[data-label]::before{content:attr(data-label);display:block;color:#b9d7eb;font-weight:800;font-size:10px;margin-bottom:5px}
      #ln-connection-schedule-v1 .lncm-group-table td:last-child,
      #ln-connection-schedule-v1 .lncm-path-table td:last-child,
      #ln-connection-schedule-v1 .lncm-recap td:last-child,
      #ln-connection-schedule-v1 .lncm-path-extra>td,
      #ln-connection-schedule-v1 .lncm-master td[colspan]{grid-column:1/-1}
      #ln-connection-schedule-v1 .lncm-group-table td:last-child button,
      #ln-connection-schedule-v1 .lncm-path-table td:last-child button{display:block;width:100%;min-height:42px;font-size:13px}
      #ln-connection-schedule-v1 .lncm-group-table td:nth-child(2),
      #ln-connection-schedule-v1 .lncm-path-table td:nth-child(3){grid-column:1/-1}
      #ln-connection-schedule-v1 .lncm-filters{gap:7px}
      #ln-connection-schedule-v1 .lncm-filters label{flex:1 1 42%;min-width:90px}
      #ln-connection-schedule-v1 .lncm-date{white-space:normal}
      #ln-connection-schedule-v1 .lncm-master button{padding:8px 7px;font-size:12px}
      #ln-connection-schedule-v1 .lncm-path-extra{display:block!important;background:none!important;border:0!important;padding:0!important;overflow:visible!important}
      #ln-connection-schedule-v1 .lncm-path-extra>td{width:100%;box-sizing:border-box;padding:0!important;background:none!important}
      #ln-connection-schedule-v1 .lncm-steps{gap:3px}
      #ln-connection-schedule-v1 .lncm-step{min-height:68px;padding:5px 1px}
      #ln-connection-schedule-v1 .lncm-step b{font-size:14px}
      #ln-connection-schedule-v1 .lncm-step small,#ln-connection-schedule-v1 .lncm-step em{font-size:9px}
    }
  `;

  style.textContent+=\`
    #ln-connection-schedule-v1 .lncm-history{margin:10px 0 0;padding:11px;background:#163a4c;border:1px solid #648b94;border-radius:10px;color:#e8f5ff;font-size:12px;line-height:1.6}
    #ln-connection-schedule-v1 .lncm-history-heading{font-size:14px;color:#ffe2a3;display:block;margin-bottom:6px}
    #ln-connection-schedule-v1 .lncm-history-summary{font-size:13px;font-weight:800;color:#c4f2dc;background:#225146;padding:8px;border-radius:7px}
    #ln-connection-schedule-v1 .lncm-history-note{font-size:11px;color:#d0e2ed;margin:7px 0;line-height:1.65}
    #ln-connection-schedule-v1 .lncm-history-examples{display:flex;flex-wrap:wrap;gap:5px;margin:10px 0}
    #ln-connection-schedule-v1 .lncm-history-examples b{display:block;flex-basis:100%;color:#fff0bf;font-size:11px}
    #ln-connection-schedule-v1 .lncm-history-examples span,#ln-connection-schedule-v1 .lncm-history-all span{display:inline-flex;padding:6px 8px;background:#263e52;border-radius:6px;color:#ebf3f9;font-size:11px}
    #ln-connection-schedule-v1 .lncm-history-examples span.win,#ln-connection-schedule-v1 .lncm-history-all span.win{background:#185c48;color:#b9f9d6}
    #ln-connection-schedule-v1 .lncm-history-examples span.miss,#ln-connection-schedule-v1 .lncm-history-all span.miss{background:#533343;color:#ffd9de}
    #ln-connection-schedule-v1 .lncm-history-examples details{width:100%}
    #ln-connection-schedule-v1 .lncm-history-all{display:flex;flex-wrap:wrap;gap:4px;max-height:300px;overflow-y:auto;margin:7px 0}
    #ln-connection-schedule-v1 .lncm-history-combined{background:#0f3044;border:1px solid #83b1b3;border-radius:9px;padding:10px;margin-top:9px}
    #ln-connection-schedule-v1 .lncm-history-combined summary{cursor:pointer;color:#ffe4b6;font-weight:850;font-size:13px;line-height:1.6}
    #ln-connection-schedule-v1 .lncm-history-table{width:100%!important;display:table!important;table-layout:fixed!important;border-collapse:collapse!important;border-spacing:0!important;font-size:11px!important}
    #ln-connection-schedule-v1 .lncm-history-table thead{display:table-header-group!important}
    #ln-connection-schedule-v1 .lncm-history-table tbody{display:table-row-group!important}
    #ln-connection-schedule-v1 .lncm-history-table tr{display:table-row!important}
    #ln-connection-schedule-v1 .lncm-history-table th,#ln-connection-schedule-v1 .lncm-history-table td{display:table-cell!important;background:#1b4257!important;padding:7px 5px!important;border:1px solid #476c82!important;color:#edf7ff!important;vertical-align:middle!important;text-align:center!important;overflow-wrap:anywhere}
    #ln-connection-schedule-v1 .lncm-history-table .lncm-history-picked td{background:#385846!important;color:#fff3cc!important;font-weight:900}
    @media(max-width:700px){
      #ln-connection-schedule-v1 .lncm-history-table td[data-label]::before{display:none!important}
      #ln-connection-schedule-v1 .lncm-history{padding:9px}
      #ln-connection-schedule-v1 .lncm-history-table td,#ln-connection-schedule-v1 .lncm-history-table th{font-size:10px!important;padding:6px 3px!important}
    }
  \`;
  root.append(style);
  const panel=document.createElement('section');panel.className='lncm-master';panel.dataset.lncmMaster='1';
  panel.innerHTML=`
    <h5>🧭 전체 생존 패턴 · 회차별 검증표</h5>
    <p class="lncm-note">가장 최근 회차뿐 아니라 과거 모든 회차의 <b>실제 4점 이상 연결</b>을 모읍니다. 아직 결과가 나오지 않은 다음 연결 회차부터 정렬합니다. 날짜는 매주 토요일 기준 추첨 예정일입니다.</p>
    <div class="lncm-status" data-lncm-status>전체 연결 일정 불러오는 중…</div>
    <div class="lncm-stats" data-lncm-stats></div>
    <div class="lncm-filters">
      <label>연속성 <select data-lncm-min aria-label="전체 연결 최소 점 수"><option value="4">4점 이상</option><option value="5">5점 이상</option><option value="6">6점 이상</option></select></label>
      <label>대상 번호 <select data-lncm-num aria-label="검증 대상 번호"><option value="0">전체 45수</option></select></label>
      <label>검증 회차 <input data-lncm-round type="number" min="1" inputmode="numeric" placeholder="전체 회차" aria-label="검증 회차 검색"></label>
    </div>
    <p class="lncm-note"><b>📊 회차 전체 그림</b>을 누르면 해당 회차에 연결된 대상 번호가 모두 나타납니다. 각 번호의 이전 4지점 → 해당 회차 결과를 한꺼번에 볼 수 있습니다.</p>
    <div data-lncm-groups></div><button type="button" class="lncm-load" data-lncm-more hidden>다음 검증 회차 더 보기</button>
    <h6>📒 지난 연결 결과 · 출현/미출현 복기</h6>
    <div class="lncm-scroll"><table class="lncm-recap"><thead><tr><th style="width:19%">회차</th><th style="width:24%">연결 결과</th><th style="width:30%">번호별 출현</th><th style="width:27%">기록·그림</th></tr></thead><tbody data-lncm-recaps></tbody></table></div>
    <button type="button" class="lncm-load" data-lncm-recap-more>지난 8회 먼저 보기</button>
    <p class="lncm-note">본당첨 6개 기준입니다. 한 번호에 여러 패턴이 겹쳐도 독립된 기회로 볼 수 없습니다. 사전 저장이 없는 과거 회차는 <b>추첨 전 데이터만으로 재현</b>하며, 실시간 예측 성적으로 계산하지 않습니다. 어느 패턴도 미래 당첨을 보장하지 않습니다.</p>
  `;
  main.insertBefore(panel,main.querySelector('.lncs-source-box'));
  const $=sel=>panel.querySelector(sel);
  const groupArea=$('[data-lncm-groups]'),groupMore=$('[data-lncm-more]');
  const minSelect=$('[data-lncm-min]'),numSelect=$('[data-lncm-num]');
  for(let n=1;n<=45;n++){const option=document.createElement('option');option.value=n;option.textContent=n+'번';numSelect.append(option);}
  let model=null,allGroups=[],visibleGroups=8,openTarget=0,overviewTarget=0,detailLimit=20,selectedPath='',recapCount=8;
  const recapCache=new Map();
  const floating=main.querySelector('[data-lncs-floating]');
  if(floating&&typeof IntersectionObserver==='function'){
    new IntersectionObserver(entries=>{
      floating.classList.toggle('lncm-hide',entries[0].isIntersecting);
    },{threshold:0}).observe(panel);
  }
  const numberList=paths=>[...new Set(paths.map(p=>p.next))].sort((a,b)=>a-b);
  const labelNums=nums=>nums.slice(0,6).join(' · ')+(nums.length>6?' 외 '+(nums.length-6)+'수':'');
  const cell=(value,label='')=>{const td=document.createElement('td');if(label)td.dataset.label=label;if(typeof value==='string')td.textContent=value;else td.append(value);return td;};
  // 제1245회 공식 추첨일(2026-10-10) 기준 예정 추첨일.
  function drawDate(round){
    const d=new Date(Date.UTC(2026,9,10)+(Number(round)-1245)*7*86400000);
    return d.getUTCFullYear()+'.'+String(d.getUTCMonth()+1).padStart(2,'0')+'.'+String(d.getUTCDate()).padStart(2,'0');
  }
  const key=p=>[p.target,p.next,p.gap,p.shift].join('|');

  function makePathDiagram(p,kind='예정 연결'){
    const drawing=document.createElement('div');drawing.className='lncm-path-view';
    const target=p.target,actual=model?.byDraw?.[target];
    const outcome=actual instanceof Set?(actual.has(p.next)?'hit':'miss'):'pending';
    const title=document.createElement('div');title.className='lncm-path-heading';
    title.textContent=target+'회 '+p.next+'번 · '+p.count+'점 연결 · '+kind;
    drawing.append(title);
    const flow=document.createElement('div');flow.className='lncm-steps';
    const steps=Array.isArray(p.steps)&&p.steps.length>=4?p.steps.slice(-4):
      Array.from({length:4},(_,i)=>({round:target-(4-i)*p.gap,num:p.next-(4-i)*p.shift}));
    const points=[...steps,{round:target,num:p.next,final:true}];
    for(const item of points){
      const v=document.createElement('div');v.className='lncm-step'+(item.final?' final '+outcome:'');
      const date=document.createElement('small');date.textContent=item.round+'회';
      const n=document.createElement('b');n.textContent=item.num+'번';
      const caption=document.createElement('em');caption.textContent=item.final?(outcome==='hit'?'출현':outcome==='miss'?'미출현':'결과 대기'):'연결';
      v.append(date,n,caption);flow.append(v);
    }
    drawing.append(flow);
    const line=document.createElement('div');line.className='lncm-result '+outcome;
    line.textContent=(outcome==='hit'?'✓ 출현':outcome==='miss'?'× 미출현':'⏳ 아직 검증 전')+
      ' · 회차 간격 +'+p.gap+'회 · 번호 이동 '+(p.shift>0?'+':'')+p.shift+
      ' · 왼쪽부터 실제 이전 4지점 → 대상 번호';
    drawing.append(line);
    drawing.append(buildHistoricalReview(p));
    return drawing;
  }

  // Backtest each clicked path against its exact gap, shift and pre-draw anchor length.
  // Every observation is a unique (target round, target number); later draws never
  // participate in creating that target's signal.
  const ruleHistoryCache=new Map(),numberHistoryCache=new Map();
  const shapeName=shift=>shift===0?'고정간격':shift>0?'상승사선':'하강사선';
  const percent=(hits,total)=>total?(hits*100/total).toFixed(2)+'%':'자료 없음';
  function ruleHistory(p){
    const id=[model.last,p.gap,p.shift,p.count].join(':');
    if(ruleHistoryCache.has(id))return ruleHistoryCache.get(id);
    const cases=[],draws=model.byDraw,last=model.last;
    for(let target=p.gap*p.count+1;target<=last;target++){
      if(!(draws[target] instanceof Set))continue;
      for(let n=1;n<=45;n++){
        let valid=true;
        for(let step=1;step<=p.count;step++){
          const number=n-step*p.shift,prior=draws[target-step*p.gap];
          if(number<1||number>45||!(prior instanceof Set)||!prior.has(number)){valid=false;break;}
        }
        if(valid)cases.push({round:target,n,hit:draws[target].has(n)});
      }
    }
    ruleHistoryCache.set(id,cases);
    return cases;
  }
  // Historical "same number" classifies a number only after examining ALL of
  // its valid fixed/up/down 4-point connections at that past round.
  function numberHistory(n){
    const id=model.last+':'+n;
    if(numberHistoryCache.has(id))return numberHistoryCache.get(id);
    const entries=[],draws=model.byDraw;
    for(let target=5;target<=model.last;target++){
      if(!(draws[target] instanceof Set))continue;
      let F=0,U=0,D=0;
      for(let gap=1;gap*4<target;gap++){
        const source=draws[target-gap];
        if(!(source instanceof Set))continue;
        for(let shift=-14;shift<=14;shift++){
          const a=n-shift,b=n-2*shift,c=n-3*shift,d=n-4*shift;
          if(a<1||a>45||b<1||b>45||c<1||c>45||d<1||d>45)continue;
          if(!source.has(a))continue;
          if(!draws[target-2*gap]?.has(b)||!draws[target-3*gap]?.has(c)||!draws[target-4*gap]?.has(d))continue;
          if(shift===0)F++;else if(shift>0)U++;else D++;
        }
      }
      if(F||U||D)entries.push({round:target,F,U,D,hit:draws[target].has(n)});
    }
    numberHistoryCache.set(id,entries);
    return entries;
  }
  function currentShapes(p){
    const all=p.target>model.last?
      (model.due.get(p.target)||[]):
      (window.LNConnectionSchedule?.buildPaths(p.target,model.byDraw)||[]);
    const related=all.filter(x=>x.next===p.next&&x.count>=4);
    return related.length?related:[p];
  }
  function buildHistoricalReview(p){
    const outer=document.createElement('div');outer.className='lncm-history';
    const heading=document.createElement('strong');heading.className='lncm-history-heading';
    heading.textContent='📊 이 연결의 과거 출현·미출현 복기';
    outer.append(heading);
    const rule=ruleHistory(p),hits=rule.filter(x=>x.hit).length;
    const headline=document.createElement('div');headline.className='lncm-history-summary';
    headline.textContent=shapeName(p.shift)+' · '+p.gap+'회 간격 · 번호 이동 '+(p.shift>0?'+':'')+p.shift+
      ' · 이전 '+p.count+'점 이상 성립: '+rule.length+'건 중 '+hits+'건 출현 ('+percent(hits,rule.length)+')';
    outer.append(headline);
    const note=document.createElement('p');note.className='lncm-history-note';
    note.textContent='같은 간격·이동폭으로 이전 지점이 연결된 모든 번호·회차를 확인한 관찰 통계입니다. 이 번호만을 뽑은 통계가 아니며, 결과를 알고 연결을 구성하지 않습니다.';
    outer.append(note);
    const examples=document.createElement('div');examples.className='lncm-history-examples';
    const examplesTitle=document.createElement('b');examplesTitle.textContent='최근 동일 조건 사례';examples.append(examplesTitle);
    if(!rule.length){
      const empty=document.createElement('span');empty.textContent='과거 검증 사례 없음';examples.append(empty);
    }else{
      for(const x of rule.slice(-6).reverse()){
        const line=document.createElement('span');line.className=x.hit?'win':'miss';
        line.textContent=x.round+'회 '+x.n+'번 '+(x.hit?'✓ 출현':'× 미출현');examples.append(line);
      }
      if(rule.length>6){
        const more=document.createElement('details');const sum=document.createElement('summary');
        sum.textContent='전체 '+rule.length+'건 보기';
        const list=document.createElement('div');list.className='lncm-history-all';
        for(const x of rule.slice().reverse()){
          const item=document.createElement('span');item.className=x.hit?'win':'miss';
          item.textContent=x.round+'회 '+x.n+'번 '+(x.hit?'✓':'×');list.append(item);
        }
        more.append(sum,list);examples.append(more);
      }
    }
    outer.append(examples);
    const combined=document.createElement('details');combined.className='lncm-history-combined';
    const summary=document.createElement('summary');summary.textContent='🔎 같은 '+p.next+'번 · 고정/상승/하강 겹침 성적 비교';
    combined.append(summary);
    combined.addEventListener('toggle',()=>{
      if(!combined.open||combined.dataset.ready)return;
      combined.dataset.ready='1';
      const related=currentShapes(p),flags={
        F:related.some(x=>x.shift===0),U:related.some(x=>x.shift>0),D:related.some(x=>x.shift<0)
      };
      const count={F:related.filter(x=>x.shift===0).length,U:related.filter(x=>x.shift>0).length,D:related.filter(x=>x.shift<0).length};
      const label=document.createElement('p');label.className='lncm-history-note';
      label.textContent=p.target+'회 '+p.next+'번: 고정 '+count.F+'건 · 상승 '+count.U+'건 · 하강 '+count.D+'건. 과거 회차마다 이 번호의 모든 연결을 같은 기준으로 다시 분류했습니다.';
      combined.append(label);
      const past=numberHistory(p.next);
      const conditions=[
        {label:'고정만',test:v=>v.F>0&&!v.U&&!v.D},
        {label:'상승만',test:v=>v.U>0&&!v.F&&!v.D},
        {label:'하강만',test:v=>v.D>0&&!v.F&&!v.U},
        {label:'고정+하강만',test:v=>v.F>0&&v.D>0&&!v.U},
        {label:'고정+상승만',test:v=>v.F>0&&v.U>0&&!v.D},
        {label:'상승+하강만',test:v=>v.U>0&&v.D>0&&!v.F},
        {label:'세 방향 모두',test:v=>v.F>0&&v.U>0&&v.D>0}
      ];
      const currentCond=conditions.find(c=>c.test(flags));
      const table=document.createElement('table');table.className='lncm-history-table';
      const tr=document.createElement('tr');
      for(const title of ['동일 번호의 모양','과거 출현/사례','출현 비율']){
        const th=document.createElement('th');th.textContent=title;tr.append(th);
      }
      const thead=document.createElement('thead');thead.append(tr);table.append(thead);
      const tbody=document.createElement('tbody');
      let currentCases=[];
      for(const cond of conditions){
        const cases=past.filter(cond.test),wins=cases.filter(x=>x.hit).length;
        const row=document.createElement('tr');
        if(cond===currentCond){row.className='lncm-history-picked';currentCases=cases;}
        for(const value of [cond.label,wins+' / '+cases.length,percent(wins,cases.length)]){
          const td=document.createElement('td');td.textContent=value;row.append(td);
        }
        tbody.append(row);
      }
      table.append(tbody);combined.append(table);
      const exactOne=flags.F&&flags.D&&!flags.U&&count.F===1&&count.D===1&&count.U===0;
      if(exactOne){
        const exact=past.filter(v=>v.F===1&&v.D===1&&v.U===0),wins=exact.filter(x=>x.hit).length;
        const exactNote=document.createElement('p');exactNote.className='lncm-history-note';
        exactNote.textContent='★ 현재처럼 고정 1건 + 하강 1건이 정확히 겹친 경우: '+exact.length+'건 중 '+wins+'건 출현 ('+percent(wins,exact.length)+')';
        combined.append(exactNote);
        currentCases=exact;
      }
      const samples=document.createElement('div');samples.className='lncm-history-examples';
      const title=document.createElement('b');title.textContent='같은 번호·같은 겹침 형태 최근 사례';samples.append(title);
      if(!currentCases.length){const none=document.createElement('span');none.textContent='과거 동일 겹침 사례 없음';samples.append(none);}
      for(const x of currentCases.slice(-12).reverse()){
        const line=document.createElement('span');line.className=x.hit?'win':'miss';
        line.textContent=x.round+'회 '+p.next+'번 '+(x.hit?'✓ 출현':'× 미출현');samples.append(line);
      }
      combined.append(samples);
      const caution=document.createElement('p');caution.className='lncm-history-note';
      caution.textContent='서로 겹친 연결을 독립 당첨 기회로 합산하지 않습니다. 과거 출현 비율은 미래 당첨 확률을 올린다는 뜻이 아닙니다.';
      combined.append(caution);
    });
    outer.append(combined);
    return outer;
  }

  function makeGroup(target,paths){
    const holder=document.createElement('div');holder.className='lncm-group';
    const tableWrap=document.createElement('div');tableWrap.className='lncm-scroll';
    const table=document.createElement('table');table.className='lncm-group-table';const cols=document.createElement('colgroup');
    [20,36,24,20].forEach(n=>{const col=document.createElement('col');col.style.width=n+'%';cols.append(col);});table.append(cols);
    const tbody=document.createElement('tbody'),tr=document.createElement('tr');
    const round=document.createElement('span'),date=document.createElement('strong'),roundNo=document.createElement('small');
    date.className='lncm-date';date.textContent=drawDate(target);
    roundNo.textContent=target+'회';round.append(date,roundNo);tr.append(cell(round,'검증 회차'));
    const nums=numberList(paths),numSpan=document.createElement('span');numSpan.textContent=labelNums(nums);tr.append(cell(numSpan,'대상 번호'));
    const stats=document.createElement('span');const strong=document.createElement('strong');strong.textContent=paths.length+'건';
    const small=document.createElement('small');small.textContent='5점↑ '+paths.filter(p=>p.count>=5).length+' · 6점↑ '+paths.filter(p=>p.count>=6).length;
    stats.append(strong,small);tr.append(cell(stats,'연결 건수'));
    const toggle=document.createElement('button');toggle.type='button';toggle.textContent=openTarget===target?'접기 ▲':'펼치기 ▼';toggle.setAttribute('aria-expanded',String(openTarget===target));
    toggle.addEventListener('click',()=>{
      const wasOpen=openTarget===target;
      openTarget=wasOpen?0:target;overviewTarget=0;detailLimit=20;selectedPath='';renderGroups();
    });tr.append(cell(toggle,'연결 기록'));
    tbody.append(tr);table.append(tbody);tableWrap.append(table);holder.append(tableWrap);
    const actions=document.createElement('div');actions.className='lncm-round-actions';
    const viewAll=document.createElement('button');viewAll.type='button';viewAll.className='lncm-show-all';
    viewAll.textContent=overviewTarget===target?'✕ '+target+'회 전체 그림 닫기':'📊 '+target+'회 번호·연결 전체 보기';
    viewAll.setAttribute('aria-expanded',String(overviewTarget===target));
    viewAll.addEventListener('click',()=>{
      const wasOpen=overviewTarget===target;
      overviewTarget=wasOpen?0:target;openTarget=0;selectedPath='';
      renderGroups();
      if(!wasOpen){
        const overview=groupArea.querySelector('[data-lncm-overview="'+target+'"]');
        if(overview)overview.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
    actions.append(viewAll);holder.append(actions);
    if(overviewTarget===target)holder.append(makeOverview(target,paths));
    if(openTarget===target)holder.append(makeDetail(target,paths));
    return holder;
  }
  // One overview per scheduled round. Deduplicate target numbers rather than
  // counting overlapping line patterns as independent lottery chances.
  function makeOverview(target,paths){
    const area=document.createElement('section');area.className='lncm-overview';
    area.dataset.lncmOverview=String(target);
    const grouped=new Map();
    for(const p of paths){
      if(!grouped.has(p.next))grouped.set(p.next,[]);
      grouped.get(p.next).push(p);
    }
    for(const p of grouped.values())p.sort((a,b)=>b.count-a.count||a.gap-b.gap||a.shift-b.shift);
    const numbers=[...grouped.keys()].sort((a,b)=>a-b);
    const heading=document.createElement('h6');
    heading.textContent='📊 '+target+'회 · 전체 연결 번호 '+numbers.length+'수';
    area.append(heading);
    const info=document.createElement('p');info.className='lncm-overview-banner';
    info.textContent='대상 번호 '+(numbers.length?numbers.join(' · '):'없음')+
      ' · 연결 '+paths.length+'건 · 각 번호의 가장 긴 연결을 먼저 표시합니다. 나머지 연결도 번호 아래에서 펼쳐볼 수 있습니다.';
    area.append(info);
    const note=document.createElement('p');note.className='lncm-note';
    note.textContent='아래 1~45 숫자판에서 테두리가 있는 숫자는 관찰 대상이고, 흐린 숫자는 연결이 확인되지 않은 번호입니다. 대상이 아니라고 미출현으로 판정하지 않습니다.';
    area.append(note);
    const grid=document.createElement('div');grid.className='lncm-num-grid';
    grid.setAttribute('aria-label',target+'회 전체 1~45번 연결 여부');
    const sectionByNumber=new Map();
    for(const n of numbers){
      const lines=grouped.get(n),section=document.createElement('section');
      section.className='lncm-num-section';section.dataset.lncmNumber=String(n);
      const title=document.createElement('div');title.className='lncm-num-heading';
      title.textContent=n+'번 · '+lines.length+'건 연결 · 최장 '+lines[0].count+'점';
      section.append(title,makePathDiagram(lines[0],'이 번호의 대표 연결'));
      if(lines.length>1){
        const extra=document.createElement('details');extra.className='lncm-other-paths';
        const toggle=document.createElement('summary');
        toggle.textContent='겹친 다른 연결 '+(lines.length-1)+'건 전부 보기';
        extra.append(toggle);
        extra.addEventListener('toggle',()=>{
          if(!extra.open||extra.dataset.loaded)return;
          extra.dataset.loaded='1';
          for(const p of lines.slice(1))extra.append(makePathDiagram(p,'같은 번호의 다른 연결'));
        });
        section.append(extra);
      }
      sectionByNumber.set(n,section);
    }
    for(let n=1;n<=45;n++){
      const lines=grouped.get(n);
      if(!lines){
        const blank=document.createElement('span');blank.textContent=n;blank.title=n+'번: 4점 이상 연결 없음';grid.append(blank);
        continue;
      }
      const outcome=model?.byDraw?.[target];
      const mark=outcome instanceof Set?(outcome.has(n)?'hit':'miss'):'pending';
      const button=document.createElement('button');button.type='button';
      button.className='active'+(mark==='pending'?'':' '+mark);
      button.setAttribute('aria-label',n+'번 연결 '+lines.length+'건의 그림으로 이동');
      const big=document.createElement('strong');big.textContent=n;
      const count=document.createElement('small');count.textContent=lines.length+'건';
      button.append(big,count);
      button.addEventListener('click',()=>sectionByNumber.get(n)?.scrollIntoView({behavior:'smooth',block:'start'}));
      grid.append(button);
    }
    area.append(grid);
    for(const n of numbers)area.append(sectionByNumber.get(n));
    const close=document.createElement('button');close.type='button';
    close.className='lncm-overview-close';close.textContent='✕ '+target+'회 전체 그림 접기';
    close.addEventListener('click',()=>{
      overviewTarget=0;renderGroups();
      const btn=[...groupArea.querySelectorAll('.lncm-show-all')].find(b=>b.textContent.includes(target+'회'));
      if(btn)btn.scrollIntoView({behavior:'smooth',block:'center'});
    });
    area.append(close);
    return area;
  }
  function makeDetail(target,paths){
    const area=document.createElement('div');area.className='lncm-detail';
    const intro=document.createElement('div');intro.className='lncm-detail-title';intro.textContent=target+'회 · '+drawDate(target)+'(토) 예정 · 실제 연결 도전 '+paths.length+'건 (많이 이어진 패턴 먼저)';area.append(intro);
    const wrap=document.createElement('div');wrap.className='lncm-scroll';
    const table=document.createElement('table');table.className='lncm-path-table';
    const cols=document.createElement('colgroup');[28,29,25,18].forEach(n=>{const col=document.createElement('col');col.style.width=n+'%';cols.append(col);});table.append(cols);
    const head=document.createElement('thead');const hr=document.createElement('tr');['검증 번호','성공 출발','간격·연속성','그림'].forEach(t=>{const th=document.createElement('th');th.textContent=t;hr.append(th);});head.append(hr);table.append(head);
    const body=document.createElement('tbody');
    const ranked=[...paths].sort((a,b)=>b.count-a.count||a.next-b.next||a.gap-b.gap||a.shift-b.shift);
    ranked.slice(0,detailLimit).forEach(p=>{
      const row=document.createElement('tr');row.dataset.lncmKey=key(p);row.classList.toggle('lncm-picked',selectedPath===key(p));
      const targetText=document.createElement('strong');targetText.textContent=p.next+'번';row.append(cell(targetText,'검증 번호'));
      const source=document.createElement('span'),from=document.createElement('strong');from.textContent=(p.target-p.gap)+'회';
      const sourceNum=document.createElement('small');sourceNum.textContent=(p.next-p.shift)+'번 성공';source.append(from,sourceNum);row.append(cell(source,'성공 출발'));
      const gap=document.createElement('span'),g=document.createElement('strong');g.textContent='+'+p.gap+'회';
      const detail=document.createElement('small');detail.textContent='번호 '+(p.shift>=0?'+':'')+p.shift+' · '+p.count+'→'+(p.count+1)+'점';gap.append(g,detail);row.append(cell(gap,'간격 · 연속성'));
      const button=document.createElement('button');button.type='button';button.textContent='🖼 그림 보기';button.setAttribute('aria-label',target+'회 '+p.next+'번 연결 그림 한 화면에서 보기');
      button.setAttribute('aria-expanded','false');
      button.addEventListener('click',()=>{
        const opened=area.querySelector('.lncm-path-extra');
        const same=selectedPath===key(p)&&!!opened;
        if(opened)opened.remove();
        panel.querySelectorAll('.lncm-picked').forEach(r=>r.classList.remove('lncm-picked'));
        area.querySelectorAll('[aria-expanded="true"]').forEach(b=>b.setAttribute('aria-expanded','false'));
        selectedPath=same?'':key(p);
        if(same)return;
        row.classList.add('lncm-picked');button.setAttribute('aria-expanded','true');
        const extra=document.createElement('tr');extra.className='lncm-path-extra';
        const td=document.createElement('td');td.colSpan=4;
        const view=makePathDiagram(p);
        const close=document.createElement('button');close.type='button';close.className='lncm-close';close.textContent='✕ 그림 닫기';
        close.addEventListener('click',()=>{extra.remove();row.classList.remove('lncm-picked');button.setAttribute('aria-expanded','false');selectedPath='';});
        td.append(view,close);extra.append(td);row.after(extra);
        extra.scrollIntoView({behavior:'smooth',block:'nearest'});
      });row.append(cell(button,'연결 그림'));body.append(row);
    });
    table.append(body);wrap.append(table);area.append(wrap);
    if(detailLimit<ranked.length){const more=document.createElement('button');more.type='button';more.className='lncm-load';more.textContent='다음 '+Math.min(20,ranked.length-detailLimit)+'건 더 보기 ('+detailLimit+'/'+ranked.length+')';more.addEventListener('click',()=>{detailLimit+=20;renderGroups();});area.append(more);}
    return area;
  }
  function renderGroups(){
    if(!model)return;
    const min=Number(minSelect.value),num=Number(numSelect.value),round=Number($('[data-lncm-round]').value)||0;
    allGroups=[...model.due].map(([target,paths])=>({target,paths:paths.filter(p=>p.count>=min&&(!num||p.next===num))})).filter(g=>g.paths.length&&(!round||round===g.target)).sort((a,b)=>a.target-b.target);
    const total=allGroups.reduce((sum,g)=>sum+g.paths.length,0);
    $('[data-lncm-status]').textContent='1~'+model.last+'회 실제 당첨 기록 기반 · '+(model.last+1)+'회부터 추적';
    const stats=$('[data-lncm-stats]');stats.textContent='';
    ['대기 회차 '+allGroups.length.toLocaleString('ko-KR')+'개','살아남은 연결 '+total.toLocaleString('ko-KR')+'건','가장 가까운 검증 '+(allGroups[0]?.target||'-')+'회'].forEach(t=>{const x=document.createElement('span');x.textContent=t;stats.append(x);});
    groupArea.textContent='';
    if(!allGroups.length){const empty=document.createElement('p');empty.className='lncm-note';empty.textContent=round&&round<=model.last?'입력한 '+round+'회는 이미 추첨된 회차입니다. 아래 지난 복기에서 확인하거나, 검증 회차 검색을 비워 다음 연결을 확인하세요.':'이 조건에서 검증을 기다리는 연결이 없습니다. 회차·번호·연속성 조건을 바꾸어 보세요.';groupArea.append(empty);}
    allGroups.slice(0,visibleGroups).forEach(g=>groupArea.append(makeGroup(g.target,g.paths)));
    groupMore.hidden=allGroups.length<=visibleGroups;
    groupMore.textContent='가까운 검증 회차 '+Math.min(8,allGroups.length-visibleGroups)+'개 더 보기 ('+Math.min(visibleGroups,allGroups.length)+'/'+allGroups.length+')';
  }
  function recapRecord(target,api){
    if(recapCache.has(target))return recapCache.get(target);
    const saved=api.savedArchive()[target],paths=saved?.paths||api.buildPaths(target,model.byDraw);
    const actual=model.byDraw[target]||new Set();
    const nums=numberList(paths),hitNums=nums.filter(n=>actual.has(n)),missNums=nums.filter(n=>!actual.has(n));
    const result={target,saved:!!saved,paths,nums,hitNums,missNums};
    recapCache.set(target,result);return result;
  }
  function renderRecaps(){
    const body=$('[data-lncm-recaps]');body.textContent='';
    const api=window.LNConnectionSchedule;if(!model||!api)return;
    const minTarget=Math.max(5,model.last-recapCount+1);
    for(let target=model.last;target>=minTarget;target--){
      const record=recapRecord(target,api),row=document.createElement('tr');
      const strong=document.createElement('strong');strong.textContent=target+'회';
      row.append(cell(strong,'검증 회차'));
      const status=document.createElement('span');status.className='lncm-recap-outcome';
      status.textContent='✓ 출현 '+record.hitNums.length+'수 · × 미출현 '+record.missNums.length+'수';
      const counts=document.createElement('small');counts.textContent='연결 '+record.paths.length+'건 · 번호 중복 제거';status.append(counts);
      row.append(cell(status,'결과'));
      const list=document.createElement('span');list.textContent=record.hitNums.length?record.hitNums.join(' · ')+'번':'대상 번호 출현 없음';
      const missed=document.createElement('small');missed.textContent=record.missNums.length?'미출현 '+record.missNums.length+'수':'미출현 없음';list.append(missed);
      row.append(cell(list,'출현 번호'));
      const section=document.createElement('div');
      const source=document.createElement('small');source.textContent=record.saved?'추첨 전 이 기기 저장':'과거 시점 자료로 재현';
      section.append(source);
      const details=document.createElement('details');
      const summary=document.createElement('summary');summary.textContent='번호별 출현·미출현 / 그림 보기';details.append(summary);
      details.addEventListener('toggle',()=>{
        if(!details.open||details.dataset.filled)return;
        details.dataset.filled='1';
        if(!record.nums.length){
          const empty=document.createElement('p');empty.className='lncm-feedback';empty.textContent='해당 회차에 4점 이상 연결 대상이 없습니다.';details.append(empty);return;
        }
        const buttons=document.createElement('div');buttons.className='lncm-recap-buttons';
        const preview=document.createElement('div');preview.className='lncm-recap-view';
        for(const n of record.nums){
          const b=document.createElement('button');b.type='button';b.className=record.hitNums.includes(n)?'hit':'miss';
          b.textContent=n+'번 '+(record.hitNums.includes(n)?'✓ 출현':'× 미출현');
          b.addEventListener('click',()=>{
            const p=record.paths.filter(p=>p.next===n).sort((a,b)=>b.count-a.count||a.gap-b.gap)[0];
            preview.textContent='';
            if(p)preview.append(makePathDiagram(p,record.saved?'당시 저장 기록':'과거 자료 재현'));
            preview.scrollIntoView({behavior:'smooth',block:'nearest'});
          });buttons.append(b);
        }
        details.append(buttons,preview);
      });
      section.append(details);row.append(cell(section,'기록·그림'));body.append(row);
    }
    const more=$('[data-lncm-recap-more]');
    more.hidden=model.last-recapCount<5;
    more.textContent='이전 '+Math.min(8,model.last-recapCount-4)+'회 복기 더 보기 ('+Math.min(recapCount,model.last-4)+'회 표시)';
  }
  function refresh(){
    const next=window.LNConnectionSchedule?.getModel();if(!next)return;
    if(!model||next.last!==model.last){model=next;visibleGroups=8;openTarget=0;overviewTarget=0;selectedPath='';recapCount=8;recapCache.clear();}
    renderGroups();renderRecaps();
  }
  minSelect.addEventListener('change',()=>{visibleGroups=8;openTarget=0;overviewTarget=0;selectedPath='';renderGroups();});
  $('[data-lncm-round]').addEventListener('input',()=>{
    visibleGroups=8;openTarget=0;overviewTarget=0;selectedPath='';
    const round=Number($('[data-lncm-round]').value)||0;
    if(model&&round>=5&&round<=model.last&&model.last-round<120){
      recapCount=Math.max(recapCount,model.last-round+1);renderRecaps();
    }
    renderGroups();
  });
  numSelect.addEventListener('change',()=>{visibleGroups=8;openTarget=0;overviewTarget=0;selectedPath='';renderGroups();});
  groupMore.addEventListener('click',()=>{visibleGroups+=8;renderGroups();});
  $('[data-lncm-recap-more]').addEventListener('click',()=>{recapCount+=8;renderRecaps();});
  window.addEventListener('lncs:schedule-ready',refresh);
  refresh();
})();
