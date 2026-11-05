/* LOTTO NOTE · 브라우저 제외수 SHADOW 연구소. 실제 조합에는 반영하지 않는다. */
'use strict';
const EXCLUSION_SCAN_URL='./data/exclusion_scans.json';
const EXCLUSION_SCORE_URL='./data/exclusion_scorecard.json';
const exclusionResultState={records:[],scorecard:null,loading:false,status:'사전 저장 기록을 불러오는 중'};

async function syncExclusionStudies(){
  exclusionResultState.loading=true;
  const read=async url=>{
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),9000);
    try{const r=await fetch(url,{cache:'no-store',signal:controller.signal});
      if(!r.ok)throw Error('HTTP '+r.status);return await r.json();}
    finally{clearTimeout(timeout);}
  };
  try{
    const [entries,score]=await Promise.all([read(EXCLUSION_SCAN_URL),read(EXCLUSION_SCORE_URL)]);
    if(entries.version!==1||!Array.isArray(entries.records)||entries.records.length>104||
      score.version!==1||score.policy!=='prospective-exclusion-shadow-only-v1'||
      !Array.isArray(score.rows)||score.rows.length!==2)throw Error('연구원장 형식 불일치');
    exclusionResultState.records=entries.records;
    exclusionResultState.scorecard=score;
    exclusionResultState.status='서버 연구원장 확인됨';
  }catch(err){
    exclusionResultState.status='서버 연구원장 확인 대기: '+err.message;
    exclusionResultState.records=[];exclusionResultState.scorecard=null;
  }finally{
    exclusionResultState.loading=false;
    renderExclusionLab();
  }
}

