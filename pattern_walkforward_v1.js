/* LOTTO NOTE · historical walk-forward evidence and six-slot position maps.
   Every test target uses draw numbers strictly earlier than that target. */
(function(){
  'use strict';
  const ROOT='#ln-connection-schedule-v1';
  const root=document.querySelector(ROOT),main=root&&root.querySelector('[data-lncs-main]');
  if(!main||main.querySelector('[data-lnwf-panel]'))return;
  const css=document.createElement('style');
  css.textContent=[
    ROOT+' .lnwf{margin:18px 0;padding:15px;border:2px solid #85bda6;border-radius:14px;background:#102c3e;color:#edf7ff}',
    ROOT+' .lnwf h5{font-size:19px;color:#b9f4d2;margin:0 0 7px}',
    ROOT+' .lnwf h6{font-size:15px;color:#ffe1a5;margin:15px 0 7px}',
    ROOT+' .lnwf p{font-size:12px;line-height:1.65;color:#c9ddeb;margin:6px 0}',
    ROOT+' .lnwf-status{border:1px solid #547d86;border-radius:8px;padding:9px;color:#ffe2ae;font-weight:800;font-size:13px;margin:10px 0}',
    ROOT+' .lnwf-options{display:flex;gap:9px;flex-wrap:wrap;margin:11px 0}',
    ROOT+' .lnwf-options label{color:#e3f2fc;font-size:12px;display:flex;gap:5px;align-items:center}',
    ROOT+' .lnwf-options select{background:#e9f6ff;color:#17334d;padding:8px;border:1px solid #a7d5e6;border-radius:8px;font-size:13px;font-weight:800}',
    ROOT+' .lnwf-chips{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}',
    ROOT+' .lnwf-chip{background:#1e4258;border:1px solid #5a8192;border-radius:9px;padding:10px;line-height:1.45}',
    ROOT+' .lnwf-chip strong{display:block;color:#ffe0a8;font-size:18px;font-variant-numeric:tabular-nums}',
    ROOT+' .lnwf-chip small{color:#cae4ee;font-size:11px}',
    ROOT+' .lnwf-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}',
    ROOT+' .lnwf table{width:100%;border-collapse:collapse;font-size:12px;min-width:470px}',
    ROOT+' .lnwf th{text-align:left;background:#254e65;color:#e9f7ff;padding:9px 6px}',
    ROOT+' .lnwf td{padding:9px 6px;border-bottom:1px solid #40667c;vertical-align:middle}',
    ROOT+' .lnwf td strong{color:#ffe6b4}',
    ROOT+' .lnwf button{background:#2d6177;color:#e7ffec;border:1px solid #84bcae;padding:8px 10px;border-radius:8px;font-size:12px;font-weight:850;cursor:pointer}',
    ROOT+' .lnwf button:disabled{opacity:.5;cursor:default}',
    ROOT+' .lnwf-example-actions{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}',
    ROOT+' .lnwf-example{margin:8px 0}',
    ROOT+' .lnwf-note{border-left:3px solid #d2af6e;padding:7px 10px;background:#19384f}',
    ROOT+' .lnpg-card{margin:12px 0;background:#082239;border:1px solid #78a1b3;border-radius:11px;padding:10px;color:#f0f8ff}',
    ROOT+' .lnpg-heading{font-size:14px;font-weight:900;color:#ffe0a1;margin:1px 0 7px}',
    ROOT+' .lnpg-description{font-size:11px;color:#b4d6e8;margin:3px 0 8px}',
    ROOT+' .lnpg-grid{display:grid;grid-template-columns:minmax(50px,1.12fr) repeat(6,minmax(0,1fr));gap:3px}',
    ROOT+' .lnpg-cell{min-width:0;min-height:39px;display:flex;align-items:center;justify-content:center;border:1px solid #385c74;border-radius:6px;background:#173950;font-size:13px;font-weight:700;color:#cbe3ef;font-variant-numeric:tabular-nums}',
    ROOT+' .lnpg-head{min-height:27px;background:#315c76;color:#f4faff;font-weight:900;font-size:11px}',
    ROOT+' .lnpg-round{flex-direction:column;font-size:11px;color:#ffe3ab;font-weight:850}',
    ROOT+' .lnpg-round small{font-size:9px;color:#aecddc;font-weight:600}',
    ROOT+' .lnpg-path{background:#237d68;color:#fffdf0;border:2px solid #a9ffcf;font-size:15px;font-weight:950}',
    ROOT+' .lnpg-win{background:#3b9365;border-color:#f8df86}',
    ROOT+' .lnpg-unknown{background:#1e4256;color:#6c97a6}',
    ROOT+' .lnpg-failed{background:#613f4b;border-color:#f0a5ad}',
    ROOT+' .lnpg-target-candidate{background:#b63545;color:#fffdf2;border:2px solid #ffcb80;font-size:15px;font-weight:950}',
    ROOT+' .lnpg-target-empty{background:#153349;color:#557588;border:1px dashed #35556b}',
    ROOT+' .lnpg-trail{margin:8px 0 0;padding:7px;border-radius:7px;background:#194052;color:#daf6e6;font-size:11px;line-height:1.6;overflow-wrap:anywhere}',
    ROOT+' .lnwf-move-controls{display:flex;flex-wrap:wrap;gap:9px;align-items:end;margin:10px 0}',
    ROOT+' .lnwf-move-controls label{display:flex;flex-direction:column;gap:4px;font-size:12px;color:#d8ecf8}',
    ROOT+' .lnwf-move-controls input,'+ROOT+' .lnwf-move-controls select{max-width:220px;min-height:36px;background:#eaf8ff;color:#18364b;border:1px solid #8ebdd0;border-radius:7px;padding:7px;font-size:13px;font-weight:800}',
    ROOT+' .lnwf-move-list{display:grid;grid-template-columns:1fr;gap:8px;margin:9px 0}',
    ROOT+' .lnwf-move-card{border:1px solid #5b879e;border-radius:10px;background:#1a3c53;padding:11px}',
    ROOT+' .lnwf-move-card strong{font-size:16px;color:#ffe1a1;letter-spacing:.2px}',
    ROOT+' .lnwf-move-card p{color:#cfdfed;margin:5px 0;font-size:12px}',
    ROOT+' .lnwf-move-card .lnwf-move-info{display:flex;flex-wrap:wrap;gap:5px 12px;margin:8px 0}',
    ROOT+' .lnwf-move-card .lnwf-move-info span{font-size:11px;color:#cbe7e9}',
    ROOT+' .lnwf-move-actions{display:flex;flex-wrap:wrap;gap:6px}',
    ROOT+' .lnwf-move-actions button{min-height:33px}',
    ROOT+' .lnwf-move-alert{color:#ffc2a3;font-size:11px;font-weight:700}',
    '@media(min-width:860px){'+ROOT+' .lnwf-move-list{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    ROOT+' .lnpg-intro-button{display:block;max-width:320px;width:100%;margin:6px 0 12px;border:1px solid #83bfb0;background:#1d5261;color:#e0ffef;border-radius:8px;padding:9px;font-weight:850;cursor:pointer}',
    '@media(max-width:550px){'+ROOT+' .lnwf{padding:10px}'+ROOT+' .lnpg-card{padding:7px}'+ROOT+' .lnpg-grid{gap:2px;grid-template-columns:minmax(43px,1.02fr) repeat(6,minmax(0,1fr))}'+ROOT+' .lnpg-cell{min-height:36px;font-size:12px}'+ROOT+' .lnpg-head{font-size:10px;min-height:25px}'+ROOT+' .lnpg-path{font-size:13px}'+ROOT+' .lnpg-round{font-size:10px}'+ROOT+' .lnwf-chip strong{font-size:16px}}'
  ].join('\n');
  root.append(css);

  const byClass=(tag,name,content)=>{
    const el=document.createElement(tag);el.className=name;
    if(content!==undefined)el.textContent=String(content);
    return el;
  };
  const percent=(hit,total)=>total?(100*hit/total).toFixed(2)+'%':'—';
  const number=(value)=>Number(value||0).toLocaleString('ko-KR');
  const drawDate=(round)=>{
    const d=new Date(Date.UTC(2026,9,10)+(Number(round)-1245)*604800000);
    return d.getUTCFullYear()+'.'+String(d.getUTCMonth()+1).padStart(2,'0')+'.'+String(d.getUTCDate()).padStart(2,'0');
  };
  const drawAt=(draws,round)=>{
    const indexed=draws[round-1];
    return indexed&&Number(indexed.draw_no)===round?indexed:null;
  };
  const combination=(n,k)=>{
    if(k<0||k>n)return 0;
    let result=1;
    for(let i=1;i<=k;i++)result=result*(n-i+1)/i;
    return result;
  };
  // For a number that is drawn, calculate which ordered slot (1~6구) it can occupy.
  // The smallest contiguous interval covering at least 80% of that conditional
  // distribution gives 5 => 1~2구, 19 => 2~4구, 39 => 5~6구.
  function likelySlots(num){
    if(!Number.isInteger(num)||num<1||num>45)return [];
    const denom=combination(44,5);
    const probabilities=Array.from({length:6},(_,i)=>combination(num-1,i)*combination(45-num,5-i)/denom);
    let best=null;
    for(let width=1;width<=6; width++){
      for(let from=0;from+width<=6;from++){
        const coverage=probabilities.slice(from,from+width).reduce((sum,p)=>sum+p,0);
        if(coverage<.8-1e-10)continue;
        if(!best||width<best.width||(width===best.width&&coverage>best.coverage))best={from,width,coverage};
      }
      if(best)break;
    }
    return best?Array.from({length:best.width},(_,i)=>best.from+i+1):[];
  }
  function createPositionGrid(path,draws){
    const wrap=byClass('section','lnpg-card');
    const source=path.target-path.gap,sourceNo=path.next-path.shift;
    wrap.append(byClass('div','lnpg-heading','📐 1~6구 자리별 연결 · '+source+'회 '+sourceNo+'번 → '+path.target+'회 '+path.next+'번'));
    wrap.append(byClass('div','lnpg-description','가로: 당첨번호 오름차순 1~6구 · 초록: 과거 실제 자리 · 빨간 물음표: 목표번호의 예상 자리'));
    const grid=byClass('div','lnpg-grid'),trail=[];
    grid.append(byClass('div','lnpg-cell lnpg-head','회차'));
    for(let slot=1;slot<=6;slot++)grid.append(byClass('div','lnpg-cell lnpg-head',slot+'구'));
    const shown=Math.min(4,Math.max(1,Number(path.count)||4));
    for(let k=shown;k>=0;k--){
      const round=Number(path.target)-k*Number(path.gap);
      const predicted=Number(path.next)-k*Number(path.shift);
      const draw=drawAt(draws,round),isTarget=k===0;
      const actualNumbers=draw?draw.numbers.map(Number).sort((a,b)=>a-b):[];
      const present=actualNumbers.includes(predicted);
      const label=byClass('div','lnpg-cell lnpg-round',round+'회');
      const tiny=byClass('small','',!isTarget?'실제':draw?(present?'✓ 적중':'× 미출현'):'예상');
      label.append(tiny);grid.append(label);
      if(draw){
        const position=actualNumbers.indexOf(predicted);
        if(!isTarget)trail.push(round+'회 '+predicted+'번 '+(position+1)+'구');
        for(let i=0;i<6;i++){
          const highlighted=i===position;
          const type=highlighted?(isTarget?'lnpg-win lnpg-path':'lnpg-path'):'';
          grid.append(byClass('div','lnpg-cell '+type,actualNumbers[i]));
        }
      }else if(isTarget){
        // The user sees the target number in its likely *positions*, not as a wide banner.
        // These are conditional positions IF drawn, not a claim it will appear.
        const marked=new Set(likelySlots(predicted));
        for(let slot=1;slot<=6;slot++){
          const candidate=byClass('div',marked.has(slot)?'lnpg-cell lnpg-target-candidate':'lnpg-cell lnpg-target-empty',marked.has(slot)?predicted+'?':'·');
          candidate.title=marked.has(slot)?'당첨될 경우 '+slot+'구에 놓일 수 있는 예상 위치':'예상 범위 외';
          grid.append(candidate);
        }
      }else{
        for(let i=0;i<6;i++)grid.append(byClass('div','lnpg-cell lnpg-unknown','—'));
      }
    }
    wrap.append(grid);
    const targetDraw=drawAt(draws,path.target);
    const outcome=!targetDraw?'⏳ '+path.target+'회 '+path.next+'번 · 당첨될 경우 주된 자리 '+likelySlots(path.next).join('·')+'구 (80% 포함 구간) · 출현 여부는 별도':
      targetDraw.numbers.map(Number).includes(path.next)?'✓ '+path.target+'회 '+path.next+'번 실제 당첨 및 자리 확인':
      '× '+path.target+'회 '+path.next+'번 미출현 (제외수 증명 아님)';
    wrap.append(byClass('div','lnpg-trail',trail.join(' → ')+'  |  '+outcome));
    return wrap;
  }
  window.LNPositionGrid={create:createPositionGrid,likelySlots};
  function parseSource(row){
    const heading=row.querySelector(':scope > b')?.textContent||'';
    const detail=row.querySelector(':scope > div')?.textContent||'';
    const a=heading.match(/(\d+)회\s+(\d+)번\s+성공\s*→\s*(\d+)회\s+(\d+)번\s+대상/);
    const b=detail.match(/간격\s*\+(\d+)회\s*·\s*번호 이동\s*([+-]?\d+)\s*·\s*(\d+)→/);
    if(!a||!b)return null;
    return {target:+a[3],next:+a[4],gap:+b[1],shift:+b[2],count:+b[3]};
  }
  function enhanceVisuals(){
    if(typeof state==='undefined'||!state.draws?.length)return;
    for(const visual of root.querySelectorAll('.lncs-visual:not([data-lnpg-added])')){
      visual.dataset.lnpgAdded='1';
      const path=parseSource(visual.closest('.lncs-source-entry'));
      if(!path)continue;
      const anchor=visual.querySelector('.lncs-visual-scroll');
      if(anchor)anchor.before(createPositionGrid(path,state.draws));
    }
  }
  new MutationObserver(enhanceVisuals).observe(root,{childList:true,subtree:true});

  const panel=byClass('section','lnwf');panel.dataset.lnwfPanel='1';
  panel.innerHTML='<h5>🧪 연결 패턴 과거 전수검증 · 실전 성적</h5>'+
    '<p>1회부터 최신 확정 회차까지 <b>매 회차 이전 당첨번호만</b> 사용해 패턴을 만들고, 그 회차 본당첨 6개와 비교합니다. 최근 200회는 따로 표시합니다.</p>'+
    '<div class="lnwf-status" data-lnwf-status>과거 패턴 검사 준비 중…</div>'+
    '<div class="lnwf-options"><label>연결 연속성 <select data-lnwf-min><option value="4">4점 이상</option><option value="5">5점 이상</option><option value="6">6점 이상</option></select></label>'+
    '<label>연결 종류 <select data-lnwf-family><option value="all">전체</option><option value="fixed">F 정간격</option><option value="diagonal">대각선·사선</option></select></label></div>'+
    '<div class="lnwf-chips" data-lnwf-chips></div>'+
    '<p class="lnwf-note">한 숫자의 무작위 본당첨 기준은 6/45 = <b>13.33%</b>입니다. 여러 패턴이 같은 번호를 가리키면 중복 집계되므로, 패턴 건수만으로 확률 향상이나 유의성을 주장할 수 없습니다.</p>'+
    '<h6>회차간격별 실제 기록</h6><p>많이 관찰된 간격 순서입니다. 적중률이 높은 순위나 추천 순위가 아닙니다.</p>'+
    '<div class="lnwf-scroll"><table><thead><tr><th>간격</th><th>이전 검증</th><th>최근 200회</th><th>기준 차이</th><th>자리 그림</th></tr></thead><tbody data-lnwf-gap-body></tbody></table></div>'+
    '<button type="button" data-lnwf-more hidden>회차간격 더 보기</button>'+
    '<h6>성공·실패 실제 사례와 1~6구 자리</h6>'+
    '<div class="lnwf-example-actions"><button type="button" data-lnwf-success>✓ 성공한 연결 그림</button><button type="button" data-lnwf-failure>× 실패한 연결 그림</button></div>'+
    '<div class="lnwf-example" data-lnwf-example></div>'+
    '<h6>🧭 1~6구 자리 이동 4단계 · 실제 다음 결과</h6>'+
    '<p>연결이 성공한 <b>직전 4개 회차의 실제 자리 순서</b>를 모았습니다. 이어지는 회차의 번호 출현과 실제 다음 자리를 별도 기록합니다. 우연에 의한 반복을 예측 신호로 확정하지 않습니다.</p>'+
    '<div class="lnwf-move-controls"><label>자리 이동 검색 (예: 6-4-3-1)<input data-lnwf-move-search placeholder="6-4-3-1" inputmode="numeric" autocomplete="off"></label>'+
    '<label>최소 과거 관찰<select data-lnwf-move-min><option value="30">30건 이상</option><option value="10">10건 이상</option><option value="0">전체 (소표본 포함)</option></select></label></div>'+
    '<div class="lnwf-status" data-lnwf-move-status>자리 이동 흐름 계산 준비 중…</div>'+
    '<div class="lnwf-move-list" data-lnwf-move-list></div>'+
    '<button type="button" data-lnwf-move-more hidden>자리 이동 더 보기</button>'+
    '<div class="lnwf-example" data-lnwf-move-example></div>'+
    '<p class="lnwf-note">⚠️ 단순 과거 적중률이 낮다고 자동 제외수로 확정할 수 없습니다. 제외 후 남은 번호의 실제 미래 성적까지 별도로 검증해야 하므로 자동 제외 기능은 적용하지 않습니다.</p>';
  const master=main.querySelector('[data-lncm-master]');
  if(master)master.after(panel);else main.prepend(panel);
  const pick=sel=>panel.querySelector(sel);
  if(master){
    const shortcut=byClass('button','lnpg-intro-button','🧪 과거 전수검증 성적표 보기 ↓');
    shortcut.type='button';shortcut.addEventListener('click',()=>panel.scrollIntoView({behavior:'smooth',block:'start'}));
    const title=master.querySelector('h5');if(title)title.after(shortcut);
  }
  const modes=['all','fixed','diagonal'],mins=[4,5,6];
  const key=(mode,min)=>mode+'|'+min;
  const zero=()=>({paths:0,hits:0,candidates:0,candidateHits:0,rounds:0});
  const makeResult=()=>({training:zero(),recent:zero(),success:null,failure:null});
  let result=null,latestBuilt=0,running=false,rerun=false,visibleGaps=15;
  function get(store,k){
    if(!store.has(k))store.set(k,makeResult());
    return store.get(k);
  }
  function recordSample(row,path,hit){
    const entry={target:path.target,next:path.next,gap:path.gap,shift:path.shift,count:path.count};
    if(hit)row.success=entry;else row.failure=entry;
  }
  const newMove=()=>({
    training:{paths:0,hits:0,slots:[0,0,0,0,0,0]},
    recent:{paths:0,hits:0,slots:[0,0,0,0,0,0]},
    success:null,failure:null
  });
  function getMove(map,name){
    if(!map.has(name))map.set(name,newMove());
    return map.get(name);
  }
  function slotFlow(path,draws){
    if(!path.steps||path.steps.length<4)return null;
    const slots=path.steps.slice(-4).map(step=>{
      const row=drawAt(draws,step.round);
      return row?row.numbers.indexOf(step.num)+1:0;
    });
    return slots.every(n=>n>=1&&n<=6)?slots.join('-'):null;
  }
  function futureRoutes(model,draws){
    const pending=new Map();
    for(const [target,paths] of model.due){
      for(const p of paths){
        const flow=slotFlow(p,draws);if(!flow)continue;
        const family=p.shift===0?'fixed':'diagonal';
        for(const mode of ['all',family])for(const min of mins){
          if(p.count<min)continue;
          const name=key(mode,min)+'|'+flow;
          let entry=pending.get(name);
          if(!entry){entry={count:0,first:null};pending.set(name,entry);}
          entry.count++;
          if(!entry.first||target<entry.first.target)entry.first={target:p.target,next:p.next,gap:p.gap,shift:p.shift,count:p.count};
        }
      }
    }
    return pending;
  }
  async function calculate(model,last){
    const all=new Map(),gaps=new Map(),moves=new Map(),byDraw=model.byDraw;
    const threshold=last-200;
    let count=0;
    for(let target=5;target<=last;target++){
      const period=target>threshold?'recent':'training';
      const actual=byDraw[target]||new Set();
      const seen=new Map(),paths=window.LNConnectionSchedule.buildPaths(target,byDraw);
      for(const p of paths){
        const hit=actual.has(p.next),family=p.shift===0?'fixed':'diagonal';
        const flow=slotFlow(p,state.draws);
        const actualSlot=hit?drawAt(state.draws,target)?.numbers.indexOf(p.next)+1:0;
        for(const mode of ['all',family])for(const min of mins){
          if(p.count<min)continue;
          const k=key(mode,min),group=get(all,k),byGap=get(gaps,k+'|'+p.gap);
          group[period].paths++;if(hit)group[period].hits++;
          byGap[period].paths++;if(hit)byGap[period].hits++;
          recordSample(group,p,hit);recordSample(byGap,p,hit);
          if(flow){
            const move=getMove(moves,k+'|'+flow),part=move[period];
            part.paths++;if(hit){part.hits++;if(actualSlot>=1&&actualSlot<=6)part.slots[actualSlot-1]++;}
            recordSample(move,p,hit);
          }
          if(!seen.has(k))seen.set(k,new Set());seen.get(k).add(p.next);
        }
      }
      for(const [k,nums] of seen){
        const stats=get(all,k)[period];stats.rounds++;
        stats.candidates+=nums.size;
        for(const n of nums)if(actual.has(n))stats.candidateHits++;
      }
      count++;
      if(target%12===0||target===last){
        if(target%48===0||target===last)pick('[data-lnwf-status]').textContent='과거 사전시점 재현 '+target+' / '+last+'회 검증 중…';
        await new Promise(resolve=>setTimeout(resolve,0));
      }
    }
    return {all,gaps,moves,pending:futureRoutes(model,state.draws),last,checked:count,holdoutStart:threshold+1};
  }
  function showExample(path){
    const zone=pick('[data-lnwf-example]');zone.textContent='';
    if(!path){zone.append(byClass('p','', '해당 조건에는 아직 표시할 사례가 없습니다.'));return;}
    zone.append(createPositionGrid(path,state.draws));
    zone.scrollIntoView({behavior:'smooth',block:'center'});
  }
  let visibleMoves=12;
  function moveExample(path,label){
    const area=pick('[data-lnwf-move-example]');area.textContent='';
    if(!path){area.append(byClass('p','', '이 조건에는 표시할 사례가 없습니다.'));return;}
    const back=byClass('button','','↩ 자리 이동 목록으로 돌아가기');
    back.type='button';back.addEventListener('click',()=>pick('[data-lnwf-move-list]').scrollIntoView({behavior:'smooth',block:'start'}));
    area.append(byClass('div','lnpg-description',label),back,createPositionGrid(path,state.draws));
    area.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function renderMoves(){
    if(!result)return;
    const mode=pick('[data-lnwf-family]').value,min=Number(pick('[data-lnwf-min]').value),k=key(mode,min);
    const search=pick('[data-lnwf-move-search]').value,term=(search.match(/[1-6]/g)||[]).join('-');
    const minCases=term?0:Number(pick('[data-lnwf-move-min]').value);
    const list=pick('[data-lnwf-move-list]');list.textContent='';
    const matching=[...result.moves].filter(([name])=>name.startsWith(k+'|'))
      .map(([name,item])=>({flow:name.slice(k.length+1),item,
        total:item.training.paths+item.recent.paths}))
      .filter(x=>x.total>=minCases&&(!term||x.flow.includes(term)))
      .sort((a,b)=>b.total-a.total||a.flow.localeCompare(b.flow));
    const reference=result.moves.get(k+'|6-4-3-1');
    const refTotal=(reference?.training.paths||0)+(reference?.recent.paths||0);
    const refHits=(reference?.training.hits||0)+(reference?.recent.hits||0);
    pick('[data-lnwf-move-status]').textContent=
      '검증된 4자리 흐름 '+matching.length+'종 표시'+(term?' · 검색 '+term+' (건수 제한 해제)':' · '+minCases+'건 이상')+
      ' | 예시 6→4→3→1: '+number(refTotal)+'건 중 '+number(refHits)+'건 적중 ('+percent(refHits,refTotal)+')'+
      (refTotal<30?' · 표본이 적어 판단 보류':'');
    for(const {flow,item,total} of matching.slice(0,visibleMoves)){
      const card=byClass('article','lnwf-move-card');
      card.append(byClass('strong','',flow.split('-').map(n=>n+'구').join('→')));
      const allHits=item.training.hits+item.recent.hits;
      const pending=result.pending.get(k+'|'+flow);
      card.append(byClass('p','', '과거 '+number(total)+'건 → 실제 다음 번호 출현 '+number(allHits)+'건 ('+percent(allHits,total)+')'));
      const stats=byClass('div','lnwf-move-info');
      stats.append(byClass('span','', '최근 200회: '+number(item.recent.paths)+'건 · '+number(item.recent.hits)+'적중 ('+percent(item.recent.hits,item.recent.paths)+')'));
      const byPosition=item.training.slots.map((n,i)=>({slot:i+1,count:n+item.recent.slots[i]}))
        .sort((a,b)=>b.count-a.count||a.slot-b.slot);
      const actualSlots=byPosition.filter(v=>v.count>0).slice(0,3);
      stats.append(byClass('span','',actualSlots.length?
        '성공 시 다음 자리: '+actualSlots.map(v=>v.slot+'구 '+v.count+'건').join(' · '):
        '성공 시 다음 자리: 기록 없음'));
      stats.append(byClass('span','',pending?
        '현재 대기 '+number(pending.count)+'건 · 가장 빠른 '+pending.first.target+'회 '+pending.first.next+'번':
        '현재 예정 연결 없음'));
      card.append(stats);
      if(total<30)card.append(byClass('div','lnwf-move-alert','⚠ 표본 30건 미만 · 해석 주의'));
      const actions=byClass('div','lnwf-move-actions');
      const button=(text,path,caption)=>{
        const b=byClass('button','',text);b.type='button';b.disabled=!path;
        if(path)b.addEventListener('click',()=>moveExample(path,caption));
        actions.append(b);
      };
      button('✓ 실제 적중 그림',item.success,'과거 다음 번호 적중 사례 · '+flow);
      button('× 미적중 그림',item.failure,'과거 다음 번호 미출현 사례 · '+flow);
      if(pending)button('⏳ 다음 목표 그림',pending.first,'현재 연결 예정 · '+flow);
      card.append(actions);list.append(card);
    }
    if(!matching.length)list.append(byClass('p','', '선택한 자리 흐름의 실제 검증 기록이 없습니다. 필터를 줄이거나 최소 건수를 낮춰 보세요.'));
    const more=pick('[data-lnwf-move-more]');more.hidden=matching.length<=visibleMoves;
    more.textContent='자리 이동 '+Math.min(12,matching.length-visibleMoves)+'개 더 보기 ('+Math.min(visibleMoves,matching.length)+'/'+matching.length+')';
  }
  function render(){
    if(!result)return;
    const mode=pick('[data-lnwf-family]').value,min=Number(pick('[data-lnwf-min]').value),k=key(mode,min);
    const stats=result.all.get(k)||makeResult(),train=stats.training,recent=stats.recent;
    pick('[data-lnwf-status]').textContent='✓ 1~'+result.last+'회 재현 완료 · '+result.checked+'개 회차 점검 · 검증 구간 '+result.holdoutStart+'~'+result.last+'회';
    const chips=pick('[data-lnwf-chips]');chips.textContent='';
    const values=[
      ['전체 연결 경로',number(train.paths+recent.paths)+'건','실제 이전 회차 자료로 만든 연결'],
      ['전체 경로 적중률',percent(train.hits+recent.hits,train.paths+recent.paths),'무작위 번호 기준 13.33%'],
      ['최근 200회 적중률',percent(recent.hits,recent.paths),number(recent.hits)+' / '+number(recent.paths)+' 경로'],
      ['최근 200회 고유번호 적중률',percent(recent.candidateHits,recent.candidates),number(recent.candidates)+'개 후보 · '+recent.rounds+'개 검증 회차']
    ];
    for(const [label,value,note] of values){
      const box=byClass('div','lnwf-chip');box.append(byClass('small','',label),byClass('strong','',value),byClass('small','',note));chips.append(box);
    }
    const body=pick('[data-lnwf-gap-body]');body.textContent='';
    const filtered=[...result.gaps].filter(([item])=>item.startsWith(k+'|'))
      .map(([item,value])=>({gap:Number(item.split('|')[2]),value}))
      .sort((a,b)=>(b.value.training.paths+b.value.recent.paths)-(a.value.training.paths+a.value.recent.paths)||a.gap-b.gap);
    const shown=filtered.slice(0,visibleGaps);
    for(const item of shown){
      const tr=document.createElement('tr'),g=item.value;
      const data=[item.gap+'회',number(g.training.paths)+'건 · '+percent(g.training.hits,g.training.paths),number(g.recent.paths)+'건 · '+percent(g.recent.hits,g.recent.paths)];
      const diff=g.recent.paths?(100*g.recent.hits/g.recent.paths-100*6/45).toFixed(2):null;
      data.push(diff===null?'—':(Number(diff)>0?'+':'')+diff+'%p');
      for(const v of data)tr.append(byClass('td','',v));
      const td=document.createElement('td'),button=byClass('button','','그림');
      button.type='button';button.disabled=!(g.success||g.failure);
      button.addEventListener('click',()=>showExample(g.success||g.failure));td.append(button);tr.append(td);body.append(tr);
    }
    const more=pick('[data-lnwf-more]');more.hidden=filtered.length<=visibleGaps;
    more.textContent='다음 간격 '+Math.min(15,filtered.length-visibleGaps)+'개 더 보기 ('+Math.min(visibleGaps,filtered.length)+'/'+filtered.length+')';
    const success=pick('[data-lnwf-success]'),failure=pick('[data-lnwf-failure]');
    success.disabled=!stats.success;failure.disabled=!stats.failure;
    success.onclick=()=>showExample(stats.success);failure.onclick=()=>showExample(stats.failure);
    const preview=pick('[data-lnwf-example]');preview.textContent='';
    if(stats.success||stats.failure)preview.append(createPositionGrid(stats.success||stats.failure,state.draws));
    else preview.append(byClass('p','', '선택 조건의 과거 연결 사례가 없습니다.'));
    renderMoves();
  }
  function start(){
    const model=window.LNConnectionSchedule?.getModel();
    if(!model||typeof state==='undefined'||!state.draws?.length)return;
    if(latestBuilt===model.last)return;
    if(running){rerun=true;return;}
    running=true;
    pick('[data-lnwf-status]').textContent='과거 회차별 연결 패턴 계산 시작…';
    calculate(model,model.last).then(data=>{
      result=data;latestBuilt=data.last;visibleGaps=15;render();
    }).catch(err=>{
      pick('[data-lnwf-status]').textContent='검증 계산 오류: '+(err&&err.message||'알 수 없는 오류');
    }).finally(()=>{
      running=false;if(rerun){rerun=false;start();}
    });
  }
  pick('[data-lnwf-family]').addEventListener('change',()=>{visibleGaps=15;visibleMoves=12;render();});
  pick('[data-lnwf-min]').addEventListener('change',()=>{visibleGaps=15;visibleMoves=12;render();});
  pick('[data-lnwf-move-search]').addEventListener('input',()=>{visibleMoves=12;renderMoves();});
  pick('[data-lnwf-move-min]').addEventListener('change',()=>{visibleMoves=12;renderMoves();});
  pick('[data-lnwf-move-more]').addEventListener('click',()=>{visibleMoves+=12;renderMoves();});
  pick('[data-lnwf-more]').addEventListener('click',()=>{visibleGaps+=15;render();});
  window.addEventListener('lncs:schedule-ready',()=>{enhanceVisuals();start();});
  enhanceVisuals();start();
})();
