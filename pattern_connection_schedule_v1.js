/* LOTTO NOTE: all pending structural connections by their own next due draw. */
(function(){
  'use strict';
  const ID='ln-connection-schedule-v1';
  const STORAGE='ln_connection_pre_draw_archive_v1';
  const family=p=>p.shift===0?'F 정간격':p.gap===1?'R 직전 사선':'D 건너뛰기 사선';
  const uniq=a=>[...new Set(a)].sort((a,b)=>a-b);
  function buildPaths(target,byDraw){
    const found=[];
    for(let gap=1;gap*4<target;gap++){
      const prev=byDraw[target-gap];if(!prev)continue;
      for(const last of prev){
        for(let shift=-14;shift<=14;shift++){
          const next=last+shift;
          if(next<1||next>45)continue;
          let count=1;
          while(target-(count+1)*gap>=1&&byDraw[target-(count+1)*gap]?.has(last-count*shift))count++;
          if(count<4)continue;
          const steps=[];
          for(let k=count;k>=1;k--)steps.push({round:target-k*gap,num:next-k*shift});
          found.push({target,next,gap,shift,count,steps});
        }
      }
    }
    return found.sort((a,b)=>b.count-a.count||a.gap-b.gap||a.next-b.next||a.shift-b.shift);
  }
  function indexDraws(rows){
    const byDraw=[];for(const row of rows)byDraw[Number(row.draw_no)]=new Set(row.numbers.map(Number));
    return byDraw;
  }
  async function makeSchedule(rows,onProgress){
    const byDraw=indexDraws(rows),last=Number(rows[rows.length-1].draw_no);
    // Four previously confirmed points need at least three prior equal intervals.
    const lastPossible=last+Math.floor((last-1)/3),due=new Map();
    for(let target=last+1;target<=lastPossible;target++){
      const paths=buildPaths(target,byDraw);
      if(paths.length)due.set(target,paths);
      if(target%24===0){if(onProgress)onProgress(target,lastPossible);await new Promise(resolve=>setTimeout(resolve,0));}
    }
    return {due,byDraw,last,lastPossible};
  }
  if(typeof window!=='undefined'&&window.LN_CONNECTION_SCHEDULE_TEST){window.LN_CONNECTION_SCHEDULE_TEST_API={buildPaths,indexDraws,makeSchedule};return;}
  const root=document.querySelector('#ln-all-pattern-survival');
  if(!root||document.getElementById(ID))return;
  const pathZone=root.querySelector('[data-lnall-path-zone]');if(!pathZone)return;
  const section=document.createElement('section');section.id=ID;
  section.innerHTML=`
    <style>
      #${ID}{background:#10253b;border:1px solid #d2ad70;border-radius:15px;padding:15px;margin:16px 0;color:#ecf6ff}
      #${ID} h4{font-size:18px;color:#ffe3a7;margin:0 0 8px}
      #${ID} p{font-size:12px;color:#cbdcec;line-height:1.75;margin:7px 0}
      #${ID} .lncs-status{color:#a7f0d1;font-size:12px;font-weight:750}
      #${ID} .lncs-tools{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin:13px 0}
      #${ID} .lncs-tools select{background:#254461;border:1px solid #6b8ea7;border-radius:9px;min-width:130px;flex:2;color:#fff1c8;padding:10px;font-size:15px;font-weight:800}
      #${ID} .lncs-tools button,#${ID} .lncs-float button{background:#265273;color:#fff3d6;border:1px solid #789fba;border-radius:9px;padding:10px;font-weight:800;cursor:pointer}
      #${ID} .lncs-tools input{background:#f0f6ff;color:#112d46;width:112px;border:1px solid #93bddf;border-radius:9px;padding:10px;font-size:14px}
      #${ID} .lncs-stats{display:flex;gap:7px;flex-wrap:wrap;margin:9px 0}
      #${ID} .lncs-stat{background:#1d3953;border:1px solid #496984;border-radius:10px;padding:8px 11px;color:#ffe5b7;font-size:12px;font-weight:750}
      #${ID} .lncs-round-title{font-size:18px;color:#fce1a2;font-weight:900;margin:16px 0 9px}
      #${ID} .lncs-numbers{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:9px}
      #${ID} .lncs-number{background:#1b3650;border:1px solid #4d708e;border-radius:12px;padding:10px 12px}
      #${ID} .lncs-number-head{display:flex;align-items:center;justify-content:space-between;gap:7px}
      #${ID} .lncs-ball{display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;background:#ffdaa0;color:#2f270f;font-size:19px;font-weight:950;flex:none}
      #${ID} .lncs-numlabel{font-size:14px;color:#eaf7ff;font-weight:800;flex:1}
      #${ID} .lncs-number small{color:#c8dcee;font-size:11px}
      #${ID} .lncs-number details{border:0;padding:0;margin:9px 0 0}
      #${ID} .lncs-number summary{font-size:12px;color:#ffdb9b;cursor:pointer}
      #${ID} .lncs-path{margin:9px 0;padding:9px;background:#0d273d;border-left:3px solid #55d1a4;border-radius:7px;color:#e9f5ff;font-size:12px;line-height:1.75;overflow-wrap:anywhere}
      #${ID} .lncs-path b{color:#ffe5a7}
      #${ID} .lncs-link{color:#9fe8c8}
      #${ID} .lncs-next{color:#ffe2a6;font-weight:900}
      #${ID} .lncs-recaps{display:flex;flex-direction:column;gap:7px;margin:10px 0}
      #${ID} .lncs-recap{background:#1b354d;border:1px solid #456984;border-radius:10px;padding:9px 11px;font-size:12px;line-height:1.7;color:#d8eafa}
      #${ID} .lncs-recap b{color:#ffdd9b}
      #${ID} .lncs-recap .lncs-win{color:#97f2c2;font-weight:900}
      #${ID} .lncs-empty{color:#bbcbdd;padding:15px;background:#223a52;border-radius:9px}
      #${ID} .lncs-float{display:none;position:fixed;bottom:calc(14px + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%);z-index:10010;width:calc(100vw - 24px);max-width:520px;gap:7px;align-items:center;background:#0b2136f7;border:2px solid #d4ae6b;border-radius:14px;padding:8px;box-shadow:0 8px 25px #0009}
      #${ID} .lncs-float button{flex:1;min-height:43px;font-size:14px}
      #${ID} .lncs-float span{font-size:12px;font-weight:900;color:#ffe2a1;text-align:center;flex:.65}
      @media(max-width:560px){#${ID}{padding:11px}#${ID} .lncs-numbers{grid-template-columns:1fr}#${ID} .lncs-float.active{display:flex}#${ID}{padding-bottom:76px}}
    </style>
    <h4>📅 살아 있는 패턴 · 다음 연결 예정표</h4>
    <p>같은 간격으로 <b>실제 당첨번호가 4점 이상 연결된 패턴</b>의 마지막 출현 회차에 간격을 더해, 다음 연결 대상인 <b>몇 회차의 몇 번</b>인지를 기록합니다. 1249회만이 아니라 뒤에 예정된 회차도 모두 확인할 수 있습니다.</p>
    <div class="lncs-status" data-lncs-status>기록을 계산할 준비 중…</div>
    <div data-lncs-main hidden>
      <div class="lncs-stats" data-lncs-stats></div>
      <div class="lncs-tools">
        <button type="button" data-lncs-prev>◀</button>
        <select aria-label="출현 연결 예정 회차" data-lncs-round></select>
        <button type="button" data-lncs-next>▶</button>
        <input type="number" min="1" max="45" placeholder="번호 검색" aria-label="해당 번호만 보기" data-lncs-number>
      </div>
      <div data-lncs-round-title class="lncs-round-title"></div>
      <div data-lncs-list class="lncs-numbers"></div>
      <p>여러 연결이 같은 번호를 가리킬 수 있습니다. <b>중복 연결 건수가 많아도 당첨확률이 높아진다고 볼 수는 없습니다.</b> 노란 번호는 확정 당첨이 아니라 해당 회차의 관찰 대상입니다.</p>
      <details><summary>📒 지난 회차 연결 복기 · 성공/중단 보기</summary><p>지난 8회차의 연결 예상번호를 당시 이전 회차 자료만으로 다시 계산해 실제 본당첨과 대조합니다. 현재 기기에 추첨 전에 저장된 기록이 있으면 그 기록을 우선 사용합니다.</p><div class="lncs-recaps" data-lncs-recaps></div></details>
      <p data-lncs-save-note>회차별 예정표는 자동 계산되며, 바로 다음 확정 예정 회차의 목록은 이 기기에 미리 저장해 다음 결과 발표 후에도 확인할 수 있게 합니다.</p>
      <div class="lncs-float" data-lncs-floating><button type="button" data-lncs-float-prev>◀ 이전 회차</button><span data-lncs-float-label>예정 회차</span><button type="button" data-lncs-float-next>다음 회차 ▶</button></div>
    </div>
  `;
  pathZone.before(section);
  const $=s=>section.querySelector(s);
  let busy=false,lastComputed=0,model=null,rounds=[],selected=0;
  const text=(selector,value)=>{const e=$(selector);if(e)e.textContent=String(value);};
  function savedArchive(){try{return JSON.parse(localStorage.getItem(STORAGE)||'{}')||{};}catch(_){return {};}}
  function saveNext(target,paths,asOf){
    try{
      const records=savedArchive();
      if(!records[target]){
        records[target]={asOf,at:new Date().toISOString(),paths:paths.map(({target,next,gap,shift,count})=>({target,next,gap,shift,count}))};
        const keys=Object.keys(records).map(Number).sort((a,b)=>a-b);
        keys.slice(0,Math.max(0,keys.length-50)).forEach(key=>delete records[key]);
        localStorage.setItem(STORAGE,JSON.stringify(records));
      }
      return true;
    }catch(_){return false;}
  }
  function step(direction){if(!rounds.length)return;const i=rounds.indexOf(selected);selected=rounds[(i+direction+rounds.length)%rounds.length];render();}
  function groupByNumber(paths){
    const groups=new Map();
    paths.forEach(path=>{const arr=groups.get(path.next)||[];arr.push(path);groups.set(path.next,arr);});
    return new Map([...groups].sort((a,b)=>a[0]-b[0]));
  }
  function pathLine(path){
    const node=document.createElement('div');node.className='lncs-path';
    const heading=document.createElement('b');
    heading.textContent=(path.count>=5?'🔥 ':'★ ')+family(path)+' · '+path.count+'→'+(path.count+1)+'점 도전 · +'+path.gap+'회 · 번호 이동 '+(path.shift>0?'+':'')+path.shift;
    node.append(heading,document.createElement('div'));
    const flow=document.createElement('div');flow.className='lncs-link';
    const points=path.steps.slice(-4).map(x=>x.round+'회 '+x.num+'번');
    flow.textContent=points.join(' → ')+' → ';
    const pending=document.createElement('span');pending.className='lncs-next';pending.textContent=path.target+'회 '+path.next+'번?';
    flow.append(pending);node.append(flow);return node;
  }
  function render(){
    if(!model||!rounds.length)return;
    const paths=model.due.get(selected)||[],filter=Number($('[data-lncs-number]').value)||0;
    $('[data-lncs-round]').value=String(selected);
    text('[data-lncs-float-label]',selected+'회');
    const groups=groupByNumber(paths),visible=[...groups].filter(([n])=>!filter||n===filter);
    text('[data-lncs-round-title]',selected+'회 · '+groups.size+'개 번호 / '+paths.length+'건 연결 도전'+(filter?' · '+filter+'번만 표시':''));
    const list=$('[data-lncs-list]');list.textContent='';
    if(!visible.length){const p=document.createElement('p');p.className='lncs-empty';p.textContent='이 회차에 해당 번호를 가리키는 연결 없음';list.append(p);return;}
    const fragment=document.createDocumentFragment();
    visible.forEach(([n,items])=>{
      const card=document.createElement('article');card.className='lncs-number';
      const head=document.createElement('div');head.className='lncs-number-head';
      const ball=document.createElement('span');ball.className='lncs-ball';ball.textContent=n;
      const label=document.createElement('span');label.className='lncs-numlabel';label.textContent=selected+'회 · '+n+'번';
      const count=document.createElement('small');count.textContent='연결 '+items.length+'건';
      head.append(ball,label,count);card.append(head);
      const details=document.createElement('details');
      const title=document.createElement('summary');title.textContent='연결 근거 보기 · '+items.map(p=>p.count+'점').join(' / ');details.append(title);
      items.forEach(path=>details.append(pathLine(path)));
      card.append(details);fragment.append(card);
    });list.append(fragment);
  }
  function renderRecaps(){
    const box=$('[data-lncs-recaps]');box.textContent='';
    const archive=savedArchive();
    for(let target=model.last;target>=Math.max(5,model.last-7);target--){
      const saved=archive[target],paths=saved?.paths||buildPaths(target,model.byDraw),actual=model.byDraw[target]||new Set();
      const hits=paths.filter(x=>actual.has(x.next));
      const numbers=uniq(hits.map(x=>x.next));
      const card=document.createElement('div');card.className='lncs-recap';
      const title=document.createElement('b');title.textContent=target+'회 ';card.append(title);
      card.append(document.createTextNode(paths.length+'건 연결 중 '+hits.length+'건 성공 · '));
      const outcome=document.createElement('span');outcome.className='lncs-win';outcome.textContent=numbers.length?'실제 당첨 '+numbers.join(', ')+'번':'대상 번호 적중 없음';
      card.append(outcome);
      const memo=document.createElement('div');memo.style.color='#b8cde2';memo.textContent=saved?'✓ 추첨 전 이 기기에 저장한 기록':'과거 이전 회차 자료로 재현';card.append(memo);
      box.append(card);
    }
  }
  $('[data-lncs-prev]').addEventListener('click',()=>step(-1));
  $('[data-lncs-next]').addEventListener('click',()=>step(1));
  $('[data-lncs-float-prev]').addEventListener('click',()=>step(-1));
  $('[data-lncs-float-next]').addEventListener('click',()=>step(1));
  $('[data-lncs-round]').addEventListener('change',e=>{selected=Number(e.target.value);render();});
  $('[data-lncs-number]').addEventListener('input',render);
  if(typeof IntersectionObserver==='function')new IntersectionObserver(entries=>{
    const active=entries[0].isIntersecting&&document.getElementById('watch')?.classList.contains('active');
    $('[data-lncs-floating]').classList.toggle('active',active);
  },{threshold:0}).observe(section);
  async function refresh(){
    if(busy||typeof state==='undefined'||!Array.isArray(state.draws)||state.draws.length<100)return;
    const last=state.draws.at(-1)?.draw_no;if(last===lastComputed)return;
    busy=true;lastComputed=last;
    try{
      text('[data-lncs-status]','1~'+last+'회 실제 당첨번호로 전체 연결 일정 계산 중…');
      model=await makeSchedule(state.draws,(target,max)=>{if(target%48===0)text('[data-lncs-status]',target+'/'+max+'회 예정 연결 계산 중…');});
      rounds=[...model.due.keys()].sort((a,b)=>a-b);
      if(!rounds.length){text('[data-lncs-status]','지금 살아 있는 4점 이상 연결 없음');return;}
      selected=rounds.includes(selected)?selected:rounds[0];
      const total=[...model.due.values()].reduce((n,arr)=>n+arr.length,0);
      const stats=$('[data-lncs-stats]');stats.textContent='';
      ['기록 기준 '+last+'회','예정 회차 '+rounds.length+'개','연결 도전 '+total.toLocaleString('ko-KR')+'건'].forEach(v=>{
        const badge=document.createElement('span');badge.className='lncs-stat';badge.textContent=v;stats.append(badge);
      });
      const select=$('[data-lncs-round]');select.textContent='';
      rounds.forEach(r=>{const opt=document.createElement('option');opt.value=r;opt.textContent=r+'회 · '+model.due.get(r).length+'건 연결';select.append(opt);});
      const saved=saveNext(last+1,model.due.get(last+1)||[],last);
      text('[data-lncs-save-note]',saved?(last+1)+'회 연결 대상 번호는 추첨 전에 이 기기에 자동 저장했습니다. 이후 확정 결과를 받아 적중·중단으로 복기합니다.':'예정표는 자동 계산되지만 이 기기의 사전 기록 저장은 사용할 수 없습니다.');
      renderRecaps();render();$('[data-lncs-main]').hidden=false;
      text('[data-lncs-status]','1~'+last+'회 데이터로 전체 예정 회차 계산 완료 · 당첨 보장 아님');
    }catch(error){lastComputed=0;text('[data-lncs-status]','예정표 계산 중 오류: '+error.message);}
    finally{busy=false;}
  }
  const status=root.querySelector('[data-lnall-status]');
  if(status)new MutationObserver(()=>{if(status.textContent.includes('전체 비교 완료'))refresh();}).observe(status,{childList:true});
  if(status?.textContent.includes('전체 비교 완료'))refresh();
})();
