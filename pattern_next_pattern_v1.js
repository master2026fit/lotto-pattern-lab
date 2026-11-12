/* Lotto Note: live next-round six-position pattern reference, not outcome forecast. */
(function installNextPatternPanel(){
  'use strict';
  const matrix=document.querySelector('#ln-connection-schedule-v1 [data-lnmx]');
  if(!matrix||matrix.querySelector('[data-lnnxt]'))return;
  const style=document.createElement('style');
  style.textContent=`
  #ln-connection-schedule-v1 .lnnxt{width:100%;box-sizing:border-box;min-width:0;background:#fffdf5;border:2px solid #d1ac67;border-radius:12px;padding:11px;margin:14px 0;color:#2e4759}
  #ln-connection-schedule-v1 .lnnxt h6{font-size:17px;color:#725015;font-weight:900;margin:0 0 8px}
  #ln-connection-schedule-v1 .lnnxt h6 small{font-size:12px;color:#466078}
  #ln-connection-schedule-v1 .lnnxt h6+p{font-size:12px;line-height:1.6;color:#576e80;margin:4px 0 11px}
  #ln-connection-schedule-v1 .lnnxt h6 ~ p{line-height:1.6}
  #ln-connection-schedule-v1 .lnnxt h6+ .lnnxt-row{margin-top:8px}
  #ln-connection-schedule-v1 .lnnxt h6 ~ .lnnxt-note{font-size:11px;color:#45647a;background:#eaf4fd;padding:8px;border-left:4px solid #85b4d4;border-radius:4px;margin-top:8px}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-row{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:4px;margin:6px 0 11px}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-row button,#ln-connection-schedule-v1 .lnnxt .lnnxt-row span{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:0;min-height:53px;padding:4px 0;box-sizing:border-box;border-radius:8px;border:1px solid #b7c9d7;font-size:20px;font-weight:900;line-height:1.15}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-row .hit{background:#c2f1d8;border-color:#70c197;color:#195a3d}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-row .miss{background:#ffe1e5;border-color:#e19aa6;color:#963341}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-row .none{background:#eef2f5;border-color:#c5d0d8;color:#8695a3}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-row .pending{background:#fff0c8;border:1px solid #d9b56f;color:#825c14;touch-action:manipulation;cursor:pointer}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-row button:focus-visible{outline:3px solid #9c7b30}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-row small{font-size:9px;color:inherit;line-height:1.3;margin-top:3px;overflow-wrap:anywhere;white-space:normal}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-label{font-size:12px;color:#375872;font-weight:850;margin:10px 0 3px}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-label span{font-size:10px;font-weight:600;color:#71869a}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-compare{display:grid;gap:5px;margin:10px 0}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-similar{display:flex;gap:6px;align-items:center;border:1px solid #bcd2e1;background:#fff;border-radius:9px;padding:7px}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-similar .lnnxt-label-col{flex:0 0 74px;color:#315470;font-size:11px;font-weight:800;line-height:1.5}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-similar .lnnxt-mini{flex:1;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:3px}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-mini span{display:flex;min-height:27px;min-width:0;border-radius:5px;align-items:center;justify-content:center;font-weight:900;font-size:12px}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-mini .hit{background:#d1f5e0;color:#23603d}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-mini .miss{background:#ffe4e9;color:#a03d4a}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-mini .none{background:#edf1f5;color:#7f8b98}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-mini .pending{background:#fff0c5;color:#765913}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-evidence{font-size:12px;font-weight:850;line-height:1.7;color:#2f536d;background:#e4f2fa;border-radius:8px;padding:8px;margin:9px 0}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-history{margin:8px 0}
  #ln-connection-schedule-v1 .lnnxt details{background:#fff;border:1px solid #bed3e0;border-radius:9px;padding:7px 8px;margin-top:7px}
  #ln-connection-schedule-v1 .lnnxt summary{font-size:12px;font-weight:800;color:#3c6178;cursor:pointer}
  #ln-connection-schedule-v1 .lnnxt details .lnnxt-similar{margin-top:6px}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-next-stats{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:4px;margin:8px 0}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-next-stats>div{background:#e8f4fc;border:1px solid #bdd4e4;border-radius:7px;min-width:0;padding:7px 1px;text-align:center;font-size:10px;color:#406478;line-height:1.5}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-next-stats b{display:block;font-size:12px;color:#1c506f}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-inline{background:#fff5d8;border:1px solid #d2a960;border-radius:9px;padding:10px;margin:9px 0;scroll-margin-top:16px}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-inline b{color:#694511;font-size:13px}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-inline p{color:#5c4a24;font-size:12px;line-height:1.65;margin:6px 0}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-inline button{border:1px solid #bca579;padding:7px;border-radius:8px;background:#fff;color:#664916;margin-top:6px}
  #ln-connection-schedule-v1 .lnnxt .lnnxt-btn{border:1px solid #b7cddb;border-radius:8px;background:#e9f5fc;color:#2a4a64;font-weight:850;font-size:12px;min-height:40px;padding:8px 10px;margin-top:8px}
  @media(max-width:700px){
    #ln-connection-schedule-v1 .lnnxt{padding:8px}
    #ln-connection-schedule-v1 .lnnxt .lnnxt-row{gap:3px}
    #ln-connection-schedule-v1 .lnnxt .lnnxt-row button,#ln-connection-schedule-v1 .lnnxt .lnnxt-row span{min-height:49px}
    #ln-connection-schedule-v1 .lnnxt .lnnxt-similar .lnnxt-label-col{flex-basis:66px;font-size:10px}
    #ln-connection-schedule-v1 .lnnxt .lnnxt-mini{gap:2px}
  }`;
  matrix.append(style);
  const section=document.createElement('section');section.className='lnnxt';section.dataset.lnnxt='1';
  section.innerHTML=`
   <h6 data-lnnxt-heading>🔎 다음 회차 유사 그림 찾기</h6>
   <p>직전 회차의 O/X 그림과 <b>과거에 같거나 비슷했던 그림</b>을 찾아, 그 다음 회차의 실제 변화를 비교합니다. 이번 회차의 O/X는 아직 미정입니다.</p>
   <div class="lnnxt-label" data-lnnxt-previous-label>직전 회차의 실제 그림</div>
   <div class="lnnxt-row" data-lnnxt-previous></div>
   <div class="lnnxt-label" data-lnnxt-next-label>다음 회차의 연결 위치 · 아직 O/X 미정</div>
   <div class="lnnxt-row" data-lnnxt-future></div>
   <div data-lnnxt-inline></div>
   <div class="lnnxt-label">최근 5회 실제 그림 → 다음 회차</div>
   <div class="lnnxt-compare" data-lnnxt-recent></div>
   <div data-lnnxt-match class="lnnxt-evidence">과거 동일 그림을 검색 중…</div>
   <div class="lnnxt-label">과거 유사 그림의 다음 회차 출현 빈도</div>
   <div class="lnnxt-next-stats" data-lnnxt-stats></div>
   <p class="lnnxt-note" data-lnnxt-baseline></p>
   <details data-lnnxt-examples><summary>과거에 일치한 회차와 바로 다음 그림 보기</summary><div data-lnnxt-examples-body></div></details>
   <div class="lnnxt-note">노란색 ?는 <b>추첨 전 미확정</b>입니다. 과거 다음 회차의 출현 비율은 참고용 기록이지 1250회 당첨 확률이나 제외수 판정이 아닙니다. 번호군의 한 열에 번호가 2개면 무작위로도 74.85%가 전부 미출현하며, 3개면 64.40%가 전부 미출현합니다. 조건별로 표본 수가 다르며 사후에 찾은 비슷한 그림에는 우연의 효과가 큽니다.</div>`;
  const desc=matrix.querySelector('h5 + p');
  if(desc)desc.after(section);else matrix.prepend(section);
  const $=q=>section.querySelector(q);
  const matrixSelect=q=>matrix.querySelector(q);
  const cache=new Map();
  let model=null,token=0,latest=0,currentTier='1',currentDirection='V',candidate=[],analogStats=[],analogExamples=[];
  const codes={hit:'O',miss:'X',none:'·',pending:'?'};
  const codeStatus=code=>code==='O'?'hit':code==='X'?'miss':code==='?'?'pending':'none';
  const numbersFor=(round,tier)=>{
    let grouped=cache.get(round);
    if(!grouped){
      grouped=Object.fromEntries(['1','2','3','4','5','6'].map(t=>[t,[]]));
      const counts=window.LNOverlapAudit?.countConnections(round,model.byDraw);
      if(!counts)return grouped[tier];
      for(let n=1;n<=45;n++)if(counts[n]>0)grouped[counts[n]>=6?'6':String(counts[n])].push(n);
      cache.set(round,grouped);
    }
    return grouped[tier]||[];
  };
  // Match the standalone matrix's six-column geometry exactly.
  const pathFor=(nums,kind,slot)=>{
    const point=(r,c)=>r>=0&&c>=0&&c<6?nums[r*6+c]:undefined;
    const out=[],rows=Math.ceil(nums.length/6);
    if(kind==='V')for(let r=0;r<rows;r++)out.push(point(r,slot));
    else if(kind==='H')for(let c=0;c<6;c++)out.push(point(slot,c));
    else if(kind==='D')for(let r=0;r<rows;r++)out.push(point(r,slot+r));
    else if(kind==='A')for(let r=0;r<rows;r++)out.push(point(r,slot-r));
    return out.filter(Number.isInteger);
  };
  const dataFor=round=>{
    const nums=numbersFor(round,currentTier),winning=model.byDraw[round];
    const lines=Array.from({length:6},(_,slot)=>pathFor(nums,currentDirection,slot));
    const states=lines.map(line=>line.length<2?'·':winning instanceof Set&&winning.size===6?(line.some(n=>winning.has(n))?'O':'X'):'?');
    return {round,nums,lines,code:states.join(''),states};
  };
  const baseline=n=>{
    if(n<2)return null;
    let p=1;for(let i=0;i<6;i++)p*=(45-n-i)/(45-i);
    return 1-p;
  };
  const compact=(code)=>{const outer=document.createElement('div');outer.className='lnnxt-mini';
    for(const ch of code){const cell=document.createElement('span');cell.className=codeStatus(ch);cell.textContent=ch;outer.append(cell);}return outer;
  };
  const comparison=(name,code)=>{const row=document.createElement('div');row.className='lnnxt-similar';
    const label=document.createElement('div');label.className='lnnxt-label-col';label.textContent=name;
    row.append(label,compact(code));return row;
  };
  const makeRow=(box,states,smallLabels,click)=>{
    box.replaceChildren();
    for(let i=0;i<6;i++){
      const element=click?document.createElement('button'):document.createElement('span');
      element.className=codeStatus(states[i]||'·');
      const symbol=document.createElement('span');symbol.textContent=states[i]||'·';
      const small=document.createElement('small');small.textContent=smallLabels?.[i]||'';
      element.append(symbol,small);
      if(click){element.type='button';element.addEventListener('click',()=>click(i));}
      box.append(element);
    }
  };
  const describeLine=i=>currentDirection==='V'?`${i+1}열`:currentDirection==='H'?`${i+1}줄`:`${currentDirection==='D'?'↘':'↙'} ${i+1}칸`;
  function inlineDetail(i,target){
    const box=$('[data-lnnxt-inline]');box.replaceChildren();
    const line=candidate[i];
    const wrap=document.createElement('div');wrap.className='lnnxt-inline';
    const h=document.createElement('b');h.textContent=target+'회 '+describeLine(i)+' · 추첨 전 관찰 대상';
    const p=document.createElement('p');p.textContent=line.length>=2?'연결 번호 '+line.join(' · ')+'번 · 무작위에서 한 수 이상 출현할 비율 약 '+(baseline(line.length)*100).toFixed(1)+'%':'연결 번호가 2수 미만이므로 이 위치는 아직 O/X 라인으로 볼 수 없습니다.';
    const note=document.createElement('p');note.textContent='위 번호는 위치 확인용이며 추천·제외 번호가 아닙니다.';
    const close=document.createElement('button');close.type='button';close.textContent='✕ 접기';
    close.addEventListener('click',()=>box.replaceChildren());
    wrap.append(h,p,note,close);box.append(wrap);
    wrap.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function renderInitial(){
    model=window.LNConnectionSchedule?.getModel();
    if(!model?.last||!model.byDraw||!window.LNOverlapAudit)return;
    const latestNow=model.last;
    latest=latestNow;
    currentTier=matrixSelect('[data-lnmx-tier]')?.value||'1';
    currentDirection=matrixSelect('[data-lnmx-kind]')?.value||'V';
    const past=dataFor(latest),future=dataFor(latest+1);
    candidate=future.lines;
    $('[data-lnnxt-heading]').textContent='🔎 '+(latest+1)+'회 · 과거 동일 그림과 다음 흐름';
    $('[data-lnnxt-previous-label]').textContent=latest+'회 실제 그림 · '+currentTier+'건'+(currentTier==='6'?'+':'')+' / '+({V:'세로',H:'가로',D:'↘ 대각',A:'↙ 대각'}[currentDirection]||'세로');
    $('[data-lnnxt-next-label]').textContent=(latest+1)+'회 미확정 · 각 칸을 누르면 해당 번호를 볼 수 있습니다';
    makeRow($('[data-lnnxt-previous]'),past.states,Array.from({length:6},(_,i)=>describeLine(i)));
    makeRow($('[data-lnnxt-future]'),future.states,future.lines.map(n=>n.length>=2?n.length+'수':'없음'),i=>inlineDetail(i,latest+1));
    $('[data-lnnxt-inline]').replaceChildren();
    const recents=$('[data-lnnxt-recent]');recents.replaceChildren();
    for(let r=Math.max(5,latest-4);r<=latest;r++)recents.append(comparison(r+'회',dataFor(r).code));
    recents.append(comparison((latest+1)+'회',future.code));
    $('[data-lnnxt-match]').textContent='과거 동일·유사 그림 검색 중…';
    $('[data-lnnxt-stats]').replaceChildren();
    $('[data-lnnxt-baseline]').textContent='';
    $('[data-lnnxt-examples-body]').replaceChildren();
    return past.code;
  }
  async function compute(){
    const key=++token;
    const previous=renderInitial();
    if(!previous)return;
    const max=latest,exact=[],close=[];
    // Historical references end before the current last draw.
    // Their *next* draw is therefore already observable.
    for(let r=5;r<max;r++){
      if(key!==token)return;
      const prev=dataFor(r);
      let diffs=0;
      for(let j=0;j<6;j++)if(prev.code[j]!==previous[j])diffs++;
      if(diffs<=1){
        const example={r,prev:prev.code,next:dataFor(r+1).code};
        if(diffs===0)exact.push(example);else close.push(example);
      }
      if(r%18===0)await new Promise(resolve=>requestAnimationFrame(resolve));
    }
    if(key!==token)return;
    const selected=exact.length>=8?exact:exact.concat(close);
    analogExamples=selected;
    const rule=exact.length>=8?'완전 동일 그림':'동일 + 6칸 중 5칸 일치';
    $('[data-lnnxt-match]').textContent='직전 '+latest+'회 그림 '+previous+' · 과거 동일 '+exact.length+'회 / 한 칸 차이 '+close.length+'회 · 다음 회차 비교는 '+selected.length+'개 사례 ('+rule+')';
    analogStats=Array.from({length:6},(_,j)=>{
      const observed=selected.map(v=>v.next[j]).filter(v=>v!=='·');
      const found=observed.filter(v=>v==='O').length;
      return {n:observed.length,o:found,p:observed.length?100*found/observed.length:null,baseline:baseline(candidate[j].length)};
    });
    const stats=$('[data-lnnxt-stats]');stats.replaceChildren();
    for(let j=0;j<6;j++){
      const div=document.createElement('div'),label=document.createElement('span');
      label.textContent=String(j+1);
      const num=document.createElement('b'),a=analogStats[j];
      num.textContent=a.n?a.o+'/'+a.n:'—';
      const small=document.createElement('small');small.textContent=a.n?'O '+a.p.toFixed(0)+'%':'표본 없음';
      div.append(label,num,small);stats.append(div);
    }
    const examples=$('[data-lnnxt-examples-body]');examples.replaceChildren();
    const sorted=selected.slice(-8).reverse();
    for(const row of sorted){
      examples.append(comparison(row.r+'회',row.prev));
      examples.append(comparison((row.r+1)+'회',row.next));
    }
    if(!selected.length){const empty=document.createElement('p');empty.textContent='비교할 만큼 유사한 과거 그림이 없습니다.';examples.append(empty);}
    $('[data-lnnxt-baseline]').textContent='위 숫자는 과거 동일·유사 그림의 다음 회차 출현 수/관찰 수입니다. 현재 '+(latest+1)+'회 각 칸의 무작위 출현 기준은 '+
      candidate.map((line,i)=>(i+1)+'칸 '+(baseline(line.length)===null?'해당 없음':(baseline(line.length)*100).toFixed(1)+'%')).join(' · ')+
      '이며, 실제 결과는 추첨 전까지 물음표(?)입니다.';
  }
  let previousModel=null;
  function update(){
    const next=window.LNConnectionSchedule?.getModel();
    if(!next?.last||!window.LNOverlapAudit)return;
    if(next!==previousModel){cache.clear();previousModel=next;}
    compute();
  }
  for(const selector of ['[data-lnmx-tier]','[data-lnmx-kind]'])matrixSelect(selector)?.addEventListener('change',update);
  window.addEventListener('lncs:schedule-ready',update);
  window.addEventListener('lnco:ready',update);
  update();
})();
