import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exactChanceTail } from './build_scorecard.mjs';

const SOURCE = 'https://smok95.github.io/lotto/results/all.json';
const OUTPUT = path.resolve('data/historical_walkforward.json');
const SCANS = path.resolve('data/weekly_scans.json');
const BASE = 6 / 45;
const AXES = [
  ['neighbor1','직전 회차 ±1 이웃수 존재'],
  ['neighbor2','직전 회차 ±2 이웃수 존재'],
  ['ending','직전 회차 다른 같은 끝수 존재'],
  ['bonus','직전 회차 보너스가 해당 번호'],
  ['carry','직전 회차 해당 번호 본번호 출현'],
  ['miss5','최근 5회 해당 번호 미출현 중'],
  ['neighborTwice','직전 3회 중 ±1 이웃수 2회 이상'],
  ['sameSlot','해당 번호 최근 두 번 같은 자리'],
  ['fixedCycle','4단계 이상 고정 회차간격'],
  ['diagonal','4단계 이상 사선 연결'],
  ['context2plus','직전 상황 2개 이상 교집합']
];

export function normalizeDraws(raw) {
  const data = Array.isArray(raw) ? raw : raw?.results;
  if (!Array.isArray(data) || data.length < 30) throw new Error('당첨 이력 30회 이상 필요');
  const draws = data.map(x => ({
    draw_no:Number(x.draw_no),
    numbers:(x.numbers || []).map(Number).sort((a,b)=>a-b),
    bonus_no:Number(x.bonus_no || 0)
  })).sort((a,b)=>a.draw_no-b.draw_no);
  for (let i=0;i<draws.length;i++) {
    const d=draws[i];
    if(d.draw_no!==i+1 || d.numbers.length!==6 || new Set(d.numbers).size!==6 ||
      d.numbers.some(n=>!Number.isInteger(n)||n<1||n>45) ||
      !Number.isInteger(d.bonus_no)||d.bonus_no<1||d.bonus_no>45||d.numbers.includes(d.bonus_no))
      throw new Error(`${i+1}회 온라인 당첨 이력 검증 실패`);
  }
  return draws;
}

// 역사 복원만 한다. 매번 입력은 목표 회차 직전의 회차들뿐이다.
export function priorFlags(prior,n,cachedSets=null) {
  if(!Array.isArray(prior)||!Number.isInteger(n)||n<1||n>45) throw Error('사전 입력 오류');
  const i=prior.length,prev=prior[i-1],flags=[];
  if(!prev)return flags;
  const near=(v,d)=>Math.abs(v-n)===d;
  if(prev.numbers.some(v=>near(v,1)))flags.push('neighbor1');
  if(prev.numbers.some(v=>near(v,2)))flags.push('neighbor2');
  if(prev.numbers.some(v=>v!==n&&v%10===n%10))flags.push('ending');
  if(prev.bonus_no===n)flags.push('bonus');
  if(prev.numbers.includes(n))flags.push('carry');
  if(i>=5&&prior.slice(-5).every(d=>!d.numbers.includes(n)))flags.push('miss5');
  if(i>=3&&prior.slice(-3).filter(d=>d.numbers.some(v=>near(v,1))).length>=2)flags.push('neighborTwice');
  const slots=[];
  for(let j=i-1;j>=0&&slots.length<2;j--){
    const p=prior[j].numbers.indexOf(n);
    if(p!==-1)slots.push(p);
  }
  if(slots.length===2&&slots[0]===slots[1])flags.push('sameSlot');
  // 앱의 makeTimelineRules와 동일한 4단계 고정위상/사선 판정이다.
  const sets=cachedSets||prior.map(d=>new Set(d.numbers));
  let fixed=false,diagonal=false;
  for(let d=1;d*4<=i&&(!fixed||!diagonal);d++){
    if(!fixed&&sets[i-d].has(n)&&sets[i-2*d].has(n)&&
      sets[i-3*d].has(n)&&sets[i-4*d].has(n))fixed=true;
    if(!diagonal){
      for(const previous of prior[i-d].numbers){
        const step=n-previous;
        if(step===0)continue;
        const x=n-2*step,y=n-3*step,z=n-4*step;
        if(x<1||x>45||y<1||y>45||z<1||z>45)continue;
        if(sets[i-2*d].has(x)&&sets[i-3*d].has(y)&&sets[i-4*d].has(z)){
          diagonal=true;break;
        }
      }
    }
  }
  if(fixed)flags.push('fixedCycle');
  if(diagonal)flags.push('diagonal');
  if(flags.filter(key=>!['fixedCycle','diagonal'].includes(key)).length>=2)flags.push('context2plus');
  return flags;
}

