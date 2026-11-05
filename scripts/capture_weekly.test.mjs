import assert from 'node:assert/strict';
import test from 'node:test';
import { validateSnapshot, mergeSnapshot } from './capture_weekly.mjs';

const example = round => ({
  round, sourceRound: round - 1, createdAt: '2026-11-04T03:00:00.000Z',
  scope: 'all45', candidatePolicy: 'dynamic-unlimited-v2',
  candidatePool: [9, 34, 37, 39, 43, 44], review: null,
  rows: Array.from({ length: 45 }, (_, i) => ({
    n: i + 1, basic: 0, connected: 0, flags: [], moduleIds: []
  }))
});

test('45수 기록과 가변 후보 수를 모두 허용', () => {
  assert.equal(validateSnapshot(example(1250), 1250), true);
  const all = example(1250); all.candidatePool = Array.from({ length: 45 }, (_, i) => i + 1);
  assert.equal(validateSnapshot(all), true);
});

test('사후 복기·중복 번호·누락 번호는 거부', () => {
  const reviewed = example(1250); reviewed.review = { actual: [1, 2, 3, 4, 5, 6] };
  assert.equal(validateSnapshot(reviewed), false);
  const duplicate = example(1250); duplicate.rows[44].n = 1;
  assert.equal(validateSnapshot(duplicate), false);
  const short = example(1250); short.rows.pop();
  assert.equal(validateSnapshot(short), false);
});

test('선행 저장분은 덮어쓰지 않고 새 회차만 추가', () => {
  const old = example(1249), next = example(1250);
  const first = mergeSnapshot({ version: 1, records: [old] }, next);
  assert.deepEqual(first.document.records.map(x => x.round), [1249, 1250]);
  const repeated = mergeSnapshot(first.document, { ...next, candidatePool: [1] });
  assert.equal(repeated.changed, false);
  assert.deepEqual(repeated.document.records[1].candidatePool, next.candidatePool);
});

test('새 사전 원장의 3회 출현 자리 증거를 검증하고 기존 원장도 보존', () => {
  const old = example(1249);
  assert.equal(validateSnapshot(old), true, '기존 1249회 사전 원장 유지');
  const next = example(1250);
  next.slotTrailPolicy = 'same-number-3-last-positions-v1';
  next.rows.forEach(row => {
    row.slotTrail = [{ round: 100, slot: 6 }, { round: 110, slot: 3 }, { round: 1249, slot: 1 }];
  });
  assert.equal(validateSnapshot(next), true);
  const merged = mergeSnapshot({ version: 1, records: [old] }, next).document;
  assert.equal(merged.records[0].slotTrailPolicy, undefined, '기존 기록 변경 금지');
  assert.equal(merged.records[1].slotTrailPolicy, 'same-number-3-last-positions-v1');
  const future = structuredClone(next);
  future.rows[0].slotTrail[2].round = 1250;
  assert.equal(validateSnapshot(future), false, '미래 회차 출현 근거 거부');
  const wrongOrder = structuredClone(next);
  wrongOrder.rows[1].slotTrail[1].round = 99;
  assert.equal(validateSnapshot(wrongOrder), false, '회차 순서 역전 거부');
  const missing = structuredClone(next);
  delete missing.rows[2].slotTrail;
  assert.equal(validateSnapshot(missing), false, '새 원장의 자리 증거 누락 거부');
});
