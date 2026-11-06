/* Separate first-seen connection archive; never reclassify past discoveries. */
import fs from 'node:fs';
import path from 'node:path';
import { buildConnections, mergeForecasts, FORECAST_POLICY } from './connection_ledger.mjs';

const APP = 'https://master2026fit.github.io/lotto-pattern-lab/';
const FILE = path.resolve('data/connection_forecasts.json');

async function main() {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ locale: 'ko-KR', timezoneId: 'Asia/Seoul' });
    await page.goto(APP + '?connection-capture=' + Date.now(),
      { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => typeof state !== 'undefined' &&
      state.source === '온라인' && state.draws.length > 100 && !state.loading,
    null, { timeout: 180000 });
    const source = await page.evaluate(() => ({
      origin: state.source,
      rows: state.draws.map(d => ({ draw_no: d.draw_no, numbers: d.numbers })),
      upcoming: upcoming(state.draws), latest: latest(state.draws).draw_no,
      inPredraw: beforeDrawCutoff(upcoming(state.draws))
    }));
    if (source.origin !== '온라인' || !source.inPredraw ||
      source.upcoming !== source.latest + 1)
      throw new Error('온라인 추첨 전 기록 확인 실패');

    const now = new Date().toISOString();
    // Exactly the same date/round integrity condition is checked inside buildConnections.
    let rows;
    try { rows = buildConnections(source.rows, now); }
    catch (err) {
      if (/사전 저장 시각/.test(err.message)) {
        console.log('추첨 마감 이후이므로 연결기록 추가를 건너뜁니다.');
        return;
      }
      throw err;
    }
    if (source.rows.length < 100 || source.latest !== source.rows.at(-1).draw_no)
      throw new Error('서버 당첨 자료의 회차가 일치하지 않습니다.');
    const existing = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    const { added, document } = mergeForecasts(existing, rows);
    if (!added) {
      console.log(`${source.upcoming}회 연결 기록 모두 이미 저장돼 있음 · 기존 기록 보존`);
      return;
    }
    // Slow fetches must not turn a predraw capture into an after-the-fact claim.
    if (new Date().toISOString() !== now) {
      buildConnections(source.rows, new Date().toISOString(), 1);
    }
    fs.writeFileSync(FILE, JSON.stringify(document, null, 2) + '\n');
    console.log(`최초 발견 연결 ${added}건 저장 (전체 ${document.records.length}건, 시작 회차 ${source.upcoming})`);
  } finally { await browser.close(); }
}

main().catch(e => { console.error(e); process.exitCode = 1; });
