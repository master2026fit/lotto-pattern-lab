/* LOTTO NOTE · 연구용 제외 후보: 사전 확정된 11개 조건만 사용. */
(function (root) {
  'use strict';
  const BASE = 6 / 45;
  const POLICY = 'two-period-below-base-overlap-2-3-v1';

  function choose(n, k) {
    if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return 0;
    let value = 1;
    for (let i = 1; i <= k; i++) value = value * (n - i + 1) / i;
    return value;
  }

  function safeRate(segment) {
    return segment && Number.isInteger(segment.selected) && segment.selected > 0 &&
      Number.isInteger(segment.hits) && segment.hits >= 0 && segment.hits <= segment.selected
      ? segment.hits / segment.selected : null;
  }

  function validateInputs(report, scan) {
    if (!report || report.version !== 1 ||
      report.origin !== 'historical-walkforward-reconstruction-only' ||
      !Number.isInteger(report.lastTestRound) || !Array.isArray(report.rows) || report.rows.length !== 11 ||
      !scan || scan.scope !== 'all45' || scan.sourceRound !== report.lastTestRound ||
      scan.round !== scan.sourceRound + 1 || !Array.isArray(scan.rows) || scan.rows.length !== 45)
      throw new Error('검증된 45수 원장과 같은 회차의 과거 검증표가 필요합니다.');
    const keys = new Set(), nums = new Set();
    for (const r of report.rows) {
      if (!r || typeof r.key !== 'string' || keys.has(r.key) || safeRate(r.early) === null ||
        safeRate(r.late) === null || !Number.isFinite(r.late.pWorseAdjusted) ||
        r.late.pWorseAdjusted < 0 || r.late.pWorseAdjusted > 1) throw new Error('조건별 근거가 불완전합니다.');
      keys.add(r.key);
    }
    for (const r of scan.rows) {
      if (!r || !Number.isInteger(r.n) || r.n < 1 || r.n > 45 || nums.has(r.n) ||
        !Array.isArray(r.flags) || r.flags.some(k => typeof k !== 'string' || !keys.has(k)))
        throw new Error('45수 사전 조건이 불완전합니다.');
      nums.add(r.n);
    }
  }

  function analyze(report, scan) {
    validateInputs(report, scan);
    const weak = report.rows.filter(r => r.early.selected >= 30 && r.late.selected >= 30 &&
      safeRate(r.early) < BASE && safeRate(r.late) < BASE)
      .map(r => ({key:r.key,label:r.label,earlySelected:r.early.selected,
        earlyHits:r.early.hits,lateSelected:r.late.selected,lateHits:r.late.hits,
        lateAdjustedP:r.late.pWorseAdjusted}));
    const verified = weak.filter(r => r.lateAdjustedP < 0.05);
    const matched = scan.rows.map(row => ({
      n:row.n,signals:weak.filter(signal => row.flags.includes(signal.key)).map(signal => signal.key)
    }));
    const variants = [2,3].map(overlap => {
      const candidates = matched.filter(row => row.signals.length >= overlap)
        .sort((a,b) => b.signals.length - a.signals.length || a.n - b.n);
      const count = candidates.length;
      return {overlap,candidates,count,remaining:45-count,
        expectedExcludedHits:count*BASE,
        allSixRemainRandom:choose(45-count,6)/choose(45,6)};
    });
    return {policy:POLICY,round:scan.round,sourceRound:scan.sourceRound,
      originalScanAt:scan.createdAt||null,weak,verified,variants};
  }

  const api = {BASE,POLICY,choose,analyze};
  root.LottoExclusionLab = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
