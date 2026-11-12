/* Lotto Note: number-overlap backtest, predraw reconstruction. */
(function installOverlapAudit(){
  'use strict';
  const master=document.querySelector('#ln-connection-schedule-v1 [data-lncm-master]');
  if(!master||master.querySelector('[data-lnco]'))return;
  const css=document.createElement('style');
  css.textContent=`
  #ln-connection-schedule-v1 .lnco{width:100%;max-width:100%;min-width:0;box-sizing:border-box;margin:12px 0;padding:11px;border:1px solid #c49c60;border-radius:13px;background:#103047;color:#e9f6ff}
  #ln-connection-schedule-v1 .lnco h6{color:#ffe0a5;font-size:17px;margin:0 0 8px}
  #ln-connection-schedule-v1 .lnco p{font-size:12px;line-height:1.7;color:#c9dfe9;margin:6px 0}
  #ln-connection-schedule-v1 .lnco-curr{padding:10px;background:#173a51;border-radius:9px;margin:9px 0}
  #ln-connection-schedule-v1 .lnco-curr strong{display:block;color:#ffe0a4;font-size:14px;margin:2px 0 8px}
  #ln-connection-schedule-v1 .lnco-row{display:flex;gap:5px;align-items:start;flex-wrap:wrap;padding:6px 0;border-top:1px solid #42647a}
  #ln-connection-schedule-v1 .lnco-row>strong{color:#ffdd99;flex:none;min-width:45px;font-size:12px;padding-top:7px}
  #ln-connection-schedule-v1 .lnco-chips{display:flex;flex:1;flex-wrap:wrap;gap:5px}
  #ln-connection-schedule-v1 .lnco-chip{display:inline-flex;align-items:center;justify-content:center;min-width:33px;min-height:32px;padding:5px;border-radius:7px;border:1px solid #668aa3;background:#264960;box-sizing:border-box;font-size:12px;font-weight:850}
  #ln-connection-schedule-v1 .lnco-chip.hit{color:#b9ffe1;border-color:#70d3a6;background:#205342}
  #ln-connection-schedule-v1 .lnco-chip.miss{color:#ffe1e4;border-color:#db9ca4;background:#522f3d}
  #ln-connection-schedule-v1 .lnco-tools{display:flex;flex-wrap:wrap;gap:7px;align-items:end;margin:9px 0}
  #ln-connection-schedule-v1 .lnco-tools label{flex:1 1 100px;color:#d5ebf4;font-size:12px;display:flex;flex-direction:column;gap:5px}
  #ln-connection-schedule-v1 .lnco-tools select{width:100%;padding:9px;border:1px solid #9dc9db;border-radius:7px;background:#e7f5ff;color:#143044;min-height:42px;box-sizing:border-box}
  #ln-connection-schedule-v1 .lnco button{touch-action:manipulation}
  #ln-connection-schedule-v1 .lnco-tools button{flex:2 1 140px;min-height:42px;background:#d5a75f;color:#173146;border:1px solid #fbe0a6;font-size:13px;font-weight:900}
  #ln-connection-schedule-v1 .lnco button:disabled{opacity:.6}
  #ln-connection-schedule-v1 .lnco-status{font-size:12px;color:#c3f4dc;line-height:1.6;padding:6px 0}
  #ln-connection-schedule-v1 .lnco-out{overflow-x:auto;max-width:100%}
  #ln-connection-schedule-v1 .lnco-out table{width:100%;border-collapse:collapse;table-layout:auto;font-size:12px}
  #ln-connection-schedule-v1 .lnco-out th,#ln-connection-schedule-v1 .lnco-out td{text-align:center;padding:8px 4px;border:1px solid #416177;color:#e4f4ff;background:#16374d;overflow-wrap:anywhere}
  #ln-connection-schedule-v1 .lnco-out th{background:#294e61;color:#ffe0a4;font-weight:900}
  #ln-connection-schedule-v1 .lnco-out tr:nth-child(5) td,#ln-connection-schedule-v1 .lnco-out tr:nth-child(6) td{background:#204758}
  #ln-connection-schedule-v1 .lnco-list{display:grid;gap:7px;margin:10px 0}
  #ln-connection-schedule-v1 .lnco-list details{border:1px solid #4b7487;border-radius:9px;background:#163a50;padding:9px}
  #ln-connection-schedule-v1 .lnco-list summary{cursor:pointer;color:#ffe1ad;font-weight:800;font-size:12px;line-height:1.65}
  #ln-connection-schedule-v1 .lnco-more{display:block;width:100%;min-height:42px;background:#315970!important;margin:8px 0}
  #ln-connection-schedule-v1 .lnco .lnco-cap{color:#a9c9df;font-size:11px;line-height:1.6}
  @media(max-width:700px){
  #ln-connection-schedule-v1 .lnco{padding:8px}
  #ln-connection-schedule-v1 .lnco-out{overflow:visible}
  #ln-connection-schedule-v1 .lnco-out th,#ln-connection-schedule-v1 .lnco-out td{padding:8px 3px;font-size:11px}
  #ln-connection-schedule-v1 .lnco-chip{min-width:31px;min-height:31px}
  }`;
  master.append(css);
  const panel=document.createElement('section');panel.className='lnco';panel.dataset.lnco='1';
  panel.innerHTML=`
    <h6>🔎 같은 번호의 연결 중복 · 실제 당첨 복기</h6>
    <p>같은 회차·같은 번호에 연결이 1건, 2건, 3건 이상 겹칠수록 실제로 더 자주 출현했는지 검증합니다.</p>
    <div class="lnco-curr" data-lnco-current>현재 연결번호를 불러오는 중입니다.</div>
    <div class="lnco-tools">
      <label>과거 검증 범위 <select data-lnco-period>
        <option value="50">최근 50회</option><option value="100" selected>최근 100회</option>
        <option value="250">최근 250회</option><option value="all">전체 과거</option>
      </select></label>
      <button type="button" data-lnco-run>📊 중복 적중률 복기</button>
    </div>
    <div class="lnco-status" data-lnco-status>복기를 누르면 해당 회차 직전 기록만으로 번호별 중복을 다시 계산합니다.</div>
    <div class="lnco-out" data-lnco-result></div>
    <div class="lnco-list" data-lnco-list></div>
    <button type="button" class="lnco-more" data-lnco-more hidden>이전 회차 더 보기</button>
    <p class="lnco-cap">본당첨 6개 기준(보너스 제외) · 같은 번호의 여러 경로는 번호 한 개로 집계 · 과거 재계산은 추첨 전에 서버에 저장한 실전 예측과 구분합니다. 무작위 기준 6/45=13.33%입니다.</p>`;
  master.querySelector('[data-lncm-stats]')?.after(panel);
  const $=selector=>panel.querySelector(selector);
  const categories=['0건','1건','2건','3건','4건','5건+'];
  const category=c=>c>=5?'5건+':c+'건';
  let model=null,shown=12,results=[],busy=false;
  function countConnections(target,byDraw){
    const c=new Uint16Array(46);
    // The target draw itself never influences its retrospective predictors.
    for(let gap=1;gap*4<target;gap++){
      const p1=byDraw[target-gap],p2=byDraw[target-2*gap],p3=byDraw[target-3*gap],p4=byDraw[target-4*gap];
      if(!(p1 instanceof Set)||!(p2 instanceof Set)||!(p3 instanceof Set)||!(p4 instanceof Set))continue;
      for(const last of p1)for(let move=-14;move<=14;move++){
        const next=last+move;
        if(next>=1&&next<=45&&p2.has(last-move)&&p3.has(last-2*move)&&p4.has(last-3*move))c[next]++;
      }
    }
    return c;
  }
  function numberGroups(c){
    const groups=Object.fromEntries(categories.map(k=>[k,[]]));
    for(let n=1;n<=45;n++)groups[category(c[n])].push(n);
    return groups;
  }
  function drawRow(group,ns,actual){
    const row=document.createElement('div');row.className='lnco-row';
    const key=document.createElement('strong');key.textContent=group;row.append(key);
    const chips=document.createElement('div');chips.className='lnco-chips';
    for(const n of ns){
      const chip=document.createElement('span');chip.className='lnco-chip'+(actual?(actual.has(n)?' hit':' miss'):'');
      chip.textContent=n;chips.append(chip);
    }
    if(!ns.length){const empty=document.createElement('small');empty.textContent='없음';chips.append(empty);}
    row.append(chips);return row;
  }
  function refresh(){
    model=window.LNConnectionSchedule?.getModel()||null;
    if(!model)return;
    const target=model.due?.has(model.last+1)?model.last+1:[...model.due.keys()][0];
    const current=$('[data-lnco-current]');current.textContent='';
    if(!target){current.textContent='다음 연결번호가 발견되지 않았습니다.';return;}
    const paths=model.due.get(target),c=new Uint16Array(46);
    for(const p of paths)if(p.next>=1&&p.next<=45)c[p.next]++;
    const groups=numberGroups(c);
    const head=document.createElement('strong');
    head.textContent=target+'회 예정 · '+paths.length+'건 연결 · '+(45-groups['0건'].length)+'개 대상 번호';
    current.append(head);
    for(const name of categories.slice(1))if(groups[name].length)current.append(drawRow(name,groups[name],null));
    const note=document.createElement('p');note.textContent='위 번호는 추첨 전 연결 수만 표시하며, 출현·미출현 판정은 결과 발표 후에 합니다.';current.append(note);
  }
  function summaryTable(stats,start,last){
    const box=$('[data-lnco-result]');box.textContent='';
    const header=document.createElement('strong');header.textContent=start+'~'+last+'회 번호별 연결 중복 복기';box.append(header);
    const table=document.createElement('table'),thead=document.createElement('thead'),tr=document.createElement('tr');
    for(const a of ['연결','번호 사례','출현','출현율']){
      const th=document.createElement('th');th.textContent=a;tr.append(th);
    }
    thead.append(tr);table.append(thead);
    const body=document.createElement('tbody');
    for(const name of categories){
      const data=stats[name],row=document.createElement('tr');
      const cells=[name,data.count.toLocaleString('ko-KR'),data.hit.toLocaleString('ko-KR'),data.count?(100*data.hit/data.count).toFixed(2)+'%':'—'];
      for(const value of cells){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}
      body.append(row);
    }
    table.append(body);box.append(table);
    const info=document.createElement('p');info.textContent='무작위 기준 13.33%와 비교하세요. 중복 연결이 많아도 무조건 확률이 커지는 것은 아닙니다.';box.append(info);
  }
  function renderRecaps(){
    const list=$('[data-lnco-list]');list.textContent='';
    for(const item of results.slice(0,shown)){
      const detail=document.createElement('details');
      const head=document.createElement('summary');
      const matched=[...item.actual].filter(n=>item.c[n]>0).length;
      const candidates=Array.from(item.c).slice(1).filter(v=>v>0).length;
      head.textContent=item.round+'회 · 연결 '+candidates+'수 중 출현 '+matched+'수 · 당첨 '+[...item.actual].sort((a,b)=>a-b).join(' · ');
      detail.append(head);
      detail.addEventListener('toggle',()=>{
        if(!detail.open||detail.dataset.filled)return;
        detail.dataset.filled='1';
        const groups=numberGroups(item.c);
        for(const name of categories.slice(1))if(groups[name].length)detail.append(drawRow(name,groups[name],item.actual));
        const caption=document.createElement('p');caption.textContent='초록: 출현 / 붉은색: 미출현 · 같은 번호의 경로 중복 제거';detail.append(caption);
      });
      list.append(detail);
    }
    const more=$('[data-lnco-more]');
    more.hidden=results.length<=shown;
    more.textContent='이전 '+Math.min(12,results.length-shown)+'회 더 보기 ('+Math.min(shown,results.length)+'/'+results.length+')';
  }
  async function audit(){
    if(busy)return;
    model=window.LNConnectionSchedule?.getModel()||null;
    if(!model||!model.last||!model.byDraw){$('[data-lnco-status]').textContent='당첨번호 데이터를 불러온 후 실행할 수 있습니다.';return;}
    busy=true;const btn=$('[data-lnco-run]'),selector=$('[data-lnco-period]');
    btn.disabled=true;selector.disabled=true;
    const last=model.last,desired=selector.value,from=desired==='all'?5:Math.max(5,last-Number(desired)+1);
    const stats=Object.fromEntries(categories.map(k=>[k,{count:0,hit:0}]));
    results=[];shown=12;$('[data-lnco-result]').textContent='';$('[data-lnco-list]').textContent='';$('[data-lnco-more]').hidden=true;
    try{
      for(let round=last;round>=from;round--){
        const actual=model.byDraw[round];
        if(!(actual instanceof Set)||actual.size!==6)throw Error(round+'회 실제 당첨 6수 데이터 없음');
        const c=countConnections(round,model.byDraw);
        for(let n=1;n<=45;n++){const row=stats[category(c[n])];row.count++;if(actual.has(n))row.hit++;}
        results.push({round,c,actual});
        if((last-round+1)%8===0){
          $('[data-lnco-status]').textContent=(last-round+1)+'/'+(last-from+1)+'회 계산 중 · 추첨 전 데이터만 사용';
          await new Promise(resolve=>setTimeout(resolve,0));
        }
      }
      if(window.LNConnectionSchedule?.getModel()?.last!==last)throw Error('검증 도중 회차가 갱신됐습니다. 다시 실행해 주세요.');
      summaryTable(stats,from,last);renderRecaps();
      $('[data-lnco-status]').textContent='✓ '+from+'~'+last+'회 복기 완료 · 본당첨 기준 · 과거 재계산';
    }catch(e){
      results=[];$('[data-lnco-status]').textContent='검증 오류: '+e.message;
    }finally{busy=false;btn.disabled=false;selector.disabled=false;}
  }
  $('[data-lnco-run]').addEventListener('click',audit);
  $('[data-lnco-more]').addEventListener('click',()=>{shown+=12;renderRecaps();});
  window.addEventListener('lncs:schedule-ready',refresh);
  refresh();
})();
