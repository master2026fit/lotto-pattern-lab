import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExclusionBacktest, seededTickets, weakAxesForRound } from './build_exclusion_backtest.mjs';

const keys = ['neighbor1','neighbor2','ending','bonus','carry','miss5',
  'neighborTwice','sameSlot','fixedCycle','diagonal','context2plus'];

test('5 games are the frozen first five of the 10 unique, valid tickets', () => {
  const pool = Array.from({ length: 25 }, (_, i) => i + 1);
  const a = seededTickets(pool, 21756);
  assert.equal(a.length, 10);
  assert.equal(new Set(a.map(row => row.join(','))).size, 10);
  for (const row of a) {
    assert.equal(row.length, 6);
    assert.equal(new Set(row).size, 6);
    assert.ok(row.every(n => pool.includes(n)));
  }
  assert.deepEqual(seededTickets(pool, 21756, 5), a.slice(0, 5));
});

test('the target round is not used to choose historically weak axes', () => {
  const selected = Array.from({ length: 11 }, () => new Uint32Array(503));
  const hits = Array.from({ length: 11 }, () => new Uint32Array(503));
  for (let r = 1; r <= 502; r++) {
    selected[0][r] = r * 10;
    hits[0][r] = r;
  }
  assert.deepEqual(weakAxesForRound(501, selected, hits), [0]);
  // Alter only round 501 and later; round 501's forecast must not change.
  selected[0][501] = 999999;
  hits[0][501] = 999999;
  selected[0][502] = 999999;
  hits[0][502] = 999999;
  assert.deepEqual(weakAxesForRound(501, selected, hits), [0]);
});

test('one-round backtest returns two exclusions and both 5/10-arm benchmarks', () => {
  const draws = Array.from({ length: 501 }, (_, index) => ({
    draw_no: index + 1,
    numbers: Array.from({ length: 6 }, (_, i) => ((index * 3 + i * 7) % 45) + 1),
    bonus_no: 1
  }));
  const cases = { version: 1, method: 'postdraw-only-packed-all-history',
    latestRound: 501, axisKeys: keys,
    numbers: Array.from({ length: 45 }, (_, i) => ({ n: i + 1, cases: [] })) };
  // The packed historical ledger includes winning numbers with zero pattern flags.
  const winningWithoutFlags = draws.at(-1).numbers[0];
  cases.numbers[winningWithoutFlags - 1].cases.push([501, 0, 1, null]);
  const report = buildExclusionBacktest(cases, draws, { replications: 4, keep: 1 });
  assert.equal(report.asOfDraw, 501);
  assert.equal(report.rounds.length, 1);
  assert.deepEqual(report.rounds[0].weak, []);
  for (const overlap of [2, 3]) {
    const row = report.rounds[0].variants[String(overlap)];
    assert.deepEqual(row.excluded, []);
    assert.equal(row.survivorCount, 45);
    assert.equal(row.tickets.length, 10);
    assert.ok(row.benchmark['5'].ge3 >= 0);
    assert.ok(row.benchmark['10'].ge3 >= 0);
  }
});
