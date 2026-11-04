import assert from 'node:assert/strict';
import test from 'node:test';
import { summarizeVerifiedReview } from './generate_weekly_review.mjs';

const snapshot = {
  round: 1249, sourceRound: 1248, createdAt: '2026-11-04T03:00:00.000Z',
  scope: 'all45', candidatePolicy: 'dynamic-unlimited-v2',
  candidatePool: [9, 34, 37, 39, 43, 44], review: null,
  rows: Array.from({length:45},(_,i)=>({n:i+1,basic:0,connected:0,flags:[],moduleIds:[]}))
};
const data = {
  origin: '실제 사전 저장 기록', round:1249, sourceRound:1248,
  rows: snapshot.rows.map(({n,basic,connected,flags})=>({n,basic,connected,flags})),
  pool:snapshot.candidatePool,actual:[1,9,16,34,38,45],bonus:3,
  selectedHit:[9,34],missed:[1,16,38,45],
  axes:Array.from({length:11},(_,i)=>({key:'k'+i,label:'분석 '+i,total:0,hits:0,misses:0,escaped:6}))
};
const svg='<svg id="weeklyReviewSvg"></svg>';

test('실제 사전 기록 일치 시 45수 복기 요약 생성',()=>{
  const result=summarizeVerifiedReview(snapshot,data,svg);
  assert.deepEqual(result.selectedHit,[9,34]);
  assert.deepEqual(result.missed,[1,16,38,45]);
  assert.equal(result.candidateCount,6);
  assert.equal(result.axes.length,11);
});

test('사후 재계산으로 사전 기록 변경 시 거부',()=>{
  const altered={...data,rows:data.rows.map(r=>({...r}))};
  altered.rows[0].basic=5;
  assert.throws(()=>summarizeVerifiedReview(snapshot,altered,svg));
});

test('후보 밖 당첨을 적중으로 부풀리거나 시점 재현을 사전 기록으로 위장하면 거부',()=>{
  assert.throws(()=>summarizeVerifiedReview(snapshot,{...data,selectedHit:[1,9,34]},svg));
  assert.throws(()=>summarizeVerifiedReview(snapshot,{...data,origin:'과거 시점 재현 · 실제 저장 기록 아님'},svg));
});
