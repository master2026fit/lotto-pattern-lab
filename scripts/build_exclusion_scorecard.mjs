import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exactChanceTail, validatePair } from './build_scorecard.mjs';
import { validateExclusionSnapshot } from './build_exclusion_snapshot.mjs';

function choose(n,k) {
  if (k<0 || k>n) return 0;
  let result=1;
  for (let i=1;i<=k;i++) result=result*(n-i+1)/i;
  return result;
}

export function buildExclusionScorecard(scans,exclusionSnapshots,reviews) {
  if (![scans,exclusionSnapshots,reviews].every(Array.isArray))
    throw new Error('연구 원장 3종이 필요합니다.');
  const byScan=new Map(scans.map(r=>[r.round,r]));
  const byReview=new Map(reviews.map(r=>[r.round,r]));
  if (byScan.size!==scans.length || byReview.size!==reviews.length ||
    new Set(exclusionSnapshots.map(r=>r.round)).size!==exclusionSnapshots.length)
    throw new Error('중복 회차 원장을 발견했습니다.');
  const pairs=[];
  for (const item of exclusionSnapshots) {
    const scan=byScan.get(item.round);
    if (!validateExclusionSnapshot(item,scan)) throw new Error(`${item.round}회 제외수 사전기록 무결성 실패`);
    const review=byReview.get(item.round);
    if (!review) continue;
    if (!validatePair(scan,review)) throw new Error(`${item.round}회 당첨 후 원본 복기 검증 실패`);
    pairs.push({item,review});
  }
  const last=pairs.at(-1);
  const rows=[2,3].map((overlap,i)=>{
    const rounds=pairs.map(({item,review})=>{
      const c=item.variants[i].candidates.map(x=>x.n);
      const excludedWinners=c.filter(n=>review.actual.includes(n));
      return {round:item.round,excluded:c.length,excludedWinners,
        survived:6-excludedWinners.length,fullySurvived:excludedWinners.length===0};
    });
    const excluded=rounds.reduce((s,r)=>s+r.excluded,0);
    const won=rounds.reduce((s,r)=>s+r.excludedWinners.length,0);
    const expected=excluded*6/45;
    const tail=exactChanceTail(rounds.map(r=>r.excluded),won);
    return {overlap,verifiedRounds:rounds.length,excluded,excludedWinningNumbers:won,
      randomExpectedExcludedWinners:Number(expected.toFixed(6)),
      delta:Number((won-expected).toFixed(6)),
      fullySurvivedRounds:rounds.filter(r=>r.fullySurvived).length,
      randomExpectedFullySurvivedRounds:Number(rounds.reduce((s,r)=>s+choose(45-r.excluded,6)/choose(45,6),0).toFixed(6)),
      pFewer:tail.worse,pFewerAdjusted:1,verdict:'표본 부족',rounds};
  });
  // 두 가지 사전 고정 기준만 비교하며 최소 30회 전까지 승격하지 않는다.
  const sorted=rows.slice().sort((a,b)=>a.pFewer-b.pFewer);
  let max=0;
  sorted.forEach((row,i)=>{max=Math.max(max,row.pFewer*(sorted.length-i));row.pFewerAdjusted=Math.min(1,max);});
  for (const row of rows) {
    row.verdict=row.verifiedRounds<30 || row.excluded<30 ? '표본 부족' :
      row.pFewerAdjusted<0.05 ? '무작위보다 적게 제외 · 추가 미래 검증 필요' :
      '무작위와 구별 어려움';
  }
  return {version:1,policy:'prospective-exclusion-shadow-only-v1',
    minimumRoundsForInterpretation:30,verifiedRounds:pairs.length,
    lastReviewedRound:last?.item.round||null,
    generatedFrom:last?.review.generatedAt||null,
    benchmark:'matched-size hypergeometric lower tail; Holm correction for 2 preregistered overlaps',
    rows};
}

function main(){
  const read=name=>JSON.parse(fs.readFileSync(name,'utf8')).records;
  const output=buildExclusionScorecard(read('data/weekly_scans.json'),
    read('data/exclusion_scans.json'),read('data/weekly_reviews.json'));
  fs.writeFileSync('data/exclusion_scorecard.json',JSON.stringify(output,null,2)+'\n');
  console.log(`제외 연구 사전검증: 결과 확인 ${output.verifiedRounds}회 · 실제 조합 영향 없음`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try{main();}catch(err){console.error(err);process.exitCode=1;}
}
