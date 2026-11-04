import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSnapshot } from './capture_weekly.mjs';

const INPUT_SCANS = path.resolve('data/weekly_scans.json');
const INPUT_REVIEWS = path.resolve('data/weekly_reviews.json');
const OUTPUT = path.resolve('data/pattern_scorecard.json');
const MIN_ROUNDS = 30;
const BASE_RATE = 6 / 45;
const FIRST_DRAW_CUTOFF_UTC = Date.UTC(2002, 11, 7, 11, 30);
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const AXES = [
  { key: 'neighbor1', label: '직전 회차 ±1 이웃수 존재' },
  { key: 'neighbor2', label: '직전 회차 ±2 이웃수 존재' },
  { key: 'ending', label: '직전 회차 다른 같은 끝수 존재' },
  { key: 'bonus', label: '직전 회차 보너스가 해당 번호' },
  { key: 'carry', label: '직전 회차 해당 번호 본번호 출현' },
  { key: 'miss5', label: '최근 5회 해당 번호 미출현 중' },
  { key: 'neighborTwice', label: '직전 3회 중 ±1 이웃수 2회 이상' },
  { key: 'sameSlot', label: '해당 번호 최근 두 번 같은 자리' },
  { key: 'fixedCycle', label: '4단계 이상 고정 회차간격' },
  { key: 'diagonal', label: '4단계 이상 사선 연결' },
  { key: 'context2plus', label: '직전 상황 2개 이상 교집합' }
];

function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= k; i++) result = result * (n - k + i) / i;
  return result;
}

// 공정한 6/45 추첨에서 임의의 k개 후보와 일치하는 개수의 정확한 분포.
export function hypergeometric45(k) {
  if (!Number.isInteger(k) || k < 0 || k > 45) throw new Error('후보 수는 0~45여야 합니다.');
  const denominator = choose(45, k);
  const probabilities = Array.from({ length: 7 }, (_, hits) =>
    choose(6, hits) * choose(39, k - hits) / denominator);
  const total = probabilities.reduce((a, b) => a + b, 0);
  return probabilities.map(p => p / total);
}

export function exactChanceTail(sizes, observedHits) {
  if (!Array.isArray(sizes) || sizes.some(k => !Number.isInteger(k) || k < 0 || k > 45) ||
      !Number.isInteger(observedHits) || observedHits < 0 || observedHits > sizes.length * 6) {
    throw new Error('무작위 비교 분포 입력이 올바르지 않습니다.');
  }
  let distribution = [1];
  for (const size of sizes) {
    const draw = hypergeometric45(size);
    const next = new Array(distribution.length + 6).fill(0);
    for (let i = 0; i < distribution.length; i++) {
      for (let hit = 0; hit <= 6; hit++) next[i + hit] += distribution[i] * draw[hit];
    }
    distribution = next;
  }
  const better = distribution.slice(observedHits).reduce((a, b) => a + b, 0);
  const worse = distribution.slice(0, observedHits + 1).reduce((a, b) => a + b, 0);
  return { better: Math.min(1, Math.max(0, better)), worse: Math.min(1, Math.max(0, worse)) };
}

function sameSet(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length &&
    a.every(x => b.includes(x)) && new Set(a).size === a.length;
}

export function validatePair(scan, review) {
  if (!validateSnapshot(scan) || !review ||
    Date.parse(scan.createdAt) >= FIRST_DRAW_CUTOFF_UTC + (scan.round - 1) * WEEK_MS ||
    review.round !== scan.round || review.sourceRound !== scan.sourceRound ||
    review.predrawAt !== scan.createdAt ||
    typeof review.generatedAt !== 'string' ||
    !Number.isFinite(Date.parse(review.generatedAt)) ||
    Date.parse(review.generatedAt) < FIRST_DRAW_CUTOFF_UTC + (scan.round - 1) * WEEK_MS ||
    review.provenance !== 'predraw-snapshot-and-online-draw' ||
    !Number.isInteger(review.candidateCount) ||
    review.candidateCount !== scan.candidatePool.length ||
    !Array.isArray(review.actual) || review.actual.length !== 6 ||
    !review.actual.every(n => Number.isInteger(n) && n >= 1 && n <= 45) ||
    new Set(review.actual).size !== 6 ||
    !Number.isInteger(review.bonus) || review.bonus < 1 || review.bonus > 45 ||
    review.actual.includes(review.bonus) ||
    !sameSet(review.selectedHit, review.actual.filter(n => scan.candidatePool.includes(n))) ||
    !sameSet(review.missed, review.actual.filter(n => !scan.candidatePool.includes(n))) ||
    !Array.isArray(review.axes) || review.axes.length !== AXES.length) return false;
  for (const axis of AXES) {
    const item = review.axes.find(a => a.key === axis.key);
    if (!item || item.label !== axis.label) return false;
    const group = scan.rows.filter(row => row.flags.includes(axis.key));
    const hits = group.filter(row => review.actual.includes(row.n)).length;
    if (item.total !== group.length || item.hits !== hits ||
      item.misses !== group.length - hits || item.escaped !== 6 - hits) return false;
  }
  return true;
}

