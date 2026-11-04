import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSnapshot } from './capture_weekly.mjs';

const APP_URL = 'https://master2026fit.github.io/lotto-pattern-lab/';
const SCANS = path.resolve('data/weekly_scans.json');
const REVIEWS = path.resolve('data/weekly_reviews.json');
const PNG_DIR = path.resolve('data/recaps');

const sameNumbers = (a, b) => Array.isArray(a) && Array.isArray(b) &&
  a.length === b.length && a.every((n, i) => n === b[i]);

export function summarizeVerifiedReview(snapshot, data, svg) {
  if (!validateSnapshot(snapshot) || !data || data.origin !== '실제 사전 저장 기록' ||
    data.round !== snapshot.round || data.sourceRound !== snapshot.sourceRound ||
    !Array.isArray(data.rows) || data.rows.length !== 45 ||
    !Array.isArray(data.axes) || data.axes.length !== 11 ||
    !sameNumbers([...snapshot.candidatePool].sort((a, b) => a - b),
      [...(data.pool || [])].sort((a, b) => a - b)) ||
    !Array.isArray(data.actual) || data.actual.length !== 6 ||
    new Set(data.actual).size !== 6 ||
    data.actual.some(n => !Number.isInteger(n) || n < 1 || n > 45) ||
    !Number.isInteger(data.bonus) || data.bonus < 1 || data.bonus > 45 ||
    data.actual.includes(data.bonus) ||
    typeof svg !== 'string' || !svg.startsWith('<svg') ||
    !svg.includes('id="weeklyReviewSvg"') || !svg.endsWith('</svg>')) {
    throw new Error('실제 사전 저장 기록과 복기 원본의 일치 검증 실패');
  }

  const actualSet = new Set(data.actual);
  const poolSet = new Set(snapshot.candidatePool);
  const selectedHit = [...actualSet].filter(n => poolSet.has(n)).sort((a, b) => a - b);
  const missed = [...actualSet].filter(n => !poolSet.has(n)).sort((a, b) => a - b);
  if (!sameNumbers(selectedHit, [...(data.selectedHit || [])].sort((a,b)=>a-b)) ||
    !sameNumbers(missed, [...(data.missed || [])].sort((a,b)=>a-b))) {
    throw new Error('선정 후보 적중·누락 개수가 맞지 않습니다.');
  }
  const priorRowMap = new Map(snapshot.rows.map(row => [row.n, row]));
  for (const row of data.rows) {
    const saved = priorRowMap.get(row.n);
    if (!saved || saved.basic !== row.basic || saved.connected !== row.connected ||
      !sameNumbers([...saved.flags].sort(), [...row.flags].sort())) {
      throw new Error('당첨 후 검색조건이 사전 저장본과 달라졌습니다.');
    }
  }
  for (const axis of data.axes) {
    if (typeof axis.key !== 'string' || typeof axis.label !== 'string' ||
      !Number.isInteger(axis.total) || !Number.isInteger(axis.hits) ||
      !Number.isInteger(axis.misses) || !Number.isInteger(axis.escaped) ||
      axis.total < 0 || axis.hits < 0 || axis.total !== axis.hits + axis.misses ||
      axis.escaped < 0 || axis.escaped > 6) throw new Error('조건별 복기 수치 불일치');
  }
  return {
    round: snapshot.round, sourceRound: snapshot.sourceRound,
    predrawAt: snapshot.createdAt, generatedAt: new Date().toISOString(),
    actual: [...data.actual].sort((a, b) => a - b), bonus: data.bonus,
    candidateCount: snapshot.candidatePool.length,
    selectedHit, missed,
    axes: data.axes.map(({ key, label, total, hits, misses, escaped }) =>
      ({ key, label, total, hits, misses, escaped })),
    png: `./data/recaps/${snapshot.round}.png`,
    svg: `./data/recaps/${snapshot.round}.svg`,
    provenance: 'predraw-snapshot-and-online-draw'
  };
}

async function renderPNG(browser, svg, file) {
  const page = await browser.newPage({ viewport: { width: 1120, height: 2400 },
    deviceScaleFactor: 1.5, locale: 'ko-KR' });
  try {
    await page.setContent('<!doctype html><html lang="ko"><meta charset="utf-8"><body style="margin:0;background:#091626">'+svg+'</body></html>');
    await page.locator('#weeklyReviewSvg').screenshot({ path: file, timeout: 120000 });
    if (fs.statSync(file).size < 10000) throw new Error('PNG 이미지가 정상 생성되지 않았습니다.');
  } finally { await page.close(); }
}

