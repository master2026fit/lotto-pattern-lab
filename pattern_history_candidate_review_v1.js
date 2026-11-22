/* Lotto Note: historic candidate inspection for clickable OX cells; no overwrite of earlier candidate sets. */
(function installHistoricalSlotInspector(){
  'use strict';
  const root=document.querySelector('#ln-connection-schedule-v1 [data-lnnxt]');
  if(!root||root.querySelector('[data-lnhi]'))return;
  const style=document.createElement('style');
  style.textContent=`
   #ln-connection-schedule-v1 .lnnxt .lnnxt-mini span[data-lnhi-slot]{cursor:pointer;touch-action:manipulation;outline-offset:1px;min-height:34px;border:1px solid #9bbaca}
   #ln-connection-schedule-v1 .lnnxt .lnnxt-mini span[data-lnhi-slot]:focus-visible{outline:3px solid #dcac51}
   #ln-connection-schedule-v1 .lnhi{border:1px solid #a8c9da;background:#f0f9ff;border-radius:10px;padding:10px;margin:12px 0;color:#21445f}
   #ln-connection-schedule-v1 .lnhi h6{color:#204e6d;font-size:15px;margin:0 0 6px;font-weight:900}
   #ln-connection-schedule-v1 .lnhi p{font-size:11px;color:#42647a;line-height:1.6;margin:5px 0}
   #ln-connection-schedule-v1 .lnhi .lnhi-tools{display:flex;flex-wrap:wrap;gap:7px;align-items:end;margin:8px 0}
   #ln-connection-schedule-v1 .lnhi label{flex:1 1 140px;color:#2c526d;font-weight:800;display:flex;flex-direction:column;gap:5px;font-size:12px}
   #ln-connection-schedule-v1 .lnhi input{background:#fff;border:1px solid #9ebbd0;border-radius:8px;padding:8px;min-height:41px;color:#193d59;box-sizing:border-box}
   #ln-connection-schedule-v1 .lnhi button{background:#e5f2fb;border:1px solid #a5bfd2;color:#26516d;font-size:12px;font-weight:900;min-height:39px;padding:7px 10px;border-radius:8px;cursor:pointer;touch-action:manipulation}
   #ln-connection-schedule-v1 .lnhi .lnhi-six{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:4px;margin:7px 0}
   #ln-connection-schedule-v1 .lnhi .lnhi-six button{min-width:0;min-height:40px;padding:4px 0;background:#fff5d7;border:1px solid #d5b87c;color:#654a21;display:flex;flex-direction:column;gap:2px;align-items:center;justify-content:center;font-size:15px}
   #ln-connection-schedule-v1 .lnhi .lnhi-six small{color:inherit;font-size:9px}
   #ln-connection-schedule-v1 .lnhi .lnhi-detail{padding:9px;border:2px solid #d5a95b;background:#fff9e8;border-radius:9px;color:#514629;margin:6px 0;scroll-margin-top:15px}
   #ln-connection-schedule-v1 .lnhi .lnhi-detail b{font-size:13px;color:#674a1b}
   #ln-connection-schedule-v1 .lnhi .lnhi-detail p{color:#645135;font-size:12px;line-height:1.6}
   #ln-connection-schedule-v1 .lnhi .lnhi-ball{display:inline-flex;min-width:35px;min-height:35px;align-items:center;justify-content:center;background:#e6eef5;border:1px solid #a9becf;border-radius:8px;color:#244664;font-size:12px;font-weight:900;margin:3px 3px 3px 0}
   #ln-connection-schedule-v1 .lnhi .lnhi-ball.hit{background:#c6f1d8;border-color:#77c199;color:#155d3d}
   #ln-connection-schedule-v1 .lnhi .lnhi-ball.miss{background:#ffe1e6;border-color:#e6a1a8;color:#a03d46}
   #ln-connection-schedule-v1 .lnnxt .lnhi-slot-detail{border:2px solid #d9ab58;background:#fff8e4;padding:10px;border-radius:10px;margin:7px 0;color:#334f65;scroll-margin-top:16px}
   #ln-connection-schedule-v1 .lnnxt .lnhi-slot-detail b{display:block;color:#6c4b19;font-size:13px;margin-bottom:4px}
   #ln-connection-schedule-v1 .lnnxt .lnhi-slot-detail p{color:#345269;font-size:12px;line-height:1.6;margin:5px 0}
   #ln-connection-schedule-v1 .lnnxt .lnhi-slot-detail .lnhi-ball{display:inline-flex;min-width:35px;min-height:35px;align-items:center;justify-content:center;padding:4px;border:1px solid #a2bcca;border-radius:7px;background:#f0f5f8;margin:3px;color:#284761;font-weight:850;font-size:12px}
   #ln-connection-schedule-v1 .lnnxt .lnhi-slot-detail .lnhi-ball.hit{background:#c9f1d8;color:#14603a;border-color:#70bb92}
   #ln-connection-schedule-v1 .lnnxt .lnhi-slot-detail .lnhi-ball.miss{background:#ffdde2;color:#a53947;border-color:#da94a0}
   #ln-connection-schedule-v1 .lnnxt .lnhi-slot-detail button{display:block;margin-top:7px;background:#e8f1fa;color:#26526d;border:1px solid #aac1cf;padding:7px 10px;min-height:36px;border-radius:8px;font-size:12px}
  `;
  root.append(style);
  const $=s=>root.querySelector(s);
  const latest=()=>window.LNConnectionSchedule?.getModel()?.last||0;
  const config=()=>({group:document.querySelector('#ln-connection-schedule-v1 [data-lnmx-tier]')?.value||'1',
    kind:document.querySelector('#ln-connection-schedule-v1 [data-lnmx-kind]')?.value||'V'});
  const cache=new Map();
  function readTarget(round){
    const model=window.LNConnectionSchedule?.getModel();
    if(!model?.byDraw||!window.LNOverlapAudit||round<5||round>model.last+1)return null;
    const {group,kind}=config(),key=model.last+':'+round+':'+group+':'+kind;
    if(cache.has(key))return cache.get(key);
    const source=window.LNOverlapAudit.countConnections(round,model.byDraw);
    if(!source)return null;
    const all=[];for(let n=1;n<=45;n++)if(source[n]>0&&(source[n]>=6?'6':String(source[n]))===group)all.push(n);
    const line=(slot)=>{
      const result=[],rows=Math.ceil(all.length/6);
      const point=(r,c)=>r>=0&&c>=0&&c<6?all[r*6+c]:undefined;
      if(kind==='V')for(let r=0;r<rows;r++)result.push(point(r,slot));
      if(kind==='H')for(let c=0;c<6;c++)result.push(point(slot,c));
      if(kind==='D')for(let r=0;r<rows;r++)result.push(point(r,slot+r));
      if(kind==='A')for(let r=0;r<rows;r++)result.push(point(r,slot-r));
      return result.filter(Number.isInteger);
    };
    const lines=Array.from({length:6},(_,i)=>line(i));
    const raw=model.byDraw[round];
    const actual=raw instanceof Set&&raw.size===6?raw:null;
    const data={round,group,kind,lines,all,actual};
    cache.set(key,data);return data;
  }
  function lineName(data,slot){return ({V:'세로 '+(slot+1)+'열',H:'가로 '+(slot+1)+'줄',D:'↘대각 '+(slot+1)+'칸',A:'↙대각 '+(slot+1)+'칸'})[data.kind[0]]||((slot+1)+'열');}
  function ballsFor(container,numbers,actual){
    for(const n of numbers){
      const ball=document.createElement('span');
      ball.className='lnhi-ball'+(actual?(actual.has(n)?' hit':' miss'):'');
      ball.textContent=n+(actual?(actual.has(n)?' ✓':' ×'):'');
      container.append(ball);
    }
  }
  function slotDetail(round,slot,location,compact=false){
    const data=readTarget(round);
    if(!data){location.textContent='데이터가 없어 당시 번호를 복원할 수 없습니다.';return;}
    const nums=data.lines[slot],actual=data.actual;
    const d=document.createElement('div');d.className=compact?'lnhi-detail':'lnhi-slot-detail';
    const header=document.createElement('b');
    header.textContent=round+'회 · '+lineName(data,slot)+' · 당시 '+data.group+'건 중복 후보';
    d.append(header);
    const info=document.createElement('p');
    info.textContent=(round-1)+'회까지의 결과로 계산한 '+round+'회 대상번호'+
      (nums.length<2?' · O/X 라인은 2수 미만이라 미구성':'');
    d.append(info);
    if(nums.length)ballsFor(d,nums,actual);
    else{const p=document.createElement('p');p.textContent='이 열에 후보번호가 없었습니다.';d.append(p);}
    const hits=actual?nums.filter(n=>actual.has(n)).length:0;
    const won=document.createElement('p');
    won.textContent='실제 '+round+'회 본당첨: '+(actual?[...actual].sort((a,b)=>a-b).join(' · ')+'번':'결과 대기')+
      ' · 이 열 출현 '+(actual?hits+'/'+nums.length:'미확정');
    d.append(won);
    const latestRound=window.LNConnectionSchedule?.getModel()?.last||0;
    if(round<latestRound+1){
      const next=document.createElement('button');next.type='button';
      next.textContent='▶ 다음 '+(round+1)+'회 당시 후보·결과 비교';
      next.addEventListener('click',()=>{
        // Recalculate candidates for the NEXT target, instead of using the same
        // round's candidate numbers to grade a different draw.
        slotDetail(round+1,slot,location,compact);
      });
      d.append(next);
    }
    const close=document.createElement('button');close.type='button';close.textContent='✕ 해당수 접기';
    close.addEventListener('click',()=>{
      if(compact)d.remove();else location.remove();
    });d.append(close);
    location.replaceChildren(d);
    if(typeof d.scrollIntoView==='function')d.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function decorate(){
    for(const row of root.querySelectorAll('.lnnxt-similar')){
      const title=row.querySelector('.lnnxt-label-col')?.textContent||'';
      const round=Number(title.match(/(\d+)회/)?.[1]);
      if(!round)continue;
      const cells=row.querySelectorAll('.lnnxt-mini span');
      cells.forEach((cell,i)=>{
        if(cell.dataset.lnhiSlot)return;
        cell.dataset.lnhiSlot=String(i);
        cell.setAttribute('role','button');cell.tabIndex=0;
        cell.setAttribute('aria-label',round+'회 '+(i+1)+'칸의 당시 후보 확인');
        const handler=()=>{
          const old=row.nextElementSibling;
          if(old?.dataset?.lnhiInline==='1'){
            const matched=old.dataset.slot===String(i)&&!!old.querySelector('.lnhi-slot-detail');
            old.remove();if(matched)return;
          }
          const holder=document.createElement('div');holder.dataset.lnhiInline='1';holder.dataset.slot=String(i);
          row.after(holder);slotDetail(round,i,holder,false);
        };
        cell.addEventListener('click',handler);
        cell.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handler();}});
      });
    }
  }
  const controls=document.createElement('section');controls.className='lnhi';controls.dataset.lnhi='1';
  controls.innerHTML=`
    <h6>📒 과거 회차별 해당수 복기</h6>
    <p>과거 O/X의 각 칸을 터치하면 당시 계산된 후보와 실제 당첨번호를 바로 아래에 표시합니다. 후보는 대상 회차보다 이전의 당첨번호만으로 복원합니다.</p>
    <div class="lnhi-tools">
      <label>전체 회차 직접 조회<input type="number" min="5" inputmode="numeric" data-lnhi-round placeholder="예: 1207"></label>
      <button type="button" data-lnhi-search>당시 6개 열 보기</button>
    </div>
    <div data-lnhi-search-result></div>`;
  const recent=$('[data-lnnxt-recent]');
  if(recent)recent.after(controls);else root.append(controls);
  const searchButton=controls.querySelector('[data-lnhi-search]'),input=controls.querySelector('[data-lnhi-round]');
  function search(){
    const round=Number(input.value),out=controls.querySelector('[data-lnhi-search-result]');out.replaceChildren();
    const max=latest();
    if(!Number.isInteger(round)||round<5||round>max+1){out.textContent='조회 범위: 5~'+(max+1)+'회';return;}
    const record=readTarget(round);if(!record){out.textContent='기존 데이터에서 해당 회차를 복원하지 못했습니다.';return;}
    const head=document.createElement('div');head.className='lnhi-history-head';
    head.textContent=round+'회 · '+record.group+'건 중복 번호군 · 6칸';out.append(head);
    const grid=document.createElement('div');grid.className='lnhi-six';
    const details=document.createElement('div');out.append(grid,details);
    for(let i=0;i<6;i++){
      const button=document.createElement('button');button.type='button';
      button.textContent=String(i+1)+'열';
      const small=document.createElement('small');
      small.textContent=record.lines[i].length+'수';button.append(small);
      button.addEventListener('click',()=>slotDetail(round,i,details,true));
      grid.append(button);
    }
    const note=document.createElement('p');note.textContent='당첨 '+
      (record.actual?[...record.actual].sort((a,b)=>a-b).join(' · '):'결과 대기');out.append(note);
    if(typeof out.scrollIntoView==='function')out.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  searchButton.addEventListener('click',search);
  input.addEventListener('change',search);
  const observer=new MutationObserver(()=>decorate());
  observer.observe(root,{childList:true,subtree:true});decorate();
  window.addEventListener('lncs:schedule-ready',()=>cache.clear());
})();
