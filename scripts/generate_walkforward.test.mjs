import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDraws, priorFlags, makeWalkforward, auditAgainstSavedSnapshot } from './generate_walkforward.mjs';

function fakeDraws(count=52){
  return Array.from({length:count},(_,i)=>{
    const numbers=Array.from({length:6},(_,j)=>((i*7+j*5)%45)+1).sort((a,b)=>a-b);
    const bonus=Array.from({length:45},(_,j)=>j+1).find(n=>!numbers.includes(n));
    return {draw_no:i+1,numbers,bonus_no:bonus};
  });
}

test('1회부터 모든 회차 번호 정합성 점검',()=>{
  const d=normalizeDraws(fakeDraws());
  assert.equal(d.length,52);
  assert.throws(()=>normalizeDraws([...d.slice(1)]),/검증 실패/);
});

test('미래 회차 결과를 바꿔도 해당 회차 사전 판정은 불변',()=>{
  const d=fakeDraws(),prior=d.slice(0,31);
  const before=Array.from({length:45},(_,i)=>priorFlags(prior,i+1));
  d[31].numbers=[1,2,3,4,5,6];
  d[32].numbers=[8,9,10,11,12,13];
  const after=Array.from({length:45},(_,i)=>priorFlags(d.slice(0,31),i+1));
  assert.deepEqual(before,after);
});

test('과거 복원은 사전 실전 성적과 분리하며 11개 축/후반 테스트 유지',()=>{
  const report=makeWalkforward(fakeDraws(52));
  assert.equal(report.origin,'historical-walkforward-reconstruction-only');
  assert.equal(report.totalRounds,51);
  assert.equal(report.rows.length,11);
  assert.equal(report.earlyRounds+report.lateRounds,51);
  assert.ok(report.rows.every(r=>r.late.pBetterAdjusted>=0&&r.late.pBetterAdjusted<=1));
  assert.ok(report.rows.every(r=>r.late.pWorseAdjusted>=0&&r.late.pWorseAdjusted<=1));
  assert.equal(report.examples.length,8);
});

test('서버가 저장한 평가축과 복원 결과가 다르면 중단',()=>{
  const d=fakeDraws(),rows=Array.from({length:45},(_,i)=>({n:i+1,flags:priorFlags(d,i+1)}));
  const original={round:53,sourceRound:52,rows};
  assert.doesNotThrow(()=>auditAgainstSavedSnapshot(d,original));
  rows[0].flags=[];
  if(priorFlags(d,1).length===0)rows[0].flags=['neighbor1'];
  assert.throws(()=>auditAgainstSavedSnapshot(d,original),/조건 불일치/);
});
