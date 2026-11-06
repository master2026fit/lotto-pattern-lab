/* LOTTO NOTE: immutable, pre-draw four-point connection ledger.
   A first-seen signal is never rewritten when later draws become available. */

export const FUTURE_WINDOW = 24;
export const FORECAST_POLICY = 'four-point-first-seen-24-rounds-v1';
export const REVIEW_POLICY = 'verified-weekly-result-v1';
const FIRST_CUTOFF = Date.UTC(2002, 11, 7, 11, 30);
const WEEK = 7 * 24 * 60 * 60 * 1000;
const uniqueNumbers = a => Array.isArray(a) && a.length === 6 &&
  a.every(n => Number.isInteger(n) && n >= 1 && n <= 45) && new Set(a).size === 6;
const cutoff = round => FIRST_CUTOFF + (round - 1) * WEEK;
export const signalKey = p => [p.target, p.next, p.gap, p.shift].join(':');

export function normalizeDraws(rows) {
  if (!Array.isArray(rows) || rows.length < 4) throw new Error('최소 4회의 당첨 원본 필요');
  const sorted = rows.map(r => ({ round: Number(r.draw_no ?? r.round),
    numbers: (r.numbers || []).map(Number).sort((a, b) => a - b) }))
    .sort((a, b) => a.round - b.round);
  for (let i = 0; i < sorted.length; i++) {
    if (!Number.isInteger(sorted[i].round) || !uniqueNumbers(sorted[i].numbers) ||
      (i && sorted[i].round !== sorted[i-1].round + 1))
      throw new Error('회차/번호가 연속된 실제 당첨 원본이 아닙니다.');
  }
  return sorted;
}

export function buildConnections(draws, createdAt, windowSize = FUTURE_WINDOW) {
  const sorted = normalizeDraws(draws), sourceRound = sorted.at(-1).round;
  const timestamp = Date.parse(createdAt);
  if (!Number.isFinite(timestamp) || timestamp < cutoff(sourceRound) ||
    timestamp >= cutoff(sourceRound + 1) ||
    !Number.isInteger(windowSize) || windowSize < 1 || windowSize > FUTURE_WINDOW)
    throw new Error('사전 저장 시각/미래 검증 기간이 올바르지 않습니다.');
  const byDraw = [], positions = [];
  for (const row of sorted) {
    byDraw[row.round] = new Set(row.numbers);
    positions[row.round] = new Map(row.numbers.map((n, i) => [n, i + 1]));
  }
  const rows = [];
  for (let target = sourceRound + 1; target <= sourceRound + windowSize; target++) {
    for (let gap = 1; gap * 4 < target; gap++) {
      const prev = byDraw[target - gap];
      if (!prev) continue;
      for (const last of prev) {
        for (let shift = -14; shift <= 14; shift++) {
          const next = last + shift;
          if (next < 1 || next > 45) continue;
          let count = 1;
          while (target - (count + 1) * gap >= 1 &&
            byDraw[target - (count + 1) * gap]?.has(last - count * shift)) count++;
          if (count < 4) continue;
          const steps = [4,3,2,1].map(k => {
            const round = target - k * gap, n = next - k * shift;
            return { round, n, slot: positions[round]?.get(n) || 0 };
          });
          if (steps.some(p => p.round > sourceRound || p.slot < 1 || p.slot > 6)) continue;
          rows.push({ target, next, gap, shift, count, sourceRound,
            createdAt, flow: steps.map(p => p.slot).join('-'), steps });
        }
      }
    }
  }
  return rows.sort((a, b) => a.target - b.target || a.next - b.next ||
    b.count - a.count || a.gap - b.gap || a.shift - b.shift);
}

export function validateForecast(p) {
  if (!p || ![p.target, p.next, p.gap, p.shift, p.count, p.sourceRound]
    .every(Number.isInteger) || p.target <= p.sourceRound ||
    p.target > p.sourceRound + FUTURE_WINDOW || p.sourceRound < 4 ||
    p.next < 1 || p.next > 45 || p.gap < 1 || p.shift < -14 || p.shift > 14 ||
    p.count < 4 || !Number.isFinite(Date.parse(p.createdAt)) ||
    Date.parse(p.createdAt) < cutoff(p.sourceRound) ||
    Date.parse(p.createdAt) >= cutoff(p.sourceRound + 1) ||
    !Array.isArray(p.steps) || p.steps.length !== 4 ||
    p.steps.some((s, i) => !s || !Number.isInteger(s.round) ||
      !Number.isInteger(s.n) || !Number.isInteger(s.slot) ||
      s.n < 1 || s.n > 45 || s.slot < 1 || s.slot > 6 ||
      s.round !== p.target - (4 - i) * p.gap ||
      s.n !== p.next - (4 - i) * p.shift || s.round > p.sourceRound) ||
    p.flow !== p.steps.map(x => x.slot).join('-')) return false;
  return true;
}

export function mergeForecasts(existing, incoming) {
  if (!existing || existing.version !== 1 || existing.policy !== FORECAST_POLICY ||
    !Array.isArray(existing.records)) throw new Error('기존 연결원장 형식 오류');
  if (!Array.isArray(incoming) || incoming.some(p => !validateForecast(p)))
    throw new Error('사전 연결원장 검증 실패');
  const seen = new Map();
  for (const row of existing.records) {
    if (!validateForecast(row) || seen.has(signalKey(row)))
      throw new Error('기존 사전 연결 기록이 손상되거나 중복되었습니다.');
    seen.set(signalKey(row), row);
  }
  let added = 0;
  for (const row of incoming) if (!seen.has(signalKey(row))) {
    seen.set(signalKey(row), row); added++;
  }
  return { added, document: { ...existing, records: [...seen.values()].sort((a, b) =>
    a.target - b.target || a.next - b.next || a.gap - b.gap || a.shift - b.shift) } };
}

export function mergeReviews(existing, weeklyReviews, forecasts) {
  if (!existing || existing.version !== 1 || existing.policy !== REVIEW_POLICY ||
    !Array.isArray(existing.records) || !Array.isArray(weeklyReviews) ||
    !Array.isArray(forecasts)) throw new Error('연결 복기 원장 형식 오류');
  const forecastRounds = new Set(forecasts.map(p => p.target));
  const seen = new Map();
  for (const row of existing.records) {
    if (!Number.isInteger(row.round) || !uniqueNumbers(row.actual) ||
      !Number.isFinite(Date.parse(row.verifiedAt)) ||
      Date.parse(row.verifiedAt) < cutoff(row.round) ||
      seen.has(row.round)) throw new Error('기존 검증 결과 변조/중복');
    seen.set(row.round, row);
  }
  let added = 0;
  for (const row of weeklyReviews) {
    if (!forecastRounds.has(row.round)) continue;
    if (!uniqueNumbers(row.actual) || !Number.isFinite(Date.parse(row.generatedAt)) ||
      Date.parse(row.generatedAt) < cutoff(row.round) ||
      row.provenance !== 'predraw-snapshot-and-online-draw')
      throw new Error('온라인 당첨 확정 기록 검증 실패');
    const old = seen.get(row.round);
    if (old) {
      if (old.actual.join(',') !== [...row.actual].sort((a,b)=>a-b).join(','))
        throw new Error('이미 확정한 회차의 결과를 덮어쓸 수 없습니다.');
      continue;
    }
    seen.set(row.round, { round: row.round, actual: [...row.actual].sort((a,b)=>a-b),
      verifiedAt: row.generatedAt, provenance: REVIEW_POLICY });
    added++;
  }
  return { added, document: { ...existing, records: [...seen.values()].sort((a,b) => a.round-b.round) } };
}