async function newDataPage(browser, snapshots) {
  const page = await browser.newPage({ locale: 'ko-KR', timezoneId: 'Asia/Seoul' });
  page.on('pageerror', e => console.warn('앱 페이지 오류:', e.message));
  await page.addInitScript(records => {
    localStorage.setItem('lotto_pattern_full_scan_v1', JSON.stringify(records));
  }, snapshots);
  await page.goto(APP_URL + '?weekly-review=' + Date.now(),
    { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => typeof state !== 'undefined' && state.source === '온라인' &&
      state.draws.length > 100 && state.profiles.length === 45 && !state.loading &&
      typeof state.serverScanStatus === 'string' &&
      state.serverScanStatus !== '서버 기록 확인 중',
    null, { timeout: 180000 });
  return page;
}

async function main() {
  const smoke = process.argv.includes('--smoke');
  const scans = JSON.parse(fs.readFileSync(SCANS, 'utf8'));
  const reviews = JSON.parse(fs.readFileSync(REVIEWS, 'utf8'));
  if (scans.version !== 1 || !Array.isArray(scans.records) ||
    reviews.version !== 1 || !Array.isArray(reviews.records)) {
    throw new Error('공개 기록 데이터 구조가 올바르지 않습니다.');
  }
  const allScans = scans.records.filter(s => validateSnapshot(s));
  if (allScans.length !== scans.records.length) throw new Error('사전 저장본 변조·손상 발견');
  const pending = allScans.filter(s => !reviews.records.some(r => r.round === s.round));
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await newDataPage(browser, allScans.slice(-72));
    if (smoke) {
      const test = await page.evaluate(() => {
        const previous = latest(state.draws).draw_no;
        const data = weeklyPatternReviewData(previous);
        return { round: previous, source: data.origin, svg: weeklyPatternReviewSVG(data) };
      });
      const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lotto-recap-smoke-'));
      await renderPNG(browser, test.svg, path.join(temp, 'preview.png'));
      console.log(`복기 PNG 렌더링 점검 완료: ${test.round}회 (${test.source})`);
      return;
    }
    if (!pending.length) { console.log('새로 복기할 사전기록이 없습니다.'); return; }
    const online = await page.evaluate(() => ({
      source: state.source,
      available: state.draws.map(d => d.draw_no)
    }));
    if (online.source !== '온라인') throw new Error('최신 추첨 데이터 온라인 확인 실패');
    fs.mkdirSync(PNG_DIR, { recursive: true });
    let count = 0;
    for (const snapshot of pending) {
      if (!online.available.includes(snapshot.round)) {
        console.log(`${snapshot.round}회 실제 당첨번호가 아직 연동되지 않아 다음 예약 실행에서 재시도합니다.`);
        continue;
      }
      const result = await page.evaluate(round => {
        const saved = fullScanBook().find(x => x.round === round);
        if (!saved || !saved.review) throw new Error('해당 회차의 사전 기록이 기기에 복원되지 않았습니다.');
        const data = weeklyPatternReviewData(round);
        return { saved, data, svg: weeklyPatternReviewSVG(data) };
      }, snapshot.round);
      if (JSON.stringify(result.saved.rows) !== JSON.stringify(snapshot.rows) ||
        !sameNumbers(result.saved.candidatePool, snapshot.candidatePool)) {
        throw new Error(`${snapshot.round}회 서버 원본과 앱 내 복원본이 다릅니다.`);
      }
      const summary = summarizeVerifiedReview(snapshot, result.data, result.svg);
      const svgFile = path.join(PNG_DIR, `${snapshot.round}.svg`);
      const pngFile = path.join(PNG_DIR, `${snapshot.round}.png`);
      fs.writeFileSync(svgFile, result.svg + '\n', 'utf8');
      await renderPNG(browser, result.svg, pngFile);
      reviews.records.push(summary);
      count += 1;
      console.log(`${snapshot.round}회 실제 사전기록 복기 PNG 완료: ${summary.candidateCount}수 중 ${summary.selectedHit.length}개 적중, ${summary.missed.length}개 누락`);
    }
    if (count) {
      reviews.records.sort((a,b) => a.round - b.round);
      fs.writeFileSync(REVIEWS, JSON.stringify(reviews, null, 2) + '\n', 'utf8');
    }
    if (!count) console.log('당첨번호 업데이트를 기다리는 중입니다.');
  } finally { await browser.close(); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { console.error(e); process.exitCode = 1; });
}
