import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_URL = 'https://master2026fit.github.io/lotto-pattern-lab/';
const OUTPUT_FILE = path.resolve('data/weekly_scans.json');

const numberSet = (items, minLength, maxLength) => Array.isArray(items) &&
  items.length >= minLength && items.length <= maxLength &&
  items.every(n => Number.isInteger(n) && n >= 1 && n <= 45) &&
  new Set(items).size === items.length;

export function validateSnapshot(record, currentRound) {
  if (!record || typeof record !== 'object' ||
    !Number.isInteger(record.round) || record.round < 1 || record.round > 5000 ||
    record.sourceRound !== record.round - 1 ||
    (currentRound !== undefined && record.round !== currentRound) ||
    record.scope !== 'all45' ||
    record.candidatePolicy !== 'dynamic-unlimited-v2' ||
    (record.slotTrailPolicy !== undefined &&
      record.slotTrailPolicy !== 'same-number-3-last-positions-v1') ||
    typeof record.createdAt !== 'string' || !Number.isFinite(Date.parse(record.createdAt)) ||
    !numberSet(record.candidatePool, 0, 45) ||
    !Array.isArray(record.rows) || record.rows.length !== 45 ||
    record.review !== null) return false;

  const numbers = new Set();
  for (const row of record.rows) {
    if (!row || !Number.isInteger(row.n) || row.n < 1 || row.n > 45 ||
      numbers.has(row.n) || !Number.isInteger(row.basic) || row.basic < 0 ||
      !Number.isInteger(row.connected) || row.connected < 0 ||
      !Array.isArray(row.flags) || row.flags.length > 11 ||
      row.flags.some(flag => typeof flag !== 'string' || flag.length > 50) ||
      new Set(row.flags).size !== row.flags.length ||
      (record.slotTrailPolicy === 'same-number-3-last-positions-v1' &&
        (!Array.isArray(row.slotTrail) || row.slotTrail.length !== 3 ||
          row.slotTrail.some((point, i) =>
            !point || !Number.isInteger(point.round) ||
            point.round < 1 || point.round > record.sourceRound ||
            !Number.isInteger(point.slot) || point.slot < 1 || point.slot > 6 ||
            (i > 0 && point.round <= row.slotTrail[i-1].round)))) ||
      !Array.isArray(row.moduleIds) || row.moduleIds.length > 16 ||
      row.moduleIds.some(id => !Number.isInteger(id) || id < 1 || id > 16)) return false;
    numbers.add(row.n);
  }
  return numbers.size === 45;
}

export function mergeSnapshot(document, record) {
  if (!document || document.version !== 1 || !Array.isArray(document.records))
    throw new Error('기존 주간 기록의 데이터 형식이 올바르지 않습니다.');
  if (!validateSnapshot(record)) throw new Error('45수 전체 스냅샷 검증 실패');
  if (document.records.some(item => item.round === record.round))
    return { changed: false, document };
  const sorted = [...document.records, record].sort((a, b) => a.round - b.round);
  return { changed: true, document: { version: 1, records: sorted.slice(-104) } };
}

function saturdayCutoffUtc(round) {
  // 로또 1회 추첨일(2002-12-07) 20:30 KST를 기준으로 7일 간격.
  return Date.UTC(2002, 11, 7, 11, 30) + (round - 1) * 7 * 24 * 60 * 60 * 1000;
}

async function main() {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ locale: 'ko-KR', timezoneId: 'Asia/Seoul' });
    page.on('pageerror', err => console.error('페이지 오류:', err.message));
    await page.goto(APP_URL + '?weekly-scan=' + Date.now(), {
      waitUntil: 'domcontentloaded', timeout: 60000
    });
    await page.waitForFunction(() => {
      return typeof state !== 'undefined' && state.source === '온라인' &&
        state.draws.length > 100 && state.profiles.length === 45 &&
        !state.loading;
    }, null, { timeout: 180000 });

    const result = await page.evaluate(() => {
      const round = upcoming(state.draws);
      captureFullScan();
      const record = fullScanBook().find(item => item.round === round) || null;
      return {
        round, latestRound: latest(state.draws).draw_no,
        source: state.source, drawCount: state.draws.length,
        inPredraw: beforeDrawCutoff(round), record
      };
    });

    if (!result.inPredraw || Date.now() >= saturdayCutoffUtc(result.round)) {
      console.log('추첨 시각 이후여서 사전 스냅샷 저장을 건너뜁니다.');
      return;
    }
    if (result.source !== '온라인' || result.round !== result.latestRound + 1 ||
      !validateSnapshot(result.record, result.round)) {
      throw new Error('온라인 회차·후보·45수 기록 검증 실패: ' +
        JSON.stringify({ round: result.round, latest: result.latestRound, source: result.source }));
    }
    // 화면 로딩이 추첨 마감에 걸쳤다면 기록을 버린다.
    if (Date.parse(result.record.createdAt) >= saturdayCutoffUtc(result.round)) {
      console.log('기록 생성 시점이 추첨 마감 이후라 저장하지 않습니다.');
      return;
    }
    const data = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    const { changed, document } = mergeSnapshot(data, {
      ...result.record,
      captureSource: 'scheduled-github-actions'
    });
    if (!changed) {
      console.log(`${result.round}회는 이미 사전 저장돼 있습니다. 기존 기록을 보존합니다.`);
      return;
    }
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(document, null, 2) + '\n', 'utf8');
    console.log(`${result.round}회 45수 사전 스캔 저장 완료: ${result.record.candidatePool.length}개 검색 후보`);
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => { console.error(err); process.exitCode = 1; });
}
