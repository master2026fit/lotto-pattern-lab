import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { makeExclusionSnapshot,validateExclusionSnapshot,mergeExclusionSnapshot } from './build_exclusion_snapshot.mjs';
import { buildExclusionScorecard } from './build_exclusion_scorecard.mjs';
const require=createRequire(import.meta.url);
const lab=require('../exclusion_lab.js');

const labels=[
  ['neighbor1','직전 회차 ±1 이웃수 존재'],['neighbor2','직전 회차 ±2 이웃수 존재'],
  ['ending','직전 회차 다른 같은 끝수 존재'],['bonus','직전 회차 보너스가 해당 번호'],
  ['carry','직전 회차 해당 번호 본번호 출현'],['miss5','최근 5회 해당 번호 미출현 중'],
  ['neighborTwice','직전 3회 중 ±1 이웃수 2회 이상'],['sameSlot','해당 번호 최근 두 번 같은 자리'],
  ['fixedCycle','4단계 이상 고정 회차간격'],['diagonal','4단계 이상 사선 연결'],
  ['context2plus','직전 상황 2개 이상 교집합']
];

function fixture(){
  const scan={round:1249,sourceRound:1248,scope:'all45',candidatePolicy:'dynamic-unlimited-v2',
    createdAt:'2026-11-04T09:20:07.476Z',captureSource:'scheduled-github-actions',
    candidatePool:Array.from({length:15},(_,i)=>i+1),review:null,
    rows:Array.from({length:45},(_,i)=>({n:i+1,basic:0,connected:0,moduleIds:[],
      flags:i<3?['neighbor1','neighbor2','neighborTwice']:i<5?['neighbor1','neighbor2']:[]}))};
  const report={version:1,origin:'historical-walkforward-reconstruction-only',lastTestRound:1248,
    rows:labels.map(([key,label])=>({key,label,
      early:{selected:100,hits:['neighbor1','neighbor2','neighborTwice'].includes(key)?10:20},
      late:{selected:50,hits:['neighbor1','neighbor2','neighborTwice'].includes(key)?5:10,pWorseAdjusted:0.4}}))};
  return {scan,report};
}

test('두 기간 모두 13.33%보다 낮은 조건만 연구용 후보에 반영',()=>{
  const {scan,report}=fixture(),result=lab.analyze(report,scan);
  assert.deepEqual(result.weak.map(s=>s.key),['neighbor1','neighbor2','neighborTwice']);
  assert.deepEqual(result.variants[0].candidates.map(s=>s.n),[1,2,3,4,5]);
  assert.deepEqual(result.variants[1].candidates.map(s=>s.n),[1,2,3]);
  assert.equal(result.verified.length,0);
});

test('추첨 전 기록만 허용하며 1249회 원장은 바꾸지 않음',()=>{
  const {scan,report}=fixture(),item=makeExclusionSnapshot(scan,report,'2026-11-05T01:00:00Z');
  assert.ok(validateExclusionSnapshot(item,scan));
  assert.throws(()=>makeExclusionSnapshot(scan,report,'2026-11-07T11:31:00Z'));
  assert.deepEqual(scan.candidatePool,Array.from({length:15},(_,i)=>i+1));
  const base={version:1,records:[]},merged=mergeExclusionSnapshot(base,item);
  assert.equal(merged.changed,true);
  assert.equal(mergeExclusionSnapshot(merged.document,item).changed,false);
});

test('저장 후보 번호나 조건을 사후 변조하면 거부',()=>{
  const {scan,report}=fixture(),item=makeExclusionSnapshot(scan,report,'2026-11-05T01:00:00Z');
  const altered=structuredClone(item);altered.variants[0].candidates[0].n=45;
  assert.equal(validateExclusionSnapshot(altered,scan),false);
  const shifted=structuredClone(item);shifted.createdAt='2026-11-08T00:00:00Z';
  assert.equal(validateExclusionSnapshot(shifted,scan),false);
});

test('공식 발표 전에는 제외 성적표가 0회로 남고 기계적으로 승격하지 않음',()=>{
  const {scan,report}=fixture(),item=makeExclusionSnapshot(scan,report,'2026-11-05T01:00:00Z');
  const p=buildExclusionScorecard([scan],[item],[]);
  assert.equal(p.verifiedRounds,0);
  assert.ok(p.rows.every(r=>r.verdict==='표본 부족'&&r.excluded===0&&r.pFewer===1));
});

test('추첨 후 실제 포함된 당첨번호를 정확히 세고 같은 제외 개수 기준과 비교',()=>{
  const {scan,report}=fixture(),item=makeExclusionSnapshot(scan,report,'2026-11-05T01:00:00Z');
  const actual=[1,6,7,8,9,10],picked=new Set(actual),pool=new Set(scan.candidatePool);
  const review={round:1249,sourceRound:1248,predrawAt:scan.createdAt,
    generatedAt:'2026-11-07T12:20:00Z',provenance:'predraw-snapshot-and-online-draw',
    candidateCount:scan.candidatePool.length,actual,bonus:11,
    selectedHit:actual.filter(n=>pool.has(n)),missed:actual.filter(n=>!pool.has(n)),
    axes:labels.map(([key,label])=>{
      const group=scan.rows.filter(row=>row.flags.includes(key));
      const hits=group.filter(row=>picked.has(row.n)).length;
      return {key,label,total:group.length,hits,misses:group.length-hits,escaped:6-hits};
    })};
  const p=buildExclusionScorecard([scan],[item],[review]);
  assert.equal(p.verifiedRounds,1);
  assert.equal(p.rows[0].excluded,5);
  assert.equal(p.rows[0].excludedWinningNumbers,1);
  assert.equal(p.rows[0].randomExpectedExcludedWinners,0.666667);
  assert.equal(p.rows[1].excluded,3);
  assert.equal(p.rows[1].fullySurvivedRounds,0);
  assert.equal(p.rows[1].verdict,'표본 부족');
});