export function auditAgainstSavedSnapshot(draws,snapshot){
  if(!snapshot)return;
  if(snapshot.sourceRound!==draws.length||snapshot.round!==draws.length+1)
    throw Error('사전 저장 원본과 온라인 데이터의 최신 회차가 달라 비교할 수 없습니다.');
  const saved=new Map(snapshot.rows.map(row=>[row.n,row]));
  const sets=draws.map(d=>new Set(d.numbers));
  for(let n=1;n<=45;n++){
    const expected=priorFlags(draws,n,sets).sort(),actual=[...(saved.get(n)?.flags||[])].sort();
    if(expected.length!==actual.length||expected.some((key,i)=>key!==actual[i]))
      throw Error(`${snapshot.round}회 ${n}번: 과거 복원과 사전 저장 검색조건 불일치 (${expected.join(',')} vs ${actual.join(',')})`);
  }
}

function summarize(items,key){
  const selectedSizes=items.map(x=>x.axes[key].selected.length);
  const hits=items.reduce((sum,x)=>sum+x.axes[key].hits.length,0);
  const total=selectedSizes.reduce((sum,n)=>sum+n,0);
  const expected=total*BASE;
  const {better,worse}=exactChanceTail(selectedSizes,hits);
  return {rounds:items.length,selected:total,hits,missed:items.length*6-hits,
    expected:Number(expected.toFixed(3)),delta:Number((hits-expected).toFixed(3)),
    hitRate:total?Number((hits/total).toFixed(5)):null,pBetter:better,pWorse:worse,
    pBetterAdjusted:1,pWorseAdjusted:1};
}

// 사전에 정의한 환경 구간. 모든 값은 목표 회차 이전에 이미 알 수 있다.
const CONTEXT_GROUPS = [
  ['sumLow','전회차 번호 합계 134 이하','sum'],
  ['sumHigh','전회차 번호 합계 135 이상','sum'],
  ['previousNoPair','전회차 연속번호 없음','pair'],
  ['previousPair','전회차 연속번호 있음','pair'],
  ['signalLow','해당 번호의 기본조건 1~2개','signal'],
  ['signalHigh','해당 번호의 기본조건 3개 이상','signal']
];

function contextSummary(records){
  const nonempty=records.filter(r=>r.selected>0);
  const selected=records.reduce((sum,r)=>sum+r.selected,0);
  const hits=records.reduce((sum,r)=>sum+r.hits,0);
  const expected=selected*BASE;
  const {better,worse}=exactChanceTail(nonempty.map(r=>r.selected),hits);
  return {rounds:nonempty.length,selected,hits,
    expected:Number(expected.toFixed(3)),delta:Number((hits-expected).toFixed(3)),
    hitRate:selected?Number((hits/selected).toFixed(5)):null,
    pBetter:better,pWorse:worse,pBetterAdjusted:1,pWorseAdjusted:1};
}

