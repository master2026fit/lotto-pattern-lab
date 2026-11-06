import test from 'node:test';
import assert from 'node:assert/strict';
import { buildConnections, validateForecast, mergeForecasts, mergeReviews,
  FORECAST_POLICY, REVIEW_POLICY } from './connection_ledger.mjs';

const draws = Array.from({ length: 8 }, (_, i) => ({ draw_no: i + 1,
  numbers: [i + 1, 10, 20, 30, 40, 45] }));
const at = '2003-01-26T03:00:00.000Z';
const empty = { version: 1, policy: FORECAST_POLICY, records: [] };
const emptyReviews = { version: 1, policy: REVIEW_POLICY, records: [] };

test('이전 회차 번호만 사용하여 앞으로 24회 이내 4점 연결을 저장한다', () => {
  const rows = buildConnections(draws, at);
  assert.ok(rows.length > 0);
  assert.ok(rows.every(validateForecast));
  assert.ok(rows.every(row => row.target > 8 && row.target <= 32));
  assert.ok(rows.every(row => row.steps.every(step => step.round <= 8)));
  const one = rows.find(row => row.target === 9 && row.gap === 1 && row.shift === 1 && row.next === 9);
  assert.ok(one);
  assert.equal(one.flow, '1-1-1-1');
});

test('실제로 저장된 최초 연결을 다음 주에 고쳐 쓰지 않는다', () => {
  const first = buildConnections(draws, at).slice(0, 5);
  const once = mergeForecasts(empty, first);
  assert.equal(once.added, 5);
  const twice = mergeForecasts(once.document, first.map(p => ({ ...p, createdAt: '2003-01-27T03:00:00Z' })));
  assert.equal(twice.added, 0);
  assert.deepEqual(twice.document.records, once.document.records);
  assert.throws(() => mergeForecasts(once.document, [{ ...first[0], sourceRound: first[0].target }]));
});

test('발표 전 복기 거부 · 발표 후 원본을 고정하고 당첨 결과 변경 거부', () => {
  const forecast = [{ target: 9 }];
  const actual = [1, 9, 16, 22, 35, 43];
  const review = { round: 9, actual, generatedAt: '2003-02-01T13:20:00Z',
    provenance: 'predraw-snapshot-and-online-draw' };
  assert.throws(() => mergeReviews(emptyReviews, [{ ...review,
    generatedAt: '2003-02-01T10:00:00Z' }], forecast));
  const graded = mergeReviews(emptyReviews, [review], forecast);
  assert.equal(graded.added, 1);
  assert.equal(mergeReviews(graded.document, [review], forecast).added, 0);
  assert.throws(() => mergeReviews(graded.document, [{...review, actual: [1, 8, 16, 22, 35, 43]}], forecast));
});

test('같은 회차·번호를 중복 연결에서 여러 번 세더라도 기록 키는 보존한다', () => {
  const rows = buildConnections(draws, at);
  const merged = mergeForecasts(empty, rows);
  assert.equal(merged.document.records.length, new Set(rows.map(r =>
    [r.target,r.next,r.gap,r.shift].join(':'))).size);
});
