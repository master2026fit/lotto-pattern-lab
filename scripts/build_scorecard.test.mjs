import assert from 'node:assert/strict';
import test from 'node:test';
import { hypergeometric45, exactChanceTail, buildScorecard } from './build_scorecard.mjs';

test('동일 개수 무작위의 정확한 분포 합은 100%', () => {
  for (const k of [0,1,6,12,33,39,45]) {
    const p = hypergeometric45(k);
    assert.ok(Math.abs(p.reduce((a,b)=>a+b,0) - 1)<1e-10);
    assert.ok(Math.abs(p.reduce((a,prob,hits)=>a+hits*prob,0) - k*6/45)<1e-8);
  }
});

test('모든 번호를 고르면 6개 적중이 당연하므로 우수 판정 불가', () => {
  const result = exactChanceTail([45],6);
  assert.equal(result.better,1);
  assert.equal(result.worse,1);
});

test('초기 실전 데이터 0회: 어떤 조건도 좋은 패턴이라고 판정하지 않음', () => {
  const result = buildScorecard([],[]);
  assert.equal(result.verifiedRounds,0);
  assert.equal(result.rows.length,12);
  assert.ok(result.rows.every(r=>r.verdict==='표본 부족'));
});

test('45수를 매회 전부 선정하면 31회 연속 당첨 6개여도 우위가 아님', () => {
  const scans=[],reviews=[];
  const all=Array.from({length:45},(_,i)=>i+1);
  for(let i=0;i<31;i++){
    const round=1000+i,cutoff=Date.UTC(2002,11,7,11,30)+(round-1)*604800000;
    const at=new Date(cutoff-86400000).toISOString();
    scans.push({round,sourceRound:round-1,createdAt:at,
      scope:'all45',candidatePolicy:'dynamic-unlimited-v2',candidatePool:all,
      rows:all.map(n=>({n,basic:1,connected:0,flags:[],moduleIds:[]})),review:null});
    reviews.push({round,sourceRound:round-1,predrawAt:at,
      provenance:'predraw-snapshot-and-online-draw',generatedAt:new Date(cutoff+86400000).toISOString(),
      candidateCount:45,actual:[1,2,3,4,5,6],bonus:7,
      selectedHit:[1,2,3,4,5,6],missed:[],
      axes:[
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
      ].map(([key,label])=>({key,label,total:0,hits:0,misses:0,escaped:6}))});
  }
  const result=buildScorecard(scans,reviews),pool=result.rows[0];
  assert.equal(result.verifiedRounds,31);
  assert.equal(pool.hits,31*6);
  assert.equal(pool.expectedHits,31*6);
  assert.equal(pool.pBetter,1);
  assert.equal(pool.verdict,'무작위 범위 · 구별 어려움');
});
