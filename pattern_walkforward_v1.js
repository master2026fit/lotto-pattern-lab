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
    ROOT+' .lnpg-next-target{grid-column:span 6;display:flex;flex-direction:column;gap:1px;justify-content:center;min-height:50px;border:2px solid #ffcc84;border-radius:8px;background:linear-gradient(110deg,#a21b35,#ed4959);box-shadow:0 0 0 2px #ffedb827,0 0 18px #ed495977;color:#fffef4;font-weight:950}',
    ROOT+' .lnpg-next-target strong{font-size:22px;line-height:1.2;letter-spacing:.25px}',
    ROOT+' .lnpg-next-target small{font-size:10px;color:#fff3d5;font-weight:750}',
    ROOT+' .lnpg-trail{margin:8px 0 0;padding:7px;border-radius:7px;background:#194052;color:#daf6e6;font-size:11px;line-height:1.6;overflow-wrap:anywhere}',
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
  function createPositionGrid(path,draws){
    const wrap=byClass('section','lnpg-card');
    const source=path.target-path.gap,sourceNo=path.next-path.shift;
    wrap.append(byClass('div','lnpg-heading','📐 1~6구 자리별 연결 · '+source+'회 '+sourceNo+'번 → '+path.target+'회 '+path.next+'번'));
    wrap.append(byClass('div','lnpg-description','가로: 당첨번호 오름차순 1~6구 · 세로: 실제 회차 · 초록 칸: 연결된 번호'));
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
      const tiny=byClass('small','',!isTarget?'실제':draw?(present?'✓ 적중':'× 미출현'):'예정');
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
        // The target number is known; its 1~6 slot is not known before the draw.
        const candidate=byClass('div','lnpg-next-target');
        candidate.append(byClass('strong','', '🎯 '+predicted+'번 연결 대상'));
        candidate.append(byClass('small','',round+'회 출현 여부·1~6구 자리 검증 대기'));
        grid.append(candidate);
      }else{
        for(let i=0;i<6;i++)grid.append(byClass('div','lnpg-cell lnpg-unknown','—'));
      }
    }
    wrap.append(grid);
    const targetDraw=drawAt(draws,path.target);
    const outcome=!targetDraw?'⏳ '+path.target+'회 '+path.next+'번 자리·결과는 추첨 후 확인':
      targetDraw.numbers.map(Number).includes(path.next)?'✓ '+path.target+'회 '+path.next+'번 실제 당첨 및 자리 확인':
      '× '+path.target+'회 '+path.next+'번 미출현 (제외수 증명 아님)';
    wrap.append(byClass('div','lnpg-trail',trail.join(' → ')+'  |  '+outcome));
    return wrap;
  }
  window.LNPositionGrid={create:createPositionGrid};
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
  async function calculate(model,last){
    const all=new Map(),gaps=new Map(),byDraw=model.byDraw;
    const threshold=last-200;
    let count=0;
    for(let target=5;target<=last;target++){
      const period=target>threshold?'recent':'training';
      const actual=byDraw[target]||new Set();
      const seen=new Map(),paths=window.LNConnectionSchedule.buildPaths(target,byDraw);
      for(const p of paths){
        const hit=actual.has(p.next),family=p.shift===0?'fixed':'diagonal';
        for(const mode of ['all',family])for(const min of mins){
          if(p.count<min)continue;
          const k=key(mode,min),group=get(all,k),byGap=get(gaps,k+'|'+p.gap);
          group[period].paths++;if(hit)group[period].hits++;
          byGap[period].paths++;if(hit)byGap[period].hits++;
          recordSample(group,p,hit);recordSample(byGap,p,hit);
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
    return {all,gaps,last,checked:count,holdoutStart:threshold+1};
  }
  function showExample(path){
    const zone=pick('[data-lnwf-example]');zone.textContent='';
    if(!path){zone.append(byClass('p','', '해당 조건에는 아직 표시할 사례가 없습니다.'));return;}
    zone.append(createPositionGrid(path,state.draws));
    zone.scrollIntoView({behavior:'smooth',block:'center'});
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
  pick('[data-lnwf-family]').addEventListener('change',()=>{visibleGaps=15;render();});
  pick('[data-lnwf-min]').addEventListener('change',()=>{visibleGaps=15;render();});
  pick('[data-lnwf-more]').addEventListener('click',()=>{visibleGaps+=15;render();});
  window.addEventListener('lncs:schedule-ready',()=>{enhanceVisuals();start();});
  enhanceVisuals();start();
})();
