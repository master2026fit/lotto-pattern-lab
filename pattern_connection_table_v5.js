/* LOTTO NOTE: nearest-first table for confirmed-source pattern continuations. */
(()=>{
  'use strict';
  const root=document.querySelector('#ln-connection-schedule-v1');
  const box=root?.querySelector('.lncs-source-box');
  const status=box?.querySelector('[data-lncs-source-status]');
  if(!box||!status||box.querySelector('[data-lnct-table]'))return;
  const css=document.createElement('style');
  css.textContent=`
    #ln-connection-schedule-v1 .lnct-panel{margin:14px 0;padding:11px;background:#0b2a41;border:1px solid #6d9e9e;border-radius:12px}
    #ln-connection-schedule-v1 .lnct-title{color:#ffe3aa;font-weight:900;font-size:16px;margin:0 0 4px}
    #ln-connection-schedule-v1 .lnct-meta{color:#bddeea;font-size:12px;line-height:1.65;margin:0 0 10px}
    #ln-connection-schedule-v1 .lnct-scroll{width:100%;overflow-x:auto;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}
    #ln-connection-schedule-v1 .lnct-table{width:100%;border-collapse:separate;border-spacing:0 5px;font-size:12px;table-layout:fixed}
    #ln-connection-schedule-v1 .lnct-table th{padding:6px 2px;text-align:left;color:#e4f0fa;font-weight:800;border-bottom:1px solid #54718d}
    #ln-connection-schedule-v1 .lnct-table td{background:#1b3b54;border-top:1px solid #496d85;border-bottom:1px solid #496d85;padding:10px 4px;color:#e6f1fa;line-height:1.45;vertical-align:middle}
    #ln-connection-schedule-v1 .lnct-table td:first-child{border-left:1px solid #496d85;border-radius:9px 0 0 9px}
    #ln-connection-schedule-v1 .lnct-table td:last-child{border-right:1px solid #496d85;border-radius:0 9px 9px 0}
    #ln-connection-schedule-v1 .lnct-table strong{color:#ffe0a5;display:block;font-size:14px;font-weight:900}
    #ln-connection-schedule-v1 .lnct-table small{color:#bcd2e5;font-size:11px}
    #ln-connection-schedule-v1 .lnct-table tr:hover td{background:#275371}
    #ln-connection-schedule-v1 .lnct-table tr.lnct-selected td{background:#31566b;border-top-color:#ffd27c;border-bottom-color:#ffd27c}
    #ln-connection-schedule-v1 .lnct-table tr.lnct-selected td:first-child{border-left-color:#ffd27c}
    #ln-connection-schedule-v1 .lnct-table tr.lnct-selected td:last-child{border-right-color:#ffd27c}
    #ln-connection-schedule-v1 .lnct-table tr.lnct-returned-row td{background:#6b4d26!important;border-top-color:#ffe4a2;border-bottom-color:#ffe4a2}
    #ln-connection-schedule-v1 .lnct-go{display:block;width:100%;background:#315e73;color:#d5ffe9;border:1px solid #7bd5ad;border-radius:8px;padding:8px 2px;font-size:11px;font-weight:850;cursor:pointer}
    #ln-connection-schedule-v1 .lnct-more{margin:10px 0 0;background:#245170;color:#f9e7bc;border:1px solid #739cb5;border-radius:9px;padding:10px 13px;font-size:13px;font-weight:800;width:100%;cursor:pointer}
    #ln-connection-schedule-v1 .lnct-empty{padding:10px;color:#c4d8e7;font-size:12px}
    #ln-connection-schedule-v1 .lnct-back-strip{background:#1a3c55;padding:8px 10px;display:flex;justify-content:flex-start;align-items:center;flex-wrap:wrap;gap:8px;border-bottom:1px solid #466681}
    #ln-connection-schedule-v1 .lnct-back-strip span{font-size:11px;color:#c7dfec;line-height:1.5}
    #ln-connection-schedule-v1 .lnct-back{flex:none;min-height:42px;background:#dfb269;color:#152d3b;border:1px solid #ffdda0;border-radius:9px;padding:9px 12px;font-size:13px;font-weight:900;cursor:pointer}
    #ln-connection-schedule-v1 .lnct-panel{scroll-margin-top:75px}
    #ln-connection-schedule-v1 .lnct-panel.lnct-returned{outline:3px solid #ffda8c;outline-offset:3px}
    #ln-connection-schedule-v1 .lncs-target-highlight{outline:3px solid #ffcf73;outline-offset:3px;border-radius:9px;background:#294b5c!important;scroll-margin-top:95px;scroll-margin-bottom:115px}
    @media(max-width:560px){#ln-connection-schedule-v1 .lnct-panel{padding:8px}#ln-connection-schedule-v1 .lnct-table{font-size:11px}#ln-connection-schedule-v1 .lnct-table td{padding:9px 2px}#ln-connection-schedule-v1 .lnct-table strong{font-size:12px}#ln-connection-schedule-v1 .lnct-go{font-size:10px}#ln-connection-schedule-v1 .lnct-back{min-height:38px;padding:8px 10px;font-size:12px}}
  `;
  root.append(css);
  const panel=document.createElement('section');panel.className='lnct-panel';panel.dataset.lnctTable='1';
  const title=document.createElement('div');title.className='lnct-title';title.textContent='📋 다음 연결 회차 · 가까운 순서';
  const meta=document.createElement('p');meta.className='lnct-meta';
  const scroll=document.createElement('div');scroll.className='lnct-scroll';
  const table=document.createElement('table');table.className='lnct-table';
  const cols=document.createElement('colgroup');[.27,.25,.30,.18].forEach(f=>{const col=document.createElement('col');col.style.width=(f*100)+'%';cols.append(col);});
  table.append(cols);
  const thead=document.createElement('thead');const h=document.createElement('tr');
  ['검증 회차·번호','성공 출발','간격·이동','연결 그림'].forEach(t=>{const th=document.createElement('th');th.textContent=t;h.append(th);});
  thead.append(h);table.append(thead);
  const tbody=document.createElement('tbody');table.append(tbody);scroll.append(table);
  const more=document.createElement('button');more.type='button';more.className='lnct-more';
  panel.append(title,meta,scroll,more);status.after(panel);
  let lastKey='',rows=[],limit=18,renderRequested=false,selectedRowKey='',externalReturnRow=null;
  const sourceInput=box.querySelector('[data-lncs-source-round]');
  const minSelect=box.querySelector('[data-lncs-source-min]');
  function dataRows(round){
    const cached=(()=>{try{return JSON.parse(localStorage.getItem('ln_connection_success_source_archive_v1')||'{}')[round]?.paths||null;}catch(_){return null;}})();
    if(cached)return cached;
    if(typeof state==='undefined'||!Array.isArray(state.draws))return [];
    const byDraw=[];
    state.draws.forEach(d=>{byDraw[Number(d.draw_no)]=new Set(d.numbers.map(Number));});
    const actual=byDraw[round];if(!actual)return [];
    const found=[];
    for(let gap=1;round-2*gap>=1;gap++){
      const prev=byDraw[round-gap],older=byDraw[round-2*gap];if(!prev||!older)continue;
      for(const num of actual)for(let shift=-14;shift<=14;shift++){
        const next=num+shift;
        if(next<1||next>45||!prev.has(num-shift)||!older.has(num-2*shift))continue;
        let count=3;
        while(round-count*gap>=1&&byDraw[round-count*gap]?.has(num-count*shift))count++;
        found.push({sourceRound:round,sourceNum:num,target:round+gap,next,gap,shift,count});
      }
    }
    return found;
  }
  function pathMatch(item){
    const list=box.querySelector('[data-lncs-source-list]');
    const target=`${item.sourceRound}회 ${item.sourceNum}번 성공 → ${item.target}회 ${item.next}번 대상`;
    for(const card of list.querySelectorAll('.lncs-source-number')){
      if(!card.querySelector('.lncs-source-head')?.textContent.includes(`${item.sourceRound}회 ${item.sourceNum}번 실제`))continue;
      const details=card.querySelector('details');if(!details)return null;
      if(!details.open)details.open=true;
      for(const row of details.querySelectorAll('.lncs-source-entry')){
        if(row.querySelector('b')?.textContent!==target)continue;
        const note=row.querySelector(':scope > div')?.textContent||'';
        if(note.includes(`간격 +${item.gap}회`)&&note.includes(`번호 이동 ${item.shift>=0?'+':''}${item.shift}`))return row;
      }
    }
    return null;
  }
  function rowKey(item){return [item.sourceRound,item.sourceNum,item.target,item.next,item.gap,item.shift].join('|');}
  function highlightSelectedRow(){
    tbody.querySelectorAll('tr[data-lnct-key]').forEach(row=>{
      const selected=row.dataset.lnctKey===selectedRowKey;
      row.classList.toggle('lnct-selected',selected);
      if(selected)row.setAttribute('aria-current','true');else row.removeAttribute('aria-current');
    });
  }
  function jump(item,returnRow=null){
    externalReturnRow=returnRow&&returnRow.nodeType===1?returnRow:null;
    if(Number(sourceInput.value)!==Number(item.sourceRound)){
      sourceInput.value=String(item.sourceRound);
      sourceInput.dispatchEvent(new Event('change',{bubbles:true}));
    }
    selectedRowKey=rowKey(item);
    highlightSelectedRow();
    const pill=[...box.querySelectorAll('[data-lncs-source-pills] button')].find(b=>b.textContent===`${item.sourceNum}번`);
    if(pill&&pill.getAttribute('aria-pressed')!=='true')pill.click();
    let attempts=0;
    const seek=()=>{
      const target=pathMatch(item);
      if(target){
        const picture=target.querySelector('.lncs-visual')||target;
        target.classList.add('lncs-target-highlight');
        picture.scrollIntoView({behavior:'smooth',block:'center'});
        setTimeout(()=>target.classList.remove('lncs-target-highlight'),3500);
        return;
      }
      if(++attempts<18)setTimeout(seek,70);
    };
    seek();
  }
  function td(content){const cell=document.createElement('td');if(typeof content==='string')cell.textContent=content;else cell.append(content);return cell;}
  function rich(primary,secondary){const box=document.createElement('span');const b=document.createElement('strong');b.textContent=primary;const small=document.createElement('small');small.textContent=secondary;box.append(b,small);return box;}
  function render(){
    const round=Number(sourceInput.value),min=Number(minSelect.value)||4;
    if(!round||typeof state==='undefined'||!state.draws?.length)return;
    const key=round+'|'+min+'|'+state.draws.length;
    if(key!==lastKey){
      limit=18;lastKey=key;selectedRowKey='';
      rows=dataRows(round).filter(x=>x.count>=min).sort((a,b)=>a.target-b.target||a.next-b.next||a.sourceNum-b.sourceNum||b.count-a.count||a.gap-b.gap||a.shift-b.shift);
    }
    meta.textContent=`${round}회 실제 연결 성공 ${rows.length}건 · 검증 예정 회차 빠른 순 · 행의 '그림'을 누르면 해당 연결 그림으로 이동합니다.`;
    tbody.textContent='';
    const fragment=document.createDocumentFragment();
    rows.slice(0,limit).forEach(item=>{
      const tr=document.createElement('tr');
      tr.dataset.lnctKey=rowKey(item);
      tr.append(td(rich(item.target+'회',item.next+'번 대상')));
      tr.append(td(rich(item.sourceRound+'회',item.sourceNum+'번 성공')));
      tr.append(td(rich('+'+item.gap+'회',`번호 ${item.shift>=0?'+':''}${item.shift} · ${item.count}→${item.count+1}점`)));
      const go=document.createElement('button');go.type='button';go.className='lnct-go';go.textContent='그림 ↘';go.setAttribute('aria-label',`${item.target}회 ${item.next}번 연결 그림 보기`);
      go.addEventListener('click',()=>jump(item));tr.append(td(go));
      tr.addEventListener('click',event=>{if(!event.target.closest('button'))jump(item);});
      fragment.append(tr);
    });
    tbody.append(fragment);
    highlightSelectedRow();
    if(!rows.length){const row=document.createElement('tr');const cell=document.createElement('td');cell.colSpan=4;cell.className='lnct-empty';cell.textContent='선택한 조건에서 이어진 연결 없음';row.append(cell);tbody.append(row);}
    more.hidden=rows.length<=limit;more.textContent=`다음 ${Math.min(18,rows.length-limit)}건 더 보기 (${Math.min(limit,rows.length)}/${rows.length})`;
  }
  function schedule(){if(renderRequested)return;renderRequested=true;requestAnimationFrame(()=>{renderRequested=false;render();});}
  function addBackLinks(){
    const list=box.querySelector('[data-lncs-source-list]');if(!list)return;
    list.querySelectorAll('.lncs-visual:not([data-lnct-back])').forEach(visual=>{
      visual.dataset.lnctBack='1';
      const bar=document.createElement('div');bar.className='lnct-back-strip';
      const label=document.createElement('span');label.textContent='연결 그림 확인 후 표에서 다른 회차 선택';
      const back=document.createElement('button');back.type='button';back.className='lnct-back';back.textContent='📋 표로 돌아가기';
      back.addEventListener('click',()=>{
        const selected=externalReturnRow?.isConnected?externalReturnRow:[...tbody.querySelectorAll('tr[data-lnct-key]')].find(row=>row.dataset.lnctKey===selectedRowKey);
        if(selected){
          selected.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'});
          selected.classList.add('lnct-returned-row','lncm-flash');
          setTimeout(()=>selected.classList.remove('lnct-returned-row','lncm-flash'),2100);
        }else{
          panel.scrollIntoView({behavior:'smooth',block:'start'});
          panel.classList.add('lnct-returned');
          setTimeout(()=>panel.classList.remove('lnct-returned'),1700);
        }
      });
      bar.append(back,label);
      visual.insertBefore(bar,visual.querySelector('.lncs-visual-scroll'));
    });
  }
  window.LNConnectionTableNavigate={jump};
  more.addEventListener('click',()=>{limit+=18;render();});
  new MutationObserver(schedule).observe(status,{childList:true,characterData:true,subtree:true});
  const sourceList=box.querySelector('[data-lncs-source-list]');
  if(sourceList)new MutationObserver(addBackLinks).observe(sourceList,{childList:true,subtree:true});
  sourceInput.addEventListener('change',schedule);minSelect.addEventListener('change',schedule);
  schedule();addBackLinks();
})();
