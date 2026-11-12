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
    <p class="lncm-note">회차를 펼치고 <b>🖼 그림 보기</b>를 누르면 이동하지 않고 이 표 안에 5단계 연결이 나타납니다. 휴대폰에서 옆으로 밀 필요가 없습니다.</p>
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
  let model=null,allGroups=[],visibleGroups=8,openTarget=0,detailLimit=20,selectedPath='',recapCount=8;
  const recapCache=new Map();
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
    return drawing;
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
    toggle.addEventListener('click',()=>{openTarget=openTarget===target?0:target;detailLimit=20;selectedPath='';renderGroups();});tr.append(cell(toggle,'연결 기록'));
    tbody.append(tr);table.append(tbody);tableWrap.append(table);holder.append(tableWrap);
    if(openTarget===target)holder.append(makeDetail(target,paths));
    return holder;
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
    if(!allGroups.length){const empty=document.createElement('p');empty.className='lncm-note';empty.textContent=round&&round<=model.last?'입력한 '+round+'회는 이미 추첨된 회차입니다. 아래 지난 복기 기록을 확인해 주세요.':'이 조건에서 검증을 기다리는 연결이 없습니다. 회차·번호·연속성 조건을 바꾸어 보세요.';groupArea.append(empty);}
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
    if(!model||next.last!==model.last){model=next;visibleGroups=8;openTarget=0;selectedPath='';recapCount=8;recapCache.clear();}
    renderGroups();renderRecaps();
  }
  minSelect.addEventListener('change',()=>{visibleGroups=8;openTarget=0;selectedPath='';renderGroups();});
  $('[data-lncm-round]').addEventListener('input',()=>{visibleGroups=8;openTarget=0;selectedPath='';renderGroups();});
  numSelect.addEventListener('change',()=>{visibleGroups=8;openTarget=0;selectedPath='';renderGroups();});
  groupMore.addEventListener('click',()=>{visibleGroups+=8;renderGroups();});
  $('[data-lncm-recap-more]').addEventListener('click',()=>{recapCount+=8;renderRecaps();});
  window.addEventListener('lncs:schedule-ready',refresh);
  refresh();
})();