// 매 회차 각 번호의 '조건 겹침'도 이전 기록으로만 계산한다.
// context2plus는 겹침을 이미 표현하는 파생축이므로 중복 계산하지 않는다.
export function makeContextReview(draws,history,split){
  if(history.length!==draws.length-1||split<1||split>=history.length)
    throw Error('환경 비교를 위한 과거 구간이 올바르지 않습니다.');
  const records=new Map();
  for(const [axis] of AXES)for(const [context] of CONTEXT_GROUPS)
    records.set(axis+'|'+context,[]);
  for(let i=0;i<history.length;i++){
    const current=history[i],previous=draws[i],winning=new Set(current.actual);
    const prevSum=previous.numbers.reduce((a,b)=>a+b,0);
    const prevPair=previous.numbers.some((n,j)=>j>0&&n===previous.numbers[j-1]+1);
    const overlap=new Array(46).fill(0);
    for(const [key] of AXES){
      if(key==='context2plus')continue;
      for(const n of current.axes[key].selected)overlap[n]++;
    }
    current.environment={previousSum:prevSum,previousPair:prevPair,
      signal3plus:Array.from({length:45},(_,n)=>n+1).filter(n=>overlap[n]>=3)};
    const contexts={
      sumLow:()=>prevSum<=134,sumHigh:()=>prevSum>=135,
      previousNoPair:()=>!prevPair,previousPair:()=>prevPair,
      signalLow:n=>overlap[n]<=2,signalHigh:n=>overlap[n]>=3
    };
    for(const [key] of AXES){
      const selected=current.axes[key].selected;
      for(const [context] of CONTEXT_GROUPS){
        const qualifying=selected.filter(n=>contexts[context](n));
        records.get(key+'|'+context).push({selected:qualifying.length,
          hits:qualifying.filter(n=>winning.has(n)).length});
      }
    }
  }
  const rows=[];
  for(const [key,label] of AXES)for(const [context,contextLabel,kind] of CONTEXT_GROUPS){
    const items=records.get(key+'|'+context);
    rows.push({key,label,context,contextLabel,kind,
      early:contextSummary(items.slice(0,split)),
      late:contextSummary(items.slice(split)),
      verdict:'무작위와 구별 어려움'});
  }
  // 11축 × 6환경 × 양·음 2방향 = 132개 탐색 비교를 동시에 보정한다.
  // 빈 환경과 선택수가 적은 환경도 탐색 가족에 포함해 유리한 결과만 골라내는 착시를 줄인다.
  const tests=rows.flatMap(row=>[
    {value:row.late.pBetter,row,field:'pBetterAdjusted'},
    {value:row.late.pWorse,row,field:'pWorseAdjusted'}
  ]).sort((a,b)=>a.value-b.value);
  let previous=0;
  tests.forEach((item,i)=>{
    previous=Math.max(previous,Math.min(1,item.value*(tests.length-i)));
    item.row.late[item.field]=Number(previous.toFixed(8));
  });
  for(const row of rows){
    row.directionReversed=row.early.selected>=30&&row.late.selected>=30&&
      row.early.delta*row.late.delta<0;
    row.verdict=row.late.rounds<30||row.late.selected<30?'표본 부족':
      row.late.pBetterAdjusted<.05?'후반 초과 관찰 · 미래 재검증':
      row.late.pWorseAdjusted<.05?'후반 저조 관찰 · 미래 재검증':
      row.directionReversed?'앞뒤 방향 역전 · 불안정':'무작위와 구별 어려움';
  }
  return {version:1,method:'predefined-prior-only-context-buckets',
    caution:'사전 정의한 환경별 과거 복원입니다. 여러 환경을 뒤져 잘 맞는 조건을 고르는 탐색이므로 실제 추첨 전 성적에 섞거나 자동 제외 근거로 사용할 수 없습니다.',
    correctedComparisons:tests.length,
    contexts:CONTEXT_GROUPS.map(([key,label,kind])=>({key,label,kind})),rows};
}

const FOLLOWUP_HORIZONS=[1,2,3,5,10];
const FOLLOWUP_TYPES=[
  ['predictedButMissed','검색됐지만 해당 회차에 당첨되지 않은 번호'],
  ['unpredictedWinner','검색에서 빠졌지만 해당 회차에 당첨된 번호']
];

