import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// One draw at a time: training ends at t-1. Never use the target result in a signal.
const SOURCE = 'https://smok95.github.io/lotto/results/all.json';
const CASES_FILE = 'data/historical_cases.json';
const OUTPUT_FILE = 'data/exclusion_backtest.json';
const START_ROUND = 501;
const LATE_WINDOW = 250;
const BASE_RATE = 6 / 45;
const REPLICATIONS = 256;
const ALL = Array.from({ length: 45 }, (_, i) => i + 1);

function random(seed) {
  let x = seed >>> 0;
  return () => {
    x += 0x6d2b79f5;
    let t = x;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sample(pool, rng, amount) {
  const values = pool.slice();
  for (let i = 0; i < amount; i++) {
    const j = i + Math.floor(rng() * (values.length - i));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values.slice(0, amount).sort((a, b) => a - b);
}

export function seededTickets(pool, seed, amount = 10) {
  if (!Array.isArray(pool) || new Set(pool).size !== pool.length || pool.length < 6)
    throw new Error('6개 이상의 중복 없는 번호 풀을 사용해야 합니다.');
  const rng = random(seed), seen = new Set(), tickets = [];
  let attempts = 0;
  while (tickets.length < amount && attempts++ < 5000) {
    const ticket = sample(pool, rng, 6), key = ticket.join(',');
    if (!seen.has(key)) { seen.add(key); tickets.push(ticket); }
  }
  if (tickets.length !== amount) throw new Error('고유 조합을 생성하지 못했습니다.');
  return tickets;
}

function matches(ticket, winnerSet) {
  return ticket.reduce((sum, n) => sum + Number(winnerSet.has(n)), 0);
}

export function weakAxesForRound(round, cumulativeSelected, cumulativeHits) {
  if (round < START_ROUND) throw new Error('학습 구간이 너무 짧습니다.');
  const split = round - LATE_WINDOW - 1;
  const axes = [];
  for (let axis = 0; axis < cumulativeSelected.length; axis++) {
    const early = cumulativeSelected[axis][split];
    const earlyHits = cumulativeHits[axis][split];
    const late = cumulativeSelected[axis][round - 1] - early;
    const lateHits = cumulativeHits[axis][round - 1] - earlyHits;
    if (early >= 30 && late >= 30 && earlyHits / early < BASE_RATE && lateHits / late < BASE_RATE)
      axes.push(axis);
  }
  return axes;
}

function summarize(rows, overlap, gameCount) {
  let excludedWinning = 0, randomExpectedExcluded = 0;
  let fullySurvived = 0, randomExpectedFullySurvived = 0;
  let ge3 = 0, ge4 = 0, ge5 = 0, randomExpectedGe3 = 0, randomExpectedGe4 = 0, randomExpectedGe5 = 0;
  for (const row of rows) {
    const trial = row.variants[String(overlap)], k = trial.excluded.length;
    excludedWinning += trial.excludedWinning.length;
    randomExpectedExcluded += k * BASE_RATE;
    fullySurvived += Number(trial.excludedWinning.length === 0);
    let probability = 1;
    for (let i = 0; i < 6; i++) probability *= (45 - k - i) / (45 - i);
    randomExpectedFullySurvived += probability;
    for (const ticket of trial.tickets.slice(0, gameCount)) {
      ge3 += Number(ticket.hits >= 3);
      ge4 += Number(ticket.hits >= 4);
      ge5 += Number(ticket.hits >= 5);
    }
    const baseline = trial.benchmark[String(gameCount)];
    randomExpectedGe3 += baseline.ge3;
    randomExpectedGe4 += baseline.ge4;
    randomExpectedGe5 += baseline.ge5;
  }
  const fixed = x => Number(x.toFixed(2));
  return { rounds: rows.length, excludedWinning, randomExpectedExcluded: fixed(randomExpectedExcluded),
    fullySurvived, randomExpectedFullySurvived: fixed(randomExpectedFullySurvived),
    tickets: gameCount, ge3, ge4, ge5, randomExpectedGe3: fixed(randomExpectedGe3),
    randomExpectedGe4: fixed(randomExpectedGe4), randomExpectedGe5: fixed(randomExpectedGe5) };
}

export function buildExclusionBacktest(caseIndex, rawDraws, options = {}) {
  const replications = options.replications ?? REPLICATIONS;
  const keep = options.keep ?? 250;
  if (!Number.isInteger(replications) || replications < 1 || !Number.isInteger(keep) || keep < 1)
    throw new Error('반복 횟수와 보관 회차는 양의 정수여야 합니다.');
  if (caseIndex?.version !== 1 || caseIndex.method !== 'postdraw-only-packed-all-history' ||
      !Array.isArray(caseIndex.axisKeys) || caseIndex.axisKeys.length !== 11 ||
      !Array.isArray(caseIndex.numbers) || caseIndex.numbers.length !== 45)
    throw new Error('기존 11개 조건이 포함된 역사 원장이 필요합니다.');
  const max = caseIndex.latestRound;
  if (!Number.isInteger(max) || max < START_ROUND || !Array.isArray(rawDraws))
    throw new Error('최소 501개 회차의 당첨번호가 필요합니다.');
  const draws = rawDraws.map(d => ({ round: Number(d.draw_no),
    numbers: (d.numbers || []).map(Number).sort((a, b) => a - b), bonus: Number(d.bonus_no) }))
    .sort((a, b) => a.round - b.round);
  if (draws.length !== max || draws.some((d, i) => d.round !== i + 1 || d.numbers.length !== 6 ||
      new Set(d.numbers).size !== 6 || d.numbers.some(n => !Number.isInteger(n) || n < 1 || n > 45)))
    throw new Error('원장과 당첨번호의 확정 회차가 일치하지 않습니다.');

  const masks = Array.from({ length: max + 1 }, () => new Uint16Array(46));
  for (const entry of caseIndex.numbers) {
    if (!Number.isInteger(entry.n) || entry.n < 1 || entry.n > 45 || !Array.isArray(entry.cases))
      throw new Error('번호별 패턴 기록이 불완전합니다.');
    for (const item of entry.cases) {
      const [round, bitmask, won] = item;
      if (!Number.isInteger(round) || round < 2 || round > max ||
          // Winning numbers without a pattern are also stored with mask=0.
          !Number.isInteger(bitmask) || bitmask < 0 || bitmask >= 1 << 11 ||
          (won !== 0 && won !== 1) || Number(draws[round - 1].numbers.includes(entry.n)) !== won)
        throw new Error('패턴 기록과 실제 본번호가 일치하지 않습니다.');
      masks[round][entry.n] = bitmask;
    }
  }
  const cumulativeSelected = Array.from({ length: 11 }, () => new Uint32Array(max + 1));
  const cumulativeHits = Array.from({ length: 11 }, () => new Uint32Array(max + 1));
  for (let round = 2; round <= max; round++) {
    const winnerSet = new Set(draws[round - 1].numbers);
    for (let axis = 0; axis < 11; axis++) {
      const bit = 1 << axis;
      let selected = 0, hits = 0;
      for (let n = 1; n <= 45; n++) if (masks[round][n] & bit) {
        selected++;
        hits += Number(winnerSet.has(n));
      }
      cumulativeSelected[axis][round] = cumulativeSelected[axis][round - 1] + selected;
      cumulativeHits[axis][round] = cumulativeHits[axis][round - 1] + hits;
    }
  }

  const rounds = [];
  for (let t = Math.max(START_ROUND, max - keep + 1); t <= max; t++) {
    const weak = weakAxesForRound(t, cumulativeSelected, cumulativeHits);
    const winning = draws[t - 1].numbers, winnerSet = new Set(winning);
    const row = { round: t, winning, bonus: draws[t - 1].bonus,
      weak: weak.map(axis => caseIndex.axisKeys[axis]), variants: {} };
    for (const overlap of [2, 3]) {
      const excluded = ALL.filter(n => weak.reduce((acc, axis) =>
        acc + Number(Boolean(masks[t][n] & (1 << axis))), 0) >= overlap);
      const excludedSet = new Set(excluded);
      const survivors = ALL.filter(n => !excludedSet.has(n));
      if (survivors.length < 6) throw new Error('6개 미만의 번호가 남았습니다.');
      const ticketRows = seededTickets(survivors,
        (Math.imul(t, 2654435761) ^ Math.imul(overlap, 2246822519) ^ 20261105) >>> 0)
        .map(numbers => ({ numbers, hits: matches(numbers, winnerSet) }));
      const benchmark = { '5': { ge3: 0, ge4: 0, ge5: 0, any3: 0, any4: 0 },
        '10': { ge3: 0, ge4: 0, ge5: 0, any3: 0, any4: 0 } };
      for (let rep = 0; rep < replications; rep++) {
        const seed = (Math.imul(t, 1597334677) ^ Math.imul(overlap, 3812015801) ^
          Math.imul(rep + 1, 2246822519)) >>> 0;
        const rng = random(seed);
        const omittedSet = new Set(sample(ALL, rng, excluded.length));
        const randomSurvivors = ALL.filter(n => !omittedSet.has(n));
        const randomTickets = seededTickets(randomSurvivors, (seed ^ 0x85ebca6b) >>> 0)
          .map(numbers => matches(numbers, winnerSet));
        for (const count of [5, 10]) {
          const hits = randomTickets.slice(0, count), b = benchmark[String(count)];
          b.ge3 += hits.filter(n => n >= 3).length / replications;
          b.ge4 += hits.filter(n => n >= 4).length / replications;
          b.ge5 += hits.filter(n => n >= 5).length / replications;
          b.any3 += Number(hits.some(n => n >= 3)) / replications;
          b.any4 += Number(hits.some(n => n >= 4)) / replications;
        }
      }
      for (const b of Object.values(benchmark)) for (const key of Object.keys(b))
        b[key] = Number(b[key].toFixed(5));
      row.variants[String(overlap)] = { excluded,
        excludedWinning: excluded.filter(n => winnerSet.has(n)),
        survivorCount: survivors.length, tickets: ticketRows, benchmark };
    }
    rounds.push(row);
  }
  const summary = {};
  for (const span of [30, 60, 120, 250]) for (const overlap of [2, 3])
    for (const gameCount of [5, 10]) if (rounds.length >= span)
      summary[`${span}_${overlap}_${gameCount}`] = summarize(rounds.slice(-span), overlap, gameCount);
  return { version: 1, asOfDraw: max,
    method: 'past-only-walkforward-weak-axis-two-segment-overlap-v1',
    config: { start: START_ROUND, early: '2..(t-251)', late: '(t-250)..(t-1)',
      minSelectedPerSegment: 30, weakCriterion: 'both < 6/45', overlap: [2, 3], games: [5, 10],
      baselineReplications: replications, seedVersion: 1,
      baseline: 'same exclusion count and ticket generator, random omitted numbers' },
    summary, rounds };
}

async function main() {
  const cases = JSON.parse(await fs.readFile(path.resolve(CASES_FILE), 'utf8'));
  const response = await fetch(SOURCE, { signal: AbortSignal.timeout(20000), cache: 'no-store' });
  if (!response.ok) throw new Error('당첨 이력 요청 실패: ' + response.status);
  const raw = await response.json();
  const result = buildExclusionBacktest(cases, raw);
  await fs.writeFile(path.resolve(OUTPUT_FILE), JSON.stringify(result) + '\n', 'utf8');
  console.log(`제외수 과거복기 ${result.rounds.length}회, 최신 ${result.asOfDraw}회 · 실전 구매 영향 없음`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]))
  main().catch(error => { console.error(error); process.exitCode = 1; });
