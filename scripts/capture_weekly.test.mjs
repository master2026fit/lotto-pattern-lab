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