// 후속 회차는 발표 뒤 복기에만 사용한다. 기존 사전 검출 결과나 다음 회차 선정에 되먹이지 않는다.
export function makeFollowupReview(draws,history){
  if(history.length!==draws.length-1)throw Error('후속 출현 복기 이력이 일치하지 않습니다.');
  const totals=new Map();
  const numberTotals=new Map();
  for(const [axis] of AXES)for(const [type] of FOLLOWUP_TYPES)
    totals.set(axis+'|'+type,FOLLOWUP_HORIZONS.map(horizon=>({horizon,eligible:0,seen:0})));
  for(const [axis] of AXES)for(const [type] of FOLLOWUP_TYPES)for(let n=1;n<=45;n++)
    numberTotals.set(axis+'|'+type+'|'+n,FOLLOWUP_HORIZONS.map(horizon=>({horizon,eligible:0,seen:0})));
  for(let i=0;i<history.length;i++){
    const current=history[i],won=new Set(current.actual);
    const observedRounds=Math.min(10,draws.length-current.round);
    const future=draws.slice(current.round,current.round+observedRounds);
    const traceAxes={};
    for(const [key] of AXES){
      const picked=current.axes[key].selected;
      const pickedSet=new Set(picked);
      const cases={
        predictedButMissed:picked.filter(n=>!won.has(n)),
        unpredictedWinner:current.actual.filter(n=>!pickedSet.has(n))
      };
      const traces={};
      for(const [type] of FOLLOWUP_TYPES){
        const rows=totals.get(key+'|'+type);
        traces[type]=cases[type].map(n=>{
          const first=future.findIndex(draw=>draw.numbers.includes(n));
          const firstAfter=first<0?null:first+1;
          const individualRows=numberTotals.get(key+'|'+type+'|'+n);
          for(let j=0;j<rows.length;j++){
            const record=rows[j],individual=individualRows[j];
            // 충분한 시간이 지나지 않았다면 '미출현'으로 계산하지 않는다.
            if(observedRounds<record.horizon)continue;
            record.eligible++;
            individual.eligible++;
            if(firstAfter!==null&&firstAfter<=record.horizon){record.seen++;individual.seen++;}
          }
          return {n,firstAfter};
        });
      }
      if(i>=history.length-8)traceAxes[key]=traces;
    }
    if(i>=history.length-8)current.followup={observedRounds,axes:traceAxes};
  }
  const rows=AXES.map(([key,label])=>{
    const groups={};
    for(const [type] of FOLLOWUP_TYPES){
      groups[type]=totals.get(key+'|'+type).map(item=>{
        const randomRate=1-Math.pow(39/45,item.horizon);
        const rate=item.eligible?item.seen/item.eligible:null;
        return {...item,rate:rate===null?null:Number(rate.toFixed(5)),
          randomRate:Number(randomRate.toFixed(5)),
          expected:Number((item.eligible*randomRate).toFixed(2)),
          delta:item.eligible?Number((item.seen-item.eligible*randomRate).toFixed(2)):null};
      });
    }
    return {key,label,groups};
  });
  // 1~45 전 번호에 같은 과거 시점 복기 기준을 적용한다. 번호별 기록도 미래 검색에 사용하지 않는다.
  const numberRows=Array.from({length:45},(_,index)=>{
    const n=index+1,axes={};
    for(const [key] of AXES){
      const groups={};
      for(const [type] of FOLLOWUP_TYPES)
        groups[type]=numberTotals.get(key+'|'+type+'|'+n).map(({horizon,eligible,seen})=>({horizon,eligible,seen}));
      axes[key]=groups;
    }
    return {n,axes};
  });
  return {version:1,method:'postdraw-only-first-future-appearance',horizons:FOLLOWUP_HORIZONS,
    origin:'historical-retrospective-not-predraw',
    caution:'당첨 발표 뒤에만 후속 출현을 기록합니다. 해당 기간이 지나지 않은 번호는 확인 대기이며 실패가 아닙니다. 과거의 반복 출현이나 1~10회 안의 재출현률이 미래 적중력 또는 추가 확률을 입증하지 않습니다.',
    rows,numberRows};
}