function renderExclusionLab(){
  const el=document.getElementById('exclusionLabContent');
  if(!el)return;
  const scan=state.serverScanLatest;
  const current=state.draws?.length?upcoming(state.draws):null;
  if(!current||!scan||scan.round!==current||!state.historicalWalkforward){
    el.innerHTML='<p class="hint">확정된 추첨 전 45수 원장과 과거 검증표를 연결한 뒤 연구할 수 있습니다. '+
      clean(exclusionResultState.status)+'</p>';return;
  }
  const saved=exclusionResultState.records.find(r=>r.round===scan.round &&
    r.sourceRound===scan.sourceRound&&r.predrawScanAt===scan.createdAt&&
    r.policy===LottoExclusionLab.POLICY);
  let study;
  if(saved){
    study={weak:saved.weakSignals,verified:saved.significantSignals,variants:saved.variants};
  }else{
    try{study=LottoExclusionLab.analyze(state.historicalWalkforward,scan);}
    catch(err){el.textContent='제외 연구 근거 준비 중: '+err.message;return;}
  }
  const overlap=Number(document.getElementById('exclusionOverlap')?.value||3);
  const currentVariant=study.variants.find(v=>v.overlap===overlap)||study.variants.at(-1);
  const selected=new Set(currentVariant.candidates.map(x=>x.n));
  const survivors=Array.from({length:45},(_,i)=>i+1).filter(n=>!selected.has(n));
  const fmt=v=>(100*v).toFixed(2)+'%';
  const tableRows=study.weak.map(s=>'<tr><td>'+clean(s.label||s.key)+'</td><td>'+s.earlyHits+'/'+s.earlySelected+
    ' · '+fmt(s.earlyHits/s.earlySelected)+'</td><td>'+s.lateHits+'/'+s.lateSelected+
    ' · '+fmt(s.lateHits/s.lateSelected)+'</td><td>'+fmt(s.lateAdjustedP)+'</td></tr>').join('');
  const detail=currentVariant.candidates.map(v=>{
    const labels=v.signals.map(key=>study.weak.find(a=>a.key===key)?.label||key);
    return '<details class="audit-group"><summary class="openmore">'+v.n+'번 · 조건 '+v.signals.length+'개 겹침</summary>'+
      '<p class="hint">'+labels.map(clean).join(' / ')+'</p></details>';
  }).join('');
  const frozen=saved?'<span class="tag" style="color:#83dcc0">🔒 추첨 전 별도 고정 연구원장</span>':
    '<span class="tag" style="color:#f0c981">미고정 화면 계산 · 실전 사전검증에 포함 안 됨</span>';
  const score=exclusionResultState.scorecard;
  const scoreRows=score?.rows?.map(r=>'<tr><td>'+r.overlap+'개 이상</td><td>'+r.verifiedRounds+
    '회</td><td>'+r.excludedWinningNumbers+'개 / '+r.randomExpectedExcludedWinners.toFixed(2)+'개</td><td>'+r.fullySurvivedRounds+
    '회 / '+r.randomExpectedFullySurvivedRounds.toFixed(2)+'회</td><td>'+clean(r.verdict)+'</td></tr>').join('')||'';
  el.innerHTML='<div class="section panel">'+
    '<h2>🚫 이번 '+current+'회 · 제외수 연구 후보</h2><p class="hint">'+frozen+
    ' · '+scan.sourceRound+'회까지 자료만 사용 · 연구용 음성 신호, <strong>구매 추천이 아님</strong></p>'+
    '<p class="hint">조건 11개 중 앞 구간과 최근 250회에서 모두 적중률 13.33% 미만인 조건을 골라봅니다. 각 조건은 서로 겹치며, 과거 자료를 보고 연구 기준을 만든 사후 가설입니다.</p>'+
    '<div class="cards"><div class="stat"><small>두 구간 모두 낮았던 조건</small><b>'+study.weak.length+'개</b></div>'+
    '<div class="stat"><small>최근 구간 다중검정 보정 통과</small><b>'+study.verified.length+'개</b></div>'+
    '<div class="stat"><small>연구용 제외 후보</small><b>'+currentVariant.count+'수</b></div></div>'+
    '<div class="toolbar"><label>조건 겹침 기준 <select class="field" id="exclusionOverlap" onchange="renderExclusionLab()">'+
    [2,3].map(n=>'<option value="'+n+'"'+(n===overlap?' selected':'')+'>'+n+'개 이상</option>').join('')+
    '</select></label><span class="tag">실제 조합 자동 제외: 사용 안 함</span></div>'+
    '<p><strong>관찰용 제외 후보 '+currentVariant.count+'개</strong> (무작위 제외 시 당첨번호가 섞일 기대 '+
      currentVariant.expectedExcludedHits.toFixed(2)+'개)</p>'+
    '<div class="ballset" style="margin:10px 0 18px">'+currentVariant.candidates.map(v=>ball(v.n)).join('')+
    (currentVariant.count?'':'<span class="hint">해당 기준으로 걸린 번호 없음</span>')+'</div>'+
    '<p><strong>남는 번호 '+survivors.length+'개</strong> (조합에 자동 반영하지 않음)</p>'+
    '<p class="hint">'+survivors.join(' · ')+'</p>'+
    '<p class="caution">무작위로 '+currentVariant.count+'개를 제외할 경우, 6개 본번호가 전부 남을 확률은 '+
      fmt(currentVariant.allSixRemainRandom)+'. 이 가설이 실제로 더 잘 걸러내는지는 앞으로 추첨 결과로만 판정합니다. 제외수가 많아 조합 경우의 수가 줄어도 1게임의 1등 확률이 자동으로 오르지 않습니다.</p>'+
    '<details class="audit-group"><summary class="openmore">해당 제외 번호마다 걸린 조건과 이유</summary>'+
    (detail||'<p class="hint">선정 번호가 없습니다.</p>')+'</details>'+
    '<details class="audit-group"><summary class="openmore">약한 조건 '+study.weak.length+'종 · 앞/최근 실제 수치</summary>'+
    '<div class="tablewrap"><table class="simple-table"><thead><tr><th>조건</th><th>앞 구간</th><th>최근 구간</th><th>최근 보정 p값</th></tr></thead><tbody>'+
    tableRows+'</tbody></table></div>'+(study.weak.length?'':'<p class="hint">양 구간에서 모두 낮은 조건이 없습니다.</p>')+'</details>'+
    '<p class="hint">'+clean(exclusionResultState.status)+' · '+
    (saved?'고정 시각 '+clean(new Date(saved.createdAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})):'이 화면의 가설은 별도 고정되지 않았습니다.')+'</p></div>'+
    '<div class="section panel"><h2>📊 제외수 가설 · 추첨 후 실전 성적</h2>'+
    (score?'<p><strong>사전 고정·결과 확인 '+score.verifiedRounds+'회 / 최소 '+score.minimumRoundsForInterpretation+'회</strong></p>'+
      '<div class="tablewrap"><table class="simple-table"><thead><tr><th>겹침 기준</th><th>확인 회차</th><th>제외에 섞인 당첨수 / 무작위 기대</th><th>6수 전부 보존 / 무작위 기대</th><th>판정</th></tr></thead><tbody>'+scoreRows+'</tbody></table></div>':
      '<p class="hint">서버에 저장된 추첨 후 비교 성적을 기다립니다.</p>')+
    '<p class="caution">① 당첨 전 기록된 제외수만 계산 ② 보너스 번호는 6개 당첨 본번호와 구분 ③ 제외한 당첨번호가 적을수록 유리 ④ 같은 제외 개수의 무작위 선택과 비교 ⑤ 두 기준 동시 검정 보정 ⑥ 최소 30회 이전 우위 판정 금지. 모든 성적은 구매조합에서 제외 없이 그림자 연구로 누적합니다.</p></div>';
}
