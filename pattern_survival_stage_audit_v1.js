/* LOTTO NOTE: historical forward-check of structural links, independent of the chart renderer. */
(function(){
  'use strict';
  const STAGES=[3,4,5,6];
  const FAMILY={F:'F · 같은 번호 정간격',R:'R · 직전 회차 사선',D:'D · 건너뛰기 사선'};
  const BASE=100*6/45;
  function fresh(){return {trials:0,hits:0,recent:[]};}
  function ensure(map,key){if(!map.has(key))map.set(key,STAGES.map(fresh));return map.get(key);}
  function add(bucket,win,round,num){
    bucket.trials++;if(win)bucket.hits++;
    bucket.recent.push({round,num,win});if(bucket.recent.length>3)bucket.recent.shift();
  }
  // At each target draw, use ONLY the earlier draws to create a potential next point.
  // Every (target, gap, shift, candidate) is one attempt; paths may overlap.
  async function auditStructural(rows,progress){
    const draws=new Map(rows.map(x=>[Number(x.draw_no),new Set(x.numbers.map(Number))]));
    const limit=Math.max(...draws.keys()),byFamily=new Map(),bySignature=new Map();
    for(let target=4;target<=limit;target++){
      const actual=draws.get(target);if(!actual)continue;
      for(let gap=1;target-3*gap>=1;gap++){
        const lastDraw=draws.get(target-gap),two=draws.get(target-2*gap),three=draws.get(target-3*gap);
        if(!lastDraw||!two||!three)continue;
        for(const last of lastDraw){
          for(let shift=-14;shift<=14;shift++){
            const next=last+shift;if(next<1||next>45)continue;
            if(!two.has(last-shift)||!three.has(last-2*shift))continue;
            let count=3;
            while(target-(count+1)*gap>=1&&draws.get(target-(count+1)*gap)?.has(last-count*shift))count++;
            const family=shift===0?'F':gap===1?'R':'D',win=actual.has(next);
            const total=Math.min(6,count);
            const familyBuckets=ensure(byFamily,family),signatureBuckets=ensure(bySignature,gap+':'+shift);
            for(let stage=3;stage<=total;stage++){
              add(familyBuckets[stage-3],win,target,next);
              add(signatureBuckets[stage-3],win,target,next);
            }
          }
        }
      }
      if(target%48===0){if(progress)progress(target,limit);await new Promise(resolve=>setTimeout(resolve,0));}
    }
    return {byFamily,bySignature,limit};
  }
  if(typeof window!=='undefined'&&window.LN_STAGE_AUDIT_TEST){window.LN_STAGE_AUDIT_TEST_API={auditStructural};return;}
  const root=document.getElementById('ln-all-pattern-survival');
  if(!root||root.querySelector('[data-lnsa-panel]'))return;
  const zone=root.querySelector('[data-lnall-path-zone]');
  if(!zone)return;
  const panel=document.createElement('section');
  panel.setAttribute('data-lnsa-panel','');
  panel.innerHTML=`
    <style>
      #ln-all-pattern-survival [data-lnsa-panel]{margin:13px 0 6px;padding:15px;background:#0f2439;border:1px solid #66869f;border-radius:14px}
      #ln-all-pattern-survival [data-lnsa-panel] h4{margin:0 0 9px;font-size:17px;color:#ffe1a1}
      #ln-all-pattern-survival [data-lnsa-panel] .lnsa-notice{font-size:12px;color:#c9dcf1;line-height:1.7;margin:6px 0 13px}
      #ln-all-pattern-survival [data-lnsa-panel] .lnsa-sub{font-size:15px;color:#9ff2cd;font-weight:850;margin:12px 0 7px}
      #ln-all-pattern-survival [data-lnsa-panel] .lnsa-grid{display:grid;gap:9px}
      #ln-all-pattern-survival [data-lnsa-panel] .lnsa-row{padding:10px 12px;background:#1a354f;border:1px solid #3f5d79;border-radius:11px}
      #ln-all-pattern-survival [data-lnsa-panel] .lnsa-line{display:flex;align-items:center;justify-content:space-between;gap:9px;flex-wrap:wrap}
      #ln-all-pattern-survival [data-lnsa-panel] .lnsa-stage{font-size:16px;color:#fff4d3;font-weight:900}
      #ln-all-pattern-survival [data-lnsa-panel] .lnsa-score{font-size:14px;color:#e5f3ff;font-weight:750}
      #ln-all-pattern-survival [data-lnsa-panel] .lnsa-track{margin-top:8px;height:11px;background:#29455d;border-radius:7px;position:relative;overflow:hidden}
      #ln-all-pattern-survival [data-lnsa-panel] .lnsa-fill{display:block;height:100%;background:#3bc99c;border-radius:7px}
      #ln-all-pattern-survival [data-lnsa-panel] .lnsa-base{position:absolute;left:44.44%;height:100%;border-left:2px dashed #f1cb72;top:0}
      #ln-all-pattern-survival [data-lnsa-panel] .lnsa-note{font-size:11px;color:#c6dcf1;line-height:1.65;margin:6px 0 0}
      #ln-all-pattern-survival [data-lnsa-panel] .lnsa-examples{margin-top:6px;font-size:12px;color:#c8def0;line-height:1.8}
      #ln-all-pattern-survival [data-lnsa-panel] .lnsa-examples strong{color:#fff0ce}
      #ln-all-pattern-survival [data-lnsa-panel] .lnsa-examples .pass{color:#8bf1bc}
      #ln-all-pattern-survival [data-lnsa-panel] .lnsa-examples .fail{color:#ff9fa5}
      @media(max-width:560px){#ln-all-pattern-survival [data-lnsa-panel]{padding:11px}#ln-all-pattern-survival [data-lnsa-panel] .lnsa-score{font-size:13px}}
    </style>
    <h4>🔎 다음 점까지 살아남았나? · 과거 전수검증</h4>
    <p class="lnsa-notice">실제로 3점이 연결됐을 때 다음 4점이 나왔는지, 4점→5점, 5점→6점도 차례로 확인합니다. <b>각 시도는 결과가 나온 회차보다 이전 번호만 보고 계산</b>합니다.</p>
    <div data-lnsa-status class="lnsa-note">1회부터 과거 기록을 차례대로 검사할 준비 중…</div>
    <div data-lnsa-results hidden>
      <div class="lnsa-sub" data-lnsa-family-title></div>
      <div data-lnsa-family class="lnsa-grid"></div>
      <div class="lnsa-sub" data-lnsa-exact-title></div>
      <div data-lnsa-exact class="lnsa-grid"></div>
      <p class="lnsa-note">막대는 과거 당번 포함 비율(최대 30% 눈금), 점선은 한 번호의 무작위 포함 기준 <b>13.33%</b>입니다. 같은 번호·회차가 다른 간격 규칙에서 중복 집계될 수 있으므로 <b>시도 건수를 독립 표본으로 해석하거나 미래 당첨확률로 볼 수 없습니다.</b> 이미 연구한 규칙에 대한 과거 복기이므로 독립적인 미래 성과 검증도 아닙니다.</p>
    </div>
  `;
  zone.append(panel);
  const $=s=>panel.querySelector(s);
  let summary=null,sourceLast=0,busy=false;
  const esc=s=>String(s).replace(/[&<>"']/g,v=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[v]));
  function drawRows(target,stats){
    const host=$(target);host.textContent='';
    STAGES.forEach((stage,i)=>{
      const x=stats?.[i]||fresh(),rate=x.trials?100*x.hits/x.trials:0;
      const row=document.createElement('div');row.className='lnsa-row';
      row.innerHTML='<div class="lnsa-line"><span class="lnsa-stage">'+(stage===6?'6점 이상 → 다음':stage+'점 → '+(stage+1)+'점')+'</span><span class="lnsa-score">'+(x.trials?x.hits+' / '+x.trials+'회 시도 · '+rate.toFixed(1)+'%':'과거 시도 없음')+'</span></div>'+
        '<div class="lnsa-track"><span class="lnsa-fill" style="width:'+Math.min(100,rate/30*100).toFixed(2)+'%"></span><span class="lnsa-base"></span></div>'+
        (x.recent.length?'<div class="lnsa-examples">최근 시도: '+x.recent.slice().reverse().map(a=>'<span class="'+(a.win?'pass':'fail')+'">'+a.round+'회 '+a.num+'번 '+(a.win?'✓ 성공':'× 중단')+'</span>').join(' · ')+'</div>':'');
      host.append(row);
    });
  }
  function currentPath(){
    const select=root.querySelector('[data-lnall-path-select]'),option=select?.selectedOptions?.[0];
    // Main chart caption carries immutable gap/shift values without reading closure-local state.
    const caption=root.querySelector('[data-lnall-path-caption]')?.textContent||'';
    const gap=Number(caption.match(/회차 간격\s+(\d+)/)?.[1]);
    const shift=Number(caption.match(/번호 이동\s+([+-]?\d+)/)?.[1]);
    if(!Number.isInteger(gap)||gap<1||!Number.isInteger(shift))return null;
    const family=shift===0?'F':gap===1?'R':'D';
    return {gap,shift,family,label:option?.textContent||''};
  }
  function render(){
    if(!summary)return;
    const path=currentPath();if(!path)return;
    $('[data-lnsa-results]').hidden=false;
    $('[data-lnsa-family-title]').textContent='① '+FAMILY[path.family]+' · 모든 간격·이동폭 합산';
    drawRows('[data-lnsa-family]',summary.byFamily.get(path.family));
    $('[data-lnsa-exact-title]').textContent='② 현재 그림과 동일 규칙 · +'+path.gap+'회 간격 / 번호 이동 '+(path.shift>0?'+':'')+path.shift;
    drawRows('[data-lnsa-exact]',summary.bySignature.get(path.gap+':'+path.shift));
  }
  const label=root.querySelector('[data-lnall-path-float-label]');
  if(label)new MutationObserver(render).observe(label,{childList:true});
  async function start(){
    if(busy||typeof state==='undefined'||!Array.isArray(state.draws)||state.draws.length<100)return;
    const last=state.draws[state.draws.length-1].draw_no;
    if(sourceLast===last)return;
    busy=true;sourceLast=last;
    try{
      summary=await auditStructural(state.draws,(n,total)=>{if(n%96===0)$('[data-lnsa-status]').textContent=n+' / '+total+'회 과거 연결을 대조 중…';});
      $('[data-lnsa-status]').textContent='1~'+summary.limit+'회 과거 실제 당첨번호로 전수검증 완료 · 새 회차 확정 시 다시 계산';
      render();
    }catch(error){sourceLast=0;$('[data-lnsa-status]').textContent='검증 계산 실패: '+error.message;}
    finally{busy=false;}
  }
  const status=root.querySelector('[data-lnall-status]');
  if(status)new MutationObserver(()=>{if(status.textContent.includes('전체 비교 완료'))start();}).observe(status,{childList:true});
  if(status?.textContent.includes('전체 비교 완료'))start();
})();
