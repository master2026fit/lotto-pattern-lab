/* Lotto Note: 3rd-column vertical X and 4th-column diagonal X walk-forward audit. */
(function installVerticalDiagonalHistoryTest(){
  'use strict';
  const parent=document.querySelector('#ln-connection-schedule-v1 [data-lnnxt]');
  if(!parent||parent.querySelector('[data-lnvd]'))return;
  const css=document.createElement('style');
  css.textContent=`
  #ln-connection-schedule-v1 .lnvd{box-sizing:border-box;max-width:100%;margin:13px 0;padding:11px;background:#f5faff;border:2px solid #8db4cb;border-radius:12px;color:#294c67}
  #ln-connection-schedule-v1 .lnvd h6{font-size:17px;color:#204e68;font-weight:900;margin:0 0 7px}
  #ln-connection-schedule-v1 .lnvd p{font-size:12px;line-height:1.7;margin:7px 0;color:#41647b}
  #ln-connection-schedule-v1 .lnvd h6~p b{color:#27516b}
  #ln-connection-schedule-v1 .lnvd .lnvd-criteria{padding:9px;background:#e2f0fd;border-left:4px solid #7aaacb;border-radius:5px;font-size:11px;line-height:1.7;color:#284a66}
  #ln-connection-schedule-v1 .lnvd .lnvd-status{padding:8px 10px;margin:9px 0;border-radius:8px;background:#e1f5e9;color:#1b6545;font-size:12px;line-height:1.6}
  #ln-connection-schedule-v1 .lnvd .lnvd-chart{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px;margin:10px 0}
  #ln-connection-schedule-v1 .lnvd .lnvd-cell{display:flex;align-items:center;justify-content:center;min-width:0;min-height:31px;background:#edf3f8;border:1px solid #b8cddd;border-radius:5px;color:#71889b;font-size:12px;font-weight:900}
  #ln-connection-schedule-v1 .lnvd .lnvd-cell.label{color:#315b73;background:#dfedf8;font-size:10px}
  #ln-connection-schedule-v1 .lnvd .lnvd-cell.hit{background:#ceefdc;color:#1e633e;border-color:#91c6a5}
  #ln-connection-schedule-v1 .lnvd .lnvd-cell.miss{background:#ffe1e6;color:#963546;border-color:#dfa4b0}
  #ln-connection-schedule-v1 .lnvd .lnvd-cell.miss.mark{outline:3px solid #e6ad49;outline-offset:-3px;background:#ffd69a;color:#70491c}
  #ln-connection-schedule-v1 .lnvd .lnvd-cell.wait{background:#fff3ce;color:#926c2b;border-color:#d2b16b}
  #ln-connection-schedule-v1 .lnvd .lnvd-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:11px 0}
  #ln-connection-schedule-v1 .lnvd .lnvd-stat{background:#fff;border:1px solid #c1d4df;padding:8px;border-radius:9px;min-width:0}
  #ln-connection-schedule-v1 .lnvd .lnvd-stat small{display:block;color:#4d748b;font-size:10px;line-height:1.5}
  #ln-connection-schedule-v1 .lnvd .lnvd-stat b{display:block;font-size:15px;color:#184f6b;line-height:1.45}
  #ln-connection-schedule-v1 .lnvd .lnvd-stat p{font-size:10px;line-height:1.5;margin:4px 0 0}
  #ln-connection-schedule-v1 .lnvd h5{font-size:14px;font-weight:900;color:#26546e;margin:12px 0 6px}
  #ln-connection-schedule-v1 .lnvd .lnvd-match{display:grid;gap:6px}
  #ln-connection-schedule-v1 .lnvd details{background:#fff;border:1px solid #b8d0df;border-radius:9px;padding:7px 9px;min-width:0}
  #ln-connection-schedule-v1 .lnvd summary{cursor:pointer;font-size:12px;font-weight:850;color:#315972;line-height:1.7}
  #ln-connection-schedule-v1 .lnvd .lnvd-result{background:#edf7ff;border-left:4px solid #78afce;padding:8px;color:#31536a;border-radius:5px;margin:8px 0;font-size:12px}
  #ln-connection-schedule-v1 .lnvd .lnvd-lines{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;margin:8px 0}
  #ln-connection-schedule-v1 .lnvd .lnvd-lane{padding:7px;border:1px solid #c9dbe6;background:#f3f8fc;border-radius:8px;min-width:0}
  #ln-connection-schedule-v1 .lnvd .lnvd-lane.focus{border:2px solid #d6a34d;background:#fff6dc}
  #ln-connection-schedule-v1 .lnvd .lnvd-lane b{color:#204962;font-size:11px}
  #ln-connection-schedule-v1 .lnvd .lnvd-ball{display:inline-flex;align-items:center;justify-content:center;padding:4px;margin:4px 2px 0 0;min-width:30px;min-height:30px;border-radius:6px;border:1px solid #bccfdb;background:#e9f2fa;color:#365c78;font-size:11px;font-weight:900}
  #ln-connection-schedule-v1 .lnvd .lnvd-ball.hit{background:#bff2d6;border-color:#70c59a;color:#14623e}
  #ln-connection-schedule-v1 .lnvd .lnvd-ball.miss{background:#ffdde4;border-color:#d89aa8;color:#a13a4b}
  #ln-connection-schedule-v1 .lnvd .lnvd-more,#ln-connection-schedule-v1 .lnvd .lnvd-run{display:block;width:100%;margin:9px 0;padding:10px;min-height:43px;border-radius:9px;border:1px solid #a8c1d3;background:#e0effa;color:#1f506e;font-weight:900;font-size:13px;cursor:pointer}
  #ln-connection-schedule-v1 .lnvd .lnvd-run{background:#f8d9a2;border-color:#d4a968;color:#60481f}
  #ln-connection-schedule-v1 .lnvd button:disabled{opacity:.6;cursor:wait}
  #ln-connection-schedule-v1 .lnvd [hidden]{display:none!important}
  @media(min-width:600px){#ln-connection-schedule-v1 .lnvd .lnvd-summary{grid-template-columns:repeat(3,minmax(0,1fr))}}
  `;
  parent.append(css);
  const section=document.createElement('section');section.className='lnvd';section.dataset.lnvd='1';
  section.innerHTML=`
    <h6>📐 3열 수직 · 4열 대각 연결 대기 복기</h6>
    <div class="lnvd-criteria">
      <b>검증 조건 (추첨 전 기준)</b>
      3열 세로: 직전 2회에서 3열이 연속 X.
      4열 ↘ 대각: 3회 전 1열 → 2회 전 2열 → 직전 3열이 모두 X.
      두 조건을 동시에 만족하며 검증 회차의 3·4열에 각각 후보가 2개 이상 있을 때만 집계합니다.
      과거 1건 중복번호군의 6칸 배열을 이용하며, X는 당첨 전에는 정해지지 않는 결과이므로 과거 각 회차가 끝난 뒤에만 다음 회차의 대기 조건으로 사용합니다.
    </div>
    <h5 data-lnvd-current>다음 회차 · 대기 패턴</h5>
    <div data-lnvd-chart class="lnvd-chart"></div>
    <div data-lnvd-current-numbers class="lnvd-result"></div>
    <button type="button" data-lnvd-run class="lnvd-run">📊 과거 전체 회차 동일 조건 검증</button>
    <div data-lnvd-status class="lnvd-status">과거 기록 계산을 준비하고 있습니다.</div>
    <div data-lnvd-stats class="lnvd-summary"></div>
    <h5>당시 회차별 실제 해당수 · 다음 추첨 결과</h5>
    <p>회차를 누르면 <b>당시 1~6열의 실제 후보번호, 본당첨 6개, 출현·미출현</b>을 한 번에 확인할 수 있습니다.</p>
    <div data-lnvd-cases class="lnvd-match"></div>
    <button type="button" data-lnvd-more class="lnvd-more" hidden>이전 조건 일치 회차 12개 더 보기</button>
    <div class="lnvd-criteria">
      <b>무작위 비교:</b> 선택한 후보 수가 k개라면 기대 출현 수는 k×6/45입니다.
      제외군의 실제 출현 수는 3·4열 이외 후보에서 당첨된 번호의 개수이며,
      45수 전체에서 제외한 번호까지 합산한 값과 혼동하면 안 됩니다.
      중복되거나 동일한 조건에 연속해서 걸린 회차도 관찰 결과 그대로 기록합니다.
      이 규칙은 현재 패턴을 보고 정한 사후 가설로, 미래 검증 성능을 보장하지 않습니다.
    </div>`;
  const hist=parent.querySelector('[data-lnhi]');
  if(hist)hist.after(section);
  else parent.querySelector('[data-lnnxt-recent]')?.after(section);
  const $=q=>section.querySelector(q);
  let currentModel=null,records=[],results=[],visible=12,busy=false,generation=0,cache=new Map();
  const group1=round=>{
    if(cache.has(round))return cache.get(round);
    const c=window.LNOverlapAudit.countConnections(round,currentModel.byDraw);
    const candidates=[];for(let n=1;n<=45;n++)if(c[n]===1)candidates.push(n);
    const lanes=Array.from({length:6},(_,i)=>candidates.filter((n,j)=>j%6===i));
    const actual=currentModel.byDraw[round];
    const valid=actual instanceof Set&&actual.size===6;
    const marks=lanes.map(ns=>ns.length<2?'·':valid?(ns.some(n=>actual.has(n))?'O':'X'):'?');
    const row={round,lanes,actual:valid?actual:null,code:marks.join('')};
    cache.set(round,row);
    return row;
  };
  function matchAt(round){
    if(round<8)return false;
    const a=group1(round-3),b=group1(round-2),c=group1(round-1),target=group1(round);
    return b.code[2]==='X'&&c.code[2]==='X'&&
      a.code[0]==='X'&&b.code[1]==='X'&&c.code[2]==='X'&&
      target.lanes[2].length>=2&&target.lanes[3].length>=2;
  }
  const hits=(nums,draw)=>nums.filter(n=>draw.has(n)).length;
  const pNone=k=>{let p=1;for(let i=0;i<6;i++)p*=Math.max(0,45-k-i)/(45-i);return p;};
  function snapshot(round){
    const r=group1(round),selected=r.lanes[2].concat(r.lanes[3]),
      excluded=r.lanes.filter((x,i)=>i!==2&&i!==3).flat();
    if(!r.actual)return null;
    const h3=hits(r.lanes[2],r.actual),h4=hits(r.lanes[3],r.actual);
    return {round,r,selected,excluded,selectedHit:h3+h4,excludedHit:hits(excluded,r.actual),
      hit3:h3,hit4:h4,expectedSelected:selected.length*6/45,expectedExcluded:excluded.length*6/45,
      bothExpected:1-pNone(r.lanes[2].length)-pNone(r.lanes[3].length)+pNone(selected.length)};
  }
  const makeStat=(title,value,description)=>{
    const element=document.createElement('div');element.className='lnvd-stat';
    const small=document.createElement('small');small.textContent=title;
    const b=document.createElement('b');b.textContent=value;
    const p=document.createElement('p');p.textContent=description||'';
    element.append(small,b,p);return element;
  };
  function renderCurrent(){
    if(!currentModel)return;
    const next=currentModel.last+1,ready=matchAt(next);
    const rows=[next-3,next-2,next-1],chart=$('[data-lnvd-chart]');chart.replaceChildren();
    const headings=['회차','1','2','3','4','5','6'];
    for(const v of headings){const el=document.createElement('span');el.className='lnvd-cell label';el.textContent=v;chart.append(el);}
    for(let i=0;i<3;i++){
      const r=group1(rows[i]),label=document.createElement('span');label.className='lnvd-cell label';
      label.textContent=rows[i]+'회';chart.append(label);
      for(let j=0;j<6;j++){
        const value=r.code[j],el=document.createElement('span');
        el.className='lnvd-cell '+(value==='O'?'hit':value==='X'?'miss':value==='?'?'wait':'')+
          ((i===0&&j===0)||(i===1&&j===1)||(i===1&&j===2)||(i===2&&j===2)?' mark':'');
        el.textContent=value;chart.append(el);
      }
    }
    const target=group1(next),label=document.createElement('span');
    label.className='lnvd-cell label';label.textContent=next+'회';chart.append(label);
    for(let j=0;j<6;j++){
      const el=document.createElement('span');el.className='lnvd-cell wait';
      el.textContent=target.lanes[j].length>=2?'?':'·';chart.append(el);
    }
    $('[data-lnvd-current]').textContent=next+'회 · 3열 수직 / 4열 대각 조건 '+(ready?'동시 충족':'미충족');
    const info=$('[data-lnvd-current-numbers]');info.replaceChildren();
    const chosen=target.lanes[2].concat(target.lanes[3]);
    const excluded=target.lanes.filter((_,i)=>i!==2&&i!==3).flat();
    const primary=document.createElement('div');
    primary.textContent='3열 '+(target.lanes[2].join(' · ')||'없음')+
      ' / 4열 '+(target.lanes[3].join(' · ')||'없음')+
      ' · 두 열 선택 후보 '+chosen.length+'수'+
      (ready?' · 현재 대기 조건과 일치':' · 현재 대기 조건은 충족되지 않음');
    const secondary=document.createElement('div');
    secondary.textContent='나머지 열 제외 가설 대상 '+excluded.length+'수: '+(excluded.join(' · ')||'없음')+
      ' (6열에 1수만 있더라도 제외 가설에서 함께 집계)';
    info.append(primary,secondary);
  }
  function showRecord(rec){
    const wrap=document.createElement('details');
    const summary=document.createElement('summary');
    summary.textContent=rec.round+'회 · 3·4열 '+rec.selectedHit+'/'+rec.selected.length+'수 출현 · 나머지 열 제외 실패 '+rec.excludedHit+'수';
    wrap.append(summary);
    wrap.addEventListener('toggle',()=>{
      if(!wrap.open||wrap.dataset.rendered)return;
      wrap.dataset.rendered='1';
      const result=document.createElement('div');result.className='lnvd-result';
      result.textContent='실제 '+rec.round+'회 당첨: '+[...rec.r.actual].sort((a,b)=>a-b).join(' · ')+'번';
      wrap.append(result);
      const lanes=document.createElement('div');lanes.className='lnvd-lines';
      for(let j=0;j<6;j++){
        const item=document.createElement('div');item.className='lnvd-lane'+(j===2||j===3?' focus':'');
        const title=document.createElement('b');
        title.textContent=(j+1)+'열 '+(j===2||j===3?'[선택]':'[제외]')+
          ' · '+rec.r.lanes[j].filter(n=>rec.r.actual.has(n)).length+'/'+rec.r.lanes[j].length+' 적중';
        item.append(title);
        for(const n of rec.r.lanes[j]){
          const ball=document.createElement('span');ball.className='lnvd-ball '+(rec.r.actual.has(n)?'hit':'miss');
          ball.textContent=n+(rec.r.actual.has(n)?' ✓':' ×');item.append(ball);
        }
        if(!rec.r.lanes[j].length){const empty=document.createElement('p');empty.textContent='대상 없음';item.append(empty);}
        lanes.append(item);
      }
      wrap.append(lanes);
      const note=document.createElement('p');
      note.textContent='당시 '+(rec.round-1)+'회까지의 결과만으로 연결번호 계산 · 3/4열 총 '+rec.selectedHit+'수 적중 · 제외한 나머지 열에서 '+rec.excludedHit+'수 실제 출현';
      wrap.append(note);
    });
    return wrap;
  }
  function renderCases(){
    const box=$('[data-lnvd-cases]');
    if(box.children.length>visible)box.replaceChildren();
    const start=box.children.length;
    for(let i=start;i<Math.min(visible,records.length);i++)box.append(showRecord(records[i]));
    const more=$('[data-lnvd-more]');more.hidden=records.length<=visible;
    more.textContent='이전 일치 회차 '+Math.min(12,records.length-visible)+'개 더 보기 ('+Math.min(visible,records.length)+'/'+records.length+')';
  }
  function showStats(){
    const area=$('[data-lnvd-stats]');area.replaceChildren();
    const n=records.length;
    let selN=0,selHit=0,excN=0,excHit=0,expectSel=0,expectExc=0,
        any=0,both=0,bothEx=0,three=0,four=0,excludeRounds=0;
    for(const row of records){
      selN+=row.selected.length;selHit+=row.selectedHit;excN+=row.excluded.length;excHit+=row.excludedHit;
      expectSel+=row.expectedSelected;expectExc+=row.expectedExcluded;any+=+(row.selectedHit>0);
      both+=+(row.hit3>0&&row.hit4>0);bothEx+=row.bothExpected;
      three+=+(row.hit3>0);four+=+(row.hit4>0);
      excludeRounds+=+(row.excludedHit>0);
    }
    area.append(
      makeStat('동일한 X 대기 조건',n+'회','3열 연속 2X + ↘ 대각 3X'),
      makeStat('3·4열 선택 실적',selHit+'/'+selN,'출현율 '+(selN?(100*selHit/selN).toFixed(2):'—')+'%'),
      makeStat('무작위 동일 개수 기대',expectSel.toFixed(1)+'수','기본 확률 6/45 = 13.33%'),
      makeStat('3·4열 중 1개라도 출현',any+'/'+n+'회','두 열을 합쳐 적어도 한 개 출현'),
      makeStat('3·4열 양쪽 모두 출현',both+'/'+n+'회','동시 출현 무작위 기대 약 '+bothEx.toFixed(1)+'회'),
      makeStat('3열 / 4열 출현 회차',three+' / '+four,'각 열에 1수 이상 적중'),
      makeStat('다른 열 실제 당첨 누락',excHit+'수','선택에서 제외한 연결번호 중 실제 출현'),
      makeStat('다른 열 제외 실패',excludeRounds+'/'+n+'회','제외군에서 1수라도 당첨된 회차'),
      makeStat('나머지 열 무작위 기대',expectExc.toFixed(1)+'수','나머지 열 번호 '+excN+'개에 대한 기대')
    );
    const status=$('[data-lnvd-status]');
    status.textContent=n?n+'회 조건 일치 · '+(records[0]?.round||'')+'회까지 복기 · 미출현을 출현으로 바꾸어 예측할 근거는 아직 확인되지 않음':'대기 조건에 맞는 과거 회차가 없습니다.';
  }
  async function compute(){
    if(busy)return;
    const model=window.LNConnectionSchedule?.getModel();
    if(!model?.last||!model.byDraw||!window.LNOverlapAudit)return;
    busy=true;currentModel=model;
    cache.clear();records=[];results=[];visible=12;
    const button=$('[data-lnvd-run]');button.disabled=true;
    const runId=++generation,last=model.last;
    const box=$('[data-lnvd-cases]');box.replaceChildren();
    $('[data-lnvd-stats]').replaceChildren();
    renderCurrent();
    try{
      const found=[];
      for(let t=8;t<=last;t++){
        if(generation!==runId)return;
        if(!currentModel.byDraw[t]||currentModel.byDraw[t].size!==6)continue;
        if(matchAt(t)){const row=snapshot(t);if(row)found.push(row);}
        if(t%16===0){
          $('[data-lnvd-status]').textContent=t+'/'+last+'회 검증 중 · 이전 회차 연결번호 복원';
          await new Promise(resolve=>requestAnimationFrame(resolve));
        }
      }
      if(generation!==runId||window.LNConnectionSchedule?.getModel()?.last!==last){$('[data-lnvd-status]').textContent='새 회차가 로드되어 재실행이 필요합니다.';return;}
      records=found.reverse();
      showStats();renderCases();
    }catch(e){$('[data-lnvd-status]').textContent='검증 오류: '+e.message;}
    finally{busy=false;button.disabled=false;}
  }
  $('[data-lnvd-run]').addEventListener('click',compute);
  $('[data-lnvd-more]').addEventListener('click',()=>{
    const idx=$('[data-lnvd-cases]').children.length;
    visible+=12;renderCases();
    const next=$('[data-lnvd-cases]').children[idx];
    if(next?.scrollIntoView)next.scrollIntoView({behavior:'smooth',block:'start'});
  });
  window.addEventListener('lncs:schedule-ready',()=>{
    if(!busy){currentModel=window.LNConnectionSchedule?.getModel();cache.clear();renderCurrent();compute();}
  });
  currentModel=window.LNConnectionSchedule?.getModel();
  if(currentModel?.last&&window.LNOverlapAudit){renderCurrent();compute();}
})();
