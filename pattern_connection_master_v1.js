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
    #ln-connection-schedule-v1 .lncm-detail{background:#0e324b;border:1px solid #638b98;padding:9px;border-radius:10px;margin:5px 0 12px}
    #ln-connection-schedule-v1 .lncm-detail-title{color:#d7f7e8;font-weight:850;margin:2px 0 7px;font-size:13px}
    #ln-connection-schedule-v1 .lncm-path-table tr.lncm-picked td{background:#365b6b;border-color:#f4bf63}
    #ln-connection-schedule-v1 .lncm-path-table tr.lncm-flash td{background:#725128!important;border-color:#ffe3a0}
    #ln-connection-schedule-v1 .lncm-path-table tr{scroll-margin-top:90px;scroll-margin-bottom:95px}
    #ln-connection-schedule-v1 .lncm-load{width:100%;margin:7px 0;background:#315d75!important;border-color:#8eaebd!important}
    #ln-connection-schedule-v1 .lncm-recap{font-size:12px;line-height:1.5}
    #ln-connection-schedule-v1 .lncm-recap strong{font-size:12px}
    @media(max-width:550px){#ln-connection-schedule-v1 .lncm-master{padding:9px}#ln-connection-schedule-v1 .lncm-master table{font-size:11px}#ln-connection-schedule-v1 .lncm-master td{padding:8px 3px}#ln-connection-schedule-v1 .lncm-master button{font-size:11px;padding:7px 3px}#ln-connection-schedule-v1 .lncm-target{font-size:13px}}
  `;
  root.append(style);
  const panel=document.createElement('section');panel.className='lncm-master';panel.dataset.lncmMaster='1';
  panel.innerHTML=`
    <h5>🧭 전체 생존 패턴 · 회차별 검증표</h5>
    <p class="lncm-note">가장 최근 회차뿐 아니라 과거 모든 회차의 <b>실제 4점 이상 연결</b>을 모읍니다. 아직 결과가 나오지 않은 다음 연결 회차부터 정렬합니다.</p>
    <div class="lncm-status" data-lncm-status>전체 연결 일정 불러오는 중…</div>
    <div class="lncm-stats" data-lncm-stats></div>
    <div class="lncm-filters">
      <label>연속성 <select data-lncm-min aria-label="전체 연결 최소 점 수"><option value="4">4점 이상</option><option value="5">5점 이상</option><option value="6">6점 이상</option></select></label>
      <label>대상 번호 <select data-lncm-num aria-label="검증 대상 번호"><option value="0">전체 45수</option></select></label>
    </div>
    <div data-lncm-groups></div><button type="button" class="lncm-load" data-lncm-more hidden>다음 검증 회차 더 보기</button>
    <h6>📒 최근 8회 연결 결과 자동 복기</h6>
    <div class="lncm-scroll"><table class="lncm-recap"><thead><tr><th style="width:19%">회차</th><th style="width:23%">연결 성공</th><th style="width:25%">대상 번호 적중</th><th style="width:33%">기록 종류</th></tr></thead><tbody data-lncm-recaps></tbody></table></div>
    <p class="lncm-note">본당첨 6개 기준입니다. 한 번호에 여러 패턴이 겹쳐도 독립된 기회로 볼 수 없습니다. 사전 저장이 없는 과거 회차는 <b>추첨 전 데이터만으로 재현</b>하며, 실시간 예측 성적으로 계산하지 않습니다. 어느 패턴도 미래 당첨을 보장하지 않습니다.</p>
  `;
  main.insertBefore(panel,main.querySelector('.lncs-source-box'));
  const $=sel=>panel.querySelector(sel);
  const groupArea=$('[data-lncm-groups]'),groupMore=$('[data-lncm-more]');
  const minSelect=$('[data-lncm-min]'),numSelect=$('[data-lncm-num]');
  for(let n=1;n<=45;n++){const option=document.createElement('option');option.value=n;option.textContent=n+'번';numSelect.append(option);}
  let model=null,allGroups=[],visibleGroups=8,openTarget=0,detailLimit=20,selectedPath='';
  const numberList=paths=>[...new Set(paths.map(p=>p.next))].sort((a,b)=>a-b);
  const labelNums=nums=>nums.slice(0,6).join(' · ')+(nums.length>6?' 외 '+(nums.length-6)+'수':'');
  const cell=(value)=>{const td=document.createElement('td');if(typeof value==='string')td.textContent=value;else td.append(value);return td;};
  const key=p=>[p.target,p.next,p.gap,p.shift].join('|');
  function makeGroup(target,paths){
    const holder=document.createElement('div');holder.className='lncm-group';
    const tableWrap=document.createElement('div');tableWrap.className='lncm-scroll';
    const table=document.createElement('table');const cols=document.createElement('colgroup');
    [20,36,24,20].forEach(n=>{const col=document.createElement('col');col.style.width=n+'%';cols.append(col);});table.append(cols);
    const tbody=document.createElement('tbody'),tr=document.createElement('tr');
    const round=document.createElement('strong');round.className='lncm-target';round.textContent=target+'회';tr.append(cell(round));
    const nums=numberList(paths),numSpan=document.createElement('span');numSpan.textContent=labelNums(nums);tr.append(cell(numSpan));
    const stats=document.createElement('span');const strong=document.createElement('strong');strong.textContent=paths.length+'건';
    const small=document.createElement('small');small.textContent='5점↑ '+paths.filter(p=>p.count>=5).length+' · 6점↑ '+paths.filter(p=>p.count>=6).length;
    stats.append(strong,small);tr.append(cell(stats));
    const toggle=document.createElement('button');toggle.type='button';toggle.textContent=openTarget===target?'접기 ▲':'펼치기 ▼';toggle.setAttribute('aria-expanded',String(openTarget===target));
    toggle.addEventListener('click',()=>{openTarget=openTarget===target?0:target;detailLimit=20;renderGroups();});tr.append(cell(toggle));
    tbody.append(tr);table.append(tbody);tableWrap.append(table);holder.append(tableWrap);
    if(openTarget===target)holder.append(makeDetail(target,paths));
    return holder;
  }
  function makeDetail(target,paths){
    const area=document.createElement('div');area.className='lncm-detail';
    const intro=document.createElement('div');intro.className='lncm-detail-title';intro.textContent=target+'회 실제 연결 도전 · '+paths.length+'건 (많이 이어진 패턴 먼저)';area.append(intro);
    const wrap=document.createElement('div');wrap.className='lncm-scroll';
    const table=document.createElement('table');table.className='lncm-path-table';
    const cols=document.createElement('colgroup');[28,29,25,18].forEach(n=>{const col=document.createElement('col');col.style.width=n+'%';cols.append(col);});table.append(cols);
    const head=document.createElement('thead');const hr=document.createElement('tr');['검증 번호','성공 출발','간격·연속성','그림'].forEach(t=>{const th=document.createElement('th');th.textContent=t;hr.append(th);});head.append(hr);table.append(head);
    const body=document.createElement('tbody');
    const ranked=[...paths].sort((a,b)=>b.count-a.count||a.next-b.next||a.gap-b.gap||a.shift-b.shift);
    ranked.slice(0,detailLimit).forEach(p=>{
      const row=document.createElement('tr');row.dataset.lncmKey=key(p);row.classList.toggle('lncm-picked',selectedPath===key(p));
      const targetText=document.createElement('strong');targetText.textContent=p.next+'번';row.append(cell(targetText));
      const source=document.createElement('span'),from=document.createElement('strong');from.textContent=(p.target-p.gap)+'회';
      const sourceNum=document.createElement('small');sourceNum.textContent=(p.next-p.shift)+'번 성공';source.append(from,sourceNum);row.append(cell(source));
      const gap=document.createElement('span'),g=document.createElement('strong');g.textContent='+'+p.gap+'회';
      const detail=document.createElement('small');detail.textContent='번호 '+(p.shift>=0?'+':'')+p.shift+' · '+p.count+'→'+(p.count+1)+'점';gap.append(g,detail);row.append(cell(gap));
      const button=document.createElement('button');button.type='button';button.textContent='그림 ↘';button.setAttribute('aria-label',target+'회 '+p.next+'번 연결 그림 보기');
      button.addEventListener('click',()=>{
        selectedPath=key(p);panel.querySelectorAll('.lncm-picked').forEach(r=>r.classList.remove('lncm-picked'));row.classList.add('lncm-picked');
        const navigate=window.LNConnectionTableNavigate?.jump;
        if(typeof navigate==='function')navigate({sourceRound:target-p.gap,sourceNum:p.next-p.shift,target:p.target,next:p.next,gap:p.gap,shift:p.shift,count:p.count},row);
        else $('[data-lncm-status]').textContent='그림 연결 기능을 불러오지 못했습니다. 페이지를 다시 열어 주세요.';
      });row.append(cell(button));body.append(row);
    });
    table.append(body);wrap.append(table);area.append(wrap);
    if(detailLimit<ranked.length){const more=document.createElement('button');more.type='button';more.className='lncm-load';more.textContent='다음 '+Math.min(20,ranked.length-detailLimit)+'건 더 보기 ('+detailLimit+'/'+ranked.length+')';more.addEventListener('click',()=>{detailLimit+=20;renderGroups();});area.append(more);}
    return area;
  }
  function renderGroups(){
    if(!model)return;
    const min=Number(minSelect.value),num=Number(numSelect.value);
    allGroups=[...model.due].map(([target,paths])=>({target,paths:paths.filter(p=>p.count>=min&&(!num||p.next===num))})).filter(g=>g.paths.length).sort((a,b)=>a.target-b.target);
    const total=allGroups.reduce((sum,g)=>sum+g.paths.length,0);
    $('[data-lncm-status]').textContent='1~'+model.last+'회 실제 당첨 기록 기반 · '+(model.last+1)+'회부터 추적';
    const stats=$('[data-lncm-stats]');stats.textContent='';
    ['대기 회차 '+allGroups.length.toLocaleString('ko-KR')+'개','살아남은 연결 '+total.toLocaleString('ko-KR')+'건','가장 가까운 검증 '+(allGroups[0]?.target||'-')+'회'].forEach(t=>{const x=document.createElement('span');x.textContent=t;stats.append(x);});
    groupArea.textContent='';
    if(!allGroups.length){const empty=document.createElement('p');empty.className='lncm-note';empty.textContent='이 조건에서 아직 검증을 기다리는 연결이 없습니다.';groupArea.append(empty);}
    allGroups.slice(0,visibleGroups).forEach(g=>groupArea.append(makeGroup(g.target,g.paths)));
    groupMore.hidden=allGroups.length<=visibleGroups;
    groupMore.textContent='가까운 검증 회차 '+Math.min(8,allGroups.length-visibleGroups)+'개 더 보기 ('+Math.min(visibleGroups,allGroups.length)+'/'+allGroups.length+')';
  }
  function renderRecaps(){
    const body=$('[data-lncm-recaps]');body.textContent='';
    const api=window.LNConnectionSchedule;if(!model||!api)return;
    const saved=api.savedArchive();
    for(let target=model.last;target>=Math.max(5,model.last-7);target--){
      const record=saved[target];const paths=record?.paths||api.buildPaths(target,model.byDraw);
      const actual=model.byDraw[target]||new Set();const hits=paths.filter(p=>actual.has(p.next));
      const nums=numberList(paths),hitNums=numberList(hits),row=document.createElement('tr');
      const round=document.createElement('strong');round.textContent=target+'회';row.append(cell(round));
      row.append(cell(hits.length+' / '+paths.length+'건'));
      row.append(cell(hitNums.length+' / '+nums.length+'수'));
      const source=document.createElement('span');source.textContent=record?'✓ 추첨 전 저장':'↻ 과거 재현';row.append(cell(source));body.append(row);
    }
  }
  function refresh(){
    const next=window.LNConnectionSchedule?.getModel();if(!next)return;
    if(!model||next.last!==model.last){model=next;visibleGroups=8;openTarget=0;selectedPath='';}
    renderGroups();renderRecaps();
  }
  minSelect.addEventListener('change',()=>{visibleGroups=8;openTarget=0;selectedPath='';renderGroups();});
  numSelect.addEventListener('change',()=>{visibleGroups=8;openTarget=0;selectedPath='';renderGroups();});
  groupMore.addEventListener('click',()=>{visibleGroups+=8;renderGroups();});
  window.addEventListener('lncs:schedule-ready',refresh);
  refresh();
})();
