/* LOTTO NOTE · published prospective connection archive, no browser-only grades. */
(function(){
  'use strict';
  const root=document.querySelector('#ln-connection-schedule-v1 [data-lncs-main]');
  if(!root||root.querySelector('[data-lncl-panel]'))return;
  const panel=document.createElement('section');
  panel.className='lncl';panel.setAttribute('data-lncl-panel','');
  panel.innerHTML=`
  <style>
    .lncl{border:2px solid #d7ac64;background:#0d2b40;color:#eaf7ff;border-radius:14px;padding:13px;margin:14px 0}
    .lncl h4{margin:0 0 6px;color:#ffdf9d;font-size:18px}
    .lncl p{font-size:12px;line-height:1.7;color:#c8e0ef;margin:6px 0}
    .lncl-summary{padding:10px;border-radius:9px;background:#20465c;color:#fff0cf;font-size:13px;font-weight:800;margin:8px 0}
    .lncl-tools{display:flex;gap:7px;flex-wrap:wrap;margin:11px 0}
    .lncl-tools label{display:flex;flex-direction:column;gap:4px;flex:1;min-width:100px;font-size:11px;color:#cbe3f2}
    .lncl-tools select,.lncl-tools input{padding:8px;color:#173149;background:#f1faff;border:1px solid #a4cbe1;border-radius:8px;font-size:13px;min-height:39px;width:100%;box-sizing:border-box}
    .lncl-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
    .lncl-table{width:100%;border-spacing:0 6px;min-width:490px;font-size:12px}
    .lncl-table th{background:#31546b;text-align:left;padding:9px 7px;color:#e7f7ff}
    .lncl-table td{background:#193c52;padding:9px 7px;vertical-align:middle}
    .lncl-table td:first-child{border-radius:7px 0 0 7px}
    .lncl-table td:last-child{border-radius:0 7px 7px 0}
    .lncl-table strong{color:#ffe1a5;font-size:14px}
    .lncl-table small{display:block;color:#bfd8e8;font-size:10px;margin-top:3px}
    .lncl-table button,.lncl-more,.lncl-back{padding:7px 9px;border:1px solid #c7a36c;color:#fff1cf;background:#2d6279;border-radius:7px;cursor:pointer;font-size:12px;font-weight:800}
    .lncl-win{color:#aaf5c9;font-weight:900}.lncl-fail{color:#ffa8ae;font-weight:900}.lncl-due{color:#ffe0aa;font-weight:900}
    .lncl-grade{margin:11px 0;padding:9px;border-left:3px solid #9ad8bf;background:#183d50}
    .lncl-grade b{color:#ffe1a6}
    .lncl-example{margin-top:10px}
    .lncl-example .lnpg-card{margin:8px 0}
    @media(max-width:560px){.lncl{padding:9px}.lncl-tools{gap:6px}.lncl-tools label{min-width:88px}.lncl-table{min-width:465px}}
  </style>
  <h4>🔐 연결번호 사전 저장원장 · 자동 복기</h4>
  <p>발표 전에 확인한 4점 이상 연결만 서버에 처음 발견한 시각대로 고정합니다. 예정표는 가까운 회차부터 표시하며, 발표 뒤 공식 복기 자료가 저장되어야 성공·실패로 판정합니다.</p>
  <div class="lncl-summary" data-lncl-status>서버 원장 확인 전…</div>
  <div class="lncl-grade" data-lncl-grade>검증 완료한 실전 회차가 쌓이면 비교 성적을 표시합니다.</div>
  <div class="lncl-tools">
    <label>검증 상태<select data-lncl-filter><option value="all">전체</option><option value="pending">⏳ 예정</option><option value="win">✓ 성공</option><option value="fail">× 실패</option></select></label>
    <label>검증 회차<input data-lncl-round type="number" placeholder="전체" min="1"></label>
    <label>대상 번호<input data-lncl-num type="number" placeholder="1~45" min="1" max="45"></label>
    <label>자리 흐름<input data-lncl-flow placeholder="6-4-3-1"></label>
  </div>
  <div class="lncl-scroll"><table class="lncl-table"><thead><tr><th>검증 회차</th><th>대상 번호</th><th>이동 흐름</th><th>사전 저장</th><th>결과·그림</th></tr></thead><tbody data-lncl-rows><tr><td colspan="5">저장 원장 확인 중…</td></tr></tbody></table></div>
  <button type="button" data-lncl-more class="lncl-more" hidden>다음 20건 더 보기</button>
  <div class="lncl-example" data-lncl-example></div>
  <p>동일한 회차·번호에 다른 연결 간격이 겹칠 수 있습니다. 전체 적중률은 동일 회차·번호의 중복을 제거합니다. 무작위 한 번호의 본당첨 포함 기준은 6/45=13.33%이며, 패턴 적중이 확률 우위를 보장하지 않습니다.</p>`;
  root.append(panel);
  const $=s=>panel.querySelector(s);
  let forecast=[],reviews=new Map(),visible=20,loaded=false,busy=false;
  const escape=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const kst=s=>{const d=new Date(s);return Number.isFinite(d.getTime())?
    new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(d):'-';};
  const targetDate=r=>kst(new Date(Date.UTC(2002,11,7,11,30)+(r-1)*7*86400000).toISOString());
  const key=r=>[r.target,r.next].join('-');
  const status=r=>{const a=reviews.get(r.target);return !a?'pending':a.includes(r.next)?'win':'fail';};
  const viewStatus=s=>s==='win'?'<span class="lncl-win">✓ 성공</span>':
    s==='fail'?'<span class="lncl-fail">× 실패</span>':'<span class="lncl-due">⏳ 대기</span>';
  function showRow(r){
    const area=$('[data-lncl-example]');area.textContent='';
    const back=document.createElement('button');back.type='button';back.className='lncl-back';
    back.textContent='↩ 연결 기록표로 돌아가기';
    back.addEventListener('click',()=>$('[data-lncl-rows]').scrollIntoView({behavior:'smooth',block:'start'}));
    const p=document.createElement('p');p.textContent=`${r.target}회 ${r.next}번 · ${r.flow.replaceAll('-', '→')} · ${kst(r.createdAt)} 최초 저장 · ${status(r)==='pending'?'결과 대기':status(r)==='win'?'실제 적중':'미출현'}`;
    area.append(back,p);
    const create=window.LNPositionGrid?.create;
    if(typeof create==='function'&&typeof state!=='undefined'){
      const steps=r.steps.map(s=>({round:s.round,num:s.n}));
      area.append(create({target:r.target,next:r.next,gap:r.gap,shift:r.shift,count:r.count,steps},state.draws));
    }
    area.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function gradeStats(){
    const once=new Map();
    for(const p of forecast)if(reviews.has(p.target))once.set(key(p),p);
    const scored=[...once.values()].sort((a,b)=>a.target-b.target);
    const summary=(rows,label)=>{
      const win=rows.filter(p=>status(p)==='win').length;
      const expected=rows.length*6/45;
      return `${label}: <b>${win}/${rows.length}</b> (${rows.length?(100*win/rows.length).toFixed(1):'—'}%) · 무작위 기대 ${expected.toFixed(1)}건`;
    };
    const roundGroups=[...new Set(scored.map(r=>r.target))].sort((a,b)=>a-b);
    const cutoffCount=n=>scored.filter(r=>roundGroups.indexOf(r.target)>=Math.max(0,roundGroups.length-n));
    $('[data-lncl-grade]').innerHTML=summary(scored,'실전 누적')+'<br>'+summary(cutoffCount(20),'최근 20개 검증 회차')+
      '<br>'+summary(cutoffCount(50),'최근 50개 검증 회차')+'<br>'+summary(cutoffCount(100),'최근 100개 검증 회차');
  }
  function render(){
    if(!loaded)return;
    const round=Number($('[data-lncl-round]').value)||0,num=Number($('[data-lncl-num]').value)||0;
    const flow=$('[data-lncl-flow]').value.trim().replace(/[구\s→]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
    const filter=$('[data-lncl-filter]').value;
    const next=typeof state!=='undefined'&&state.draws?.length?state.draws.at(-1).draw_no+1:0;
    const sorted=forecast.filter(r=>
      (!round||r.target===round)&&(!num||r.next===num)&&(!flow||r.flow.includes(flow))&&
      (filter==='all'||status(r)===filter));
    sorted.sort((a,b)=>{
      const x=reviews.has(a.target)?1:0,y=reviews.has(b.target)?1:0;
      return x-y||(x?a.target-b.target:a.target-b.target)||a.next-b.next;
    });
    const rows=sorted.slice(0,visible);
    const body=$('[data-lncl-rows]');body.innerHTML=rows.length?rows.map((r,i)=>
      `<tr><td><strong>${r.target}회</strong><small>${targetDate(r.target)}</small></td>`+
      `<td><strong>${r.next}번</strong><small>${r.count}점 연결</small></td>`+
      `<td><strong>${escape(r.flow.replaceAll('-', '→'))}</strong><small>간격 +${r.gap}회 · 이동 ${r.shift>0?'+':''}${r.shift}</small></td>`+
      `<td>${kst(r.createdAt)}<small>${r.sourceRound}회 기준</small></td>`+
      `<td>${viewStatus(status(r))}<small><button type="button" data-lncl-show="${i}">자리 그림</button></small></td></tr>`).join(''):
      '<tr><td colspan="5">해당 조건의 사전 저장 기록이 없습니다.</td></tr>';
    for(const b of body.querySelectorAll('[data-lncl-show]'))b.addEventListener('click',()=>showRow(rows[+b.dataset.lnclShow]));
    const more=$('[data-lncl-more]');more.hidden=sorted.length<=visible;
    const pending=forecast.filter(r=>!reviews.has(r.target)).length;
    const done=forecast.length-pending;
    $('[data-lncl-status]').textContent=`추첨 전에 최초 저장한 연결 ${forecast.length}건 · 결과 대기 ${pending}건 · 결과 확정 ${done}건 · 현재 검색 ${sorted.length}건${next?' · 다음 '+next+'회':''}`;
    gradeStats();
  }
  async function load(){
    if(busy)return;busy=true;
    try{
      const [f,v]=await Promise.all([
        fetch('./data/connection_forecasts.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('예정원장 '+r.status);return r.json();}),
        fetch('./data/connection_reviews.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('복기원장 '+r.status);return r.json();})
      ]);
      if(f.version!==1||f.policy!=='four-point-first-seen-24-rounds-v1'||
        v.version!==1||v.policy!=='verified-weekly-result-v1'||
        !Array.isArray(f.records)||!Array.isArray(v.records))throw Error('원장 버전 불일치');
      forecast=f.records.filter(r=>r&&Number.isInteger(r.target)&&Number.isInteger(r.next)&&
        r.next>=1&&r.next<=45&&Array.isArray(r.steps)&&r.steps.length===4&&
        /^([1-6]-){3}[1-6]$/.test(r.flow));
      reviews=new Map(v.records.filter(r=>Array.isArray(r.actual)&&r.actual.length===6)
        .map(r=>[r.round,r.actual]));
      loaded=true;render();
      if(!forecast.length)$('[data-lncl-status]').textContent='자동 저장원장 준비 완료 · 다음 금·토 추첨 전 예약 실행에서 최초 연결 기록을 생성합니다.';
    }catch(e){$('[data-lncl-status]').textContent='원장을 확인하지 못했습니다: '+e.message;}
    finally{busy=false;}
  }
  for(const control of panel.querySelectorAll('input,select'))control.addEventListener('input',()=>{visible=20;render();});
  $('[data-lncl-more]').addEventListener('click',()=>{visible+=20;render();});
  window.addEventListener('lncs:schedule-ready',load);
  if(!root.hidden)load();
})();
