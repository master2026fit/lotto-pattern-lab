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
  return {version:1,origin:'historical-walkforward-reconstruction-only',
    firstTestRound:history[0].round,lastTestRound:history.at(-1).round,
    totalRounds:history.length,earlyRounds:train.length,lateRounds:late.length,
    earlyRange:[train[0].round,train.at(-1).round],
    lateRange:[late[0].round,late.at(-1).round],
    policy:'all-available-history-no-candidate-count-cap',
    benchmark:'same-number-count exact hypergeometric 6/45; Holm 22 late tests',
    caution:'과거 결과를 이미 알고 설계된 조건의 시점별 재현입니다. 실제 추첨 전 저장 기록이 아니며 미래 적중력의 증거가 아닙니다.',
    rows,examples:history.slice(-8)};
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