export function buildScorecard(scans, reviews) {
  if (!Array.isArray(scans) || !Array.isArray(reviews)) throw new Error('기록 목록이 필요합니다.');
  const byRound = new Map(scans.map(s => [s.round, s]));
  if (byRound.size !== scans.length || new Set(reviews.map(r => r.round)).size !== reviews.length)
    throw new Error('중복 회차가 발견됐습니다.');
  for (const s of scans) if (!validateSnapshot(s)) throw new Error(`${s.round}회 사전 기록 오류`);
  const pairs = reviews.map(r => ({ scan: byRound.get(r.round), review: r }));
  for (const pair of pairs) if (!validatePair(pair.scan, pair.review))
    throw new Error(`${pair.review.round}회 복기 원본 검증 실패`);

  const groups = [
    { key: 'researchPool', label: '검출 연구후보 전체(가변)', isPool: true },
    ...AXES.map(axis => ({ ...axis, isPool: false }))
  ];
  const rows = groups.map(g => {
    const rounds = pairs.map(({ scan, review }) => {
      const numbers = g.isPool ? scan.candidatePool :
        scan.rows.filter(row => row.flags.includes(g.key)).map(row => row.n);
      return { selected: numbers.length, hits: numbers.filter(n => review.actual.includes(n)).length };
    });
    const chosen = rounds.reduce((sum, r) => sum + r.selected, 0);
    const hits = rounds.reduce((sum, r) => sum + r.hits, 0);
    const expected = rounds.reduce((sum, r) => sum + r.selected * BASE_RATE, 0);
    const { better, worse } = exactChanceTail(rounds.map(r => r.selected), hits);
    return {
      key: g.key, label: g.label, verifiedRounds: pairs.length,
      selected: chosen, hits, falseAlarm: chosen - hits,
      missedWinners: 6 * pairs.length - hits,
      expectedHits: Number(expected.toFixed(6)),
      observedRate: chosen ? Number((hits / chosen).toFixed(6)) : null,
      randomRate: Number(BASE_RATE.toFixed(6)),
      deltaHits: Number((hits - expected).toFixed(6)),
      pBetter: better, pWorse: worse,
      pBetterAdjusted: 1, pWorseAdjusted: 1,
      verdict: '평가 대기'
    };
  });
  // 12개 항목 × 유리·불리 2방향: 24개 비교를 함께 보정한다.
  const flat = rows.flatMap(row => [
    { row, p: row.pBetter, key: 'pBetterAdjusted' },
    { row, p: row.pWorse, key: 'pWorseAdjusted' }
  ]).sort((a,b) => a.p - b.p);
  let running = 0;
  for (let i = 0; i < flat.length; i++) {
    running = Math.max(running, Math.min(1, flat[i].p * (flat.length - i)));
    flat[i].row[flat[i].key] = Number(running.toFixed(8));
  }
  for (const row of rows) {
    row.verdict = pairs.length < MIN_ROUNDS || row.selected < 30 ? '표본 부족' :
      row.pBetterAdjusted < 0.05 ? '무작위 대비 초과 · 추가 검증' :
      row.pWorseAdjusted < 0.05 ? '무작위 대비 저조 · 추가 검증' :
      '무작위 범위 · 구별 어려움';
  }
  const lastRound = reviews.length ? Math.max(...reviews.map(r => r.round)) : null;
  return {
    version: 1, policy: 'prospective-unaltered-v1',
    lastReviewedRound: lastRound, verifiedRounds: pairs.length,
    minimumRoundsForInterpretation: MIN_ROUNDS,
    baseline: '6/45 matched-selection hypergeometric exact test',
    correction: 'Holm family-wise correction across 24 directional tests',
    generatedFrom: lastRound ? reviews.find(r => r.round === lastRound).generatedAt : null,
    rows
  };
}

function main() {
  const scanFile = JSON.parse(fs.readFileSync(INPUT_SCANS, 'utf8'));
  const reviewFile = JSON.parse(fs.readFileSync(INPUT_REVIEWS, 'utf8'));
  if (scanFile.version !== 1 || reviewFile.version !== 1)
    throw new Error('주간 기록 파일 버전이 다릅니다.');
  const output = buildScorecard(scanFile.records, reviewFile.records);
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + '\n', 'utf8');
  console.log(`사전 검증 성적표 계산 완료: 실전 복기 ${output.verifiedRounds}회, 정해진 12수 제한 없음`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (err) { console.error(err); process.exitCode = 1; }
}
