/* Score only actually published, verified weekly results; do not rewrite predictions. */
import fs from 'node:fs';
import path from 'node:path';
import { mergeReviews } from './connection_ledger.mjs';
import { validatePair } from './build_scorecard.mjs';

const root = 'data/';
const read = filename => JSON.parse(fs.readFileSync(path.resolve(root,filename), 'utf8'));

function main() {
  const forecasts = read('connection_forecasts.json');
  const existing = read('connection_reviews.json');
  const scans = read('weekly_scans.json');
  const reviews = read('weekly_reviews.json');
  if (forecasts.version !== 1 || scans.version !== 1 || reviews.version !== 1)
    throw new Error('서버 기록 원장 버전 불일치');
  const byScan = new Map(scans.records.map(row => [row.round, row]));
  for (const review of reviews.records) {
    if (!validatePair(byScan.get(review.round),review))
      throw new Error(`${review.round}회 본당첨 원본·사전 스캔 대조 실패`);
  }
  const { added, document } = mergeReviews(existing, reviews.records, forecasts.records);
  if (!added) {
    console.log('새로 확정할 연결 회차 없음');
    return;
  }
  fs.writeFileSync(path.resolve(root,'connection_reviews.json'),
    JSON.stringify(document,null,2)+'\n');
  console.log(`연결 예정 회차 ${added}회차 실제 결과 확정 (총 ${document.records.length}회차)`);
}
main();