export function makeWalkforward(draws){
  if(!Array.isArray(draws)||draws.length<30)throw Error('30회 이상 필요');
  const history=[];
  // 1회는 이전 회차가 없으므로 2회부터 오직 사전 자료로 재검사.
  for(let i=1;i<draws.length;i++){
    const prior=draws.slice(0,i),won=new Set(draws[i].numbers),axes={};
    const sets=prior.map(d=>new Set(d.numbers));
    for(const [key] of AXES)axes[key]={selected:[],hits:[]};
    for(let n=1;n<=45;n++){
      const flags=priorFlags(prior,n,sets);
      for(const key of flags){
        axes[key].selected.push(n);
        if(won.has(n))axes[key].hits.push(n);
      }
    }
    history.push({round:draws[i].draw_no,actual:draws[i].numbers,axes});
  }
  const split=Math.max(1,Math.floor(history.length*.8));
  const train=history.slice(0,split),late=history.slice(split);
  const rows=AXES.map(([key,label])=>({key,label,
    early:summarize(train,key),late:summarize(late,key),verdict:'무작위와 구별 어려움'}));
  // 최근 구간의 유리·불리 22개 동시 비교를 Holm 방식으로 보정.
  const tests=rows.flatMap(row=>[
    {value:row.late.pBetter,row,field:'pBetterAdjusted'},
    {value:row.late.pWorse,row,field:'pWorseAdjusted'}
  ]).sort((a,b)=>a.value-b.value);
  let previous=0;
  tests.forEach((item,i)=>{
    previous=Math.max(previous,Math.min(1,item.value*(tests.length-i)));
    item.row.late[item.field]=Number(previous.toFixed(8));
  });
  for(const row of rows){
    const e=row.early,l=row.late;
    row.verdict=l.selected<30?'선택 건수 부족':
      l.pBetterAdjusted<.05&&e.delta>0?'후반 구간 초과 · 실제 사전검증 필요':
      l.pWorseAdjusted<.05&&e.delta<0?'후반 구간 저조 · 실제 사전검증 필요':
      '무작위와 구별 어려움';
  }
  const environment=makeContextReview(draws,history,split);
  const followupReview=makeFollowupReview(draws,history);
  return {version:1,origin:'historical-walkforward-reconstruction-only',
    firstTestRound:history[0].round,lastTestRound:history.at(-1).round,
    totalRounds:history.length,earlyRounds:train.length,lateRounds:late.length,
    earlyRange:[train[0].round,train.at(-1).round],
    lateRange:[late[0].round,late.at(-1).round],
    policy:'all-available-history-no-candidate-count-cap',
    benchmark:'same-number-count exact hypergeometric 6/45; Holm 22 late tests',
    caution:'과거 결과를 이미 알고 설계된 조건의 시점별 재현입니다. 실제 추첨 전 저장 기록이 아니며 미래 적중력의 증거가 아닙니다.',
    rows,environment,followupReview,examples:history.slice(-8)};
}

async function main(){
  const res=await fetch(SOURCE,{cache:'no-store',signal:AbortSignal.timeout(45000)});
  if(!res.ok)throw Error('당첨 이력 HTTP '+res.status);
  const draws=normalizeDraws(await res.json());
  const scanFile=JSON.parse(fs.readFileSync(SCANS,'utf8'));
  const latest=scanFile.records?.at(-1);
  if(latest&&latest.round===draws.length+1) {
    auditAgainstSavedSnapshot(draws,latest);
    console.log(`${latest.round}회 사전 저장 45수/11축과 역사 복원 알고리즘 100% 일치`);
  }
  const report=makeWalkforward(draws);
  fs.writeFileSync(OUTPUT,JSON.stringify(report,null,2)+'\n','utf8');
  console.log(`과거 전 구간 복원 완료: ${report.totalRounds}회, 최근 ${report.lateRounds}회 별도 검증, 사전 실전 0회와 분리`);
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  main().catch(e=>{console.error(e);process.exitCode=1;});
}
