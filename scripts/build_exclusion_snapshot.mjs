import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { validateSnapshot } from './capture_weekly.mjs';

const require = createRequire(import.meta.url);
const { analyze, choose, POLICY } = require('../exclusion_lab.js');
const FIRST_CUTOFF = Date.UTC(2002, 11, 7, 11, 30);
const WEEK_MS = 7 * 86400000;
const IN_SCAN = 'data/weekly_scans.json';
const IN_REPORT = 'data/historical_walkforward.json';
const OUTPUT = 'data/exclusion_scans.json';

export function drawCutoff(round) { return FIRST_CUTOFF + (round - 1) * WEEK_MS; }

export function makeExclusionSnapshot(scan, report, createdAt) {
  if (!validateSnapshot(scan) || scan.captureSource !== 'scheduled-github-actions')
    throw new Error('저장된 서버 45수 사전 원장이 아닙니다.');
  const now = Date.parse(createdAt), cutoff = drawCutoff(scan.round);
  if (!Number.isFinite(now) || now >= cutoff || now < Date.parse(scan.createdAt))
    throw new Error('추첨 전, 원본 사전 원장 생성 이후에만 제외 연구를 저장할 수 있습니다.');
  const result = analyze(report, scan);
  return {
    version:1,policy:POLICY,round:scan.round,sourceRound:scan.sourceRound,
    createdAt,predrawScanAt:scan.createdAt,weakSignals:result.weak,
    significantSignals:result.verified.map(s => s.key),
    variants:result.variants
  };
}

export function validateExclusionSnapshot(entry, scan) {
  if (!entry || entry.version !== 1 || entry.policy !== POLICY ||
    !scan || !validateSnapshot(scan) || entry.round !== scan.round ||
    entry.sourceRound !== scan.sourceRound || entry.predrawScanAt !== scan.createdAt ||
    !Number.isFinite(Date.parse(entry.createdAt)) ||
    Date.parse(entry.createdAt) < Date.parse(scan.createdAt) ||
    Date.parse(entry.createdAt) >= drawCutoff(entry.round) ||
    !Array.isArray(entry.weakSignals) || !Array.isArray(entry.variants) ||
    entry.variants.length !== 2 || !Array.isArray(entry.significantSignals)) return false;
  const known = new Set(['neighbor1','neighbor2','ending','bonus','carry','miss5',
    'neighborTwice','sameSlot','fixedCycle','diagonal','context2plus']);
  const seen = new Set();
  for (const signal of entry.weakSignals) {
    if (!signal || !known.has(signal.key) || seen.has(signal.key) ||
      !Number.isInteger(signal.earlySelected) || signal.earlySelected < 30 ||
      !Number.isInteger(signal.lateSelected) || signal.lateSelected < 30 ||
      !Number.isInteger(signal.earlyHits) || signal.earlyHits < 0 ||
      !Number.isInteger(signal.lateHits) || signal.lateHits < 0 ||
      signal.earlyHits / signal.earlySelected >= 6/45 ||
      signal.lateHits / signal.lateSelected >= 6/45 ||
      !Number.isFinite(signal.lateAdjustedP) || signal.lateAdjustedP < 0 ||
      signal.lateAdjustedP > 1) return false;
    seen.add(signal.key);
  }
  if (new Set(entry.significantSignals).size !== entry.significantSignals.length ||
    entry.significantSignals.length !== entry.weakSignals.filter(s => s.lateAdjustedP < .05).length ||
    entry.significantSignals.some(k => !seen.has(k) ||
      entry.weakSignals.find(s => s.key===k).lateAdjustedP>=.05)) return false;
  for (const [i,threshold] of [2,3].entries()) {
    const v=entry.variants[i];
    if (!v || v.overlap !== threshold || !Array.isArray(v.candidates) ||
      v.count !== v.candidates.length || v.remaining !== 45-v.count ||
      Math.abs(v.expectedExcludedHits-v.count*6/45)>1e-10 ||
      Math.abs(v.allSixRemainRandom-choose(45-v.count,6)/choose(45,6))>1e-10) return false;
    const expected=scan.rows.map(r=>({n:r.n,signals:entry.weakSignals.filter(s=>r.flags.includes(s.key)).map(s=>s.key)}))
      .filter(r=>r.signals.length>=threshold)
      .sort((a,b)=>b.signals.length-a.signals.length||a.n-b.n);
    if (expected.length !== v.count || expected.some((r,j)=>
      v.candidates[j]?.n!==r.n || v.candidates[j]?.signals?.join('|')!==r.signals.join('|'))) return false;
  }
  return true;
}

export function mergeExclusionSnapshot(doc, entry) {
  if (!doc || doc.version !== 1 || !Array.isArray(doc.records))
    throw new Error('제외 연구원장 형식 오류');
  if (doc.records.some(item => item.round === entry.round))
    return {changed:false,document:doc};
  return {changed:true,document:{version:1,records:[...doc.records,entry]
    .sort((a,b)=>a.round-b.round).slice(-104)}};
}

function main() {
  const scans=JSON.parse(fs.readFileSync(IN_SCAN,'utf8'));
  const report=JSON.parse(fs.readFileSync(IN_REPORT,'utf8'));
  const doc=JSON.parse(fs.readFileSync(OUTPUT,'utf8'));
  const scan=scans.records.at(-1);
  if (!scan || Date.now()>=drawCutoff(scan.round)) {
    console.log('제외 연구: 추첨 전 원장이 아니므로 사후 생성 금지');return;
  }
  if (doc.records.some(e=>e.round===scan.round)) {
    console.log(`${scan.round}회 제외 연구 원장 이미 보존됨 · 수정하지 않음`);return;
  }
  if (report.lastTestRound!==scan.sourceRound) {
    console.warn('제외 연구 보류: 마지막 확정 회차와 과거 성적표가 일치하지 않음');return;
  }
  const entry=makeExclusionSnapshot(scan,report,new Date().toISOString());
  if (!validateExclusionSnapshot(entry,scan)) throw new Error('제외 후보·조건 사전 기록 검증 실패');
  const result=mergeExclusionSnapshot(doc,entry);
  if (result.changed) fs.writeFileSync(OUTPUT,JSON.stringify(result.document,null,2)+'\n');
  console.log(`${entry.round}회 제외 연구 가설 사전 고정 · 2조건 ${entry.variants[0].count}수 · 3조건 ${entry.variants[1].count}수 · 검증 완료 0건 가능`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try{main();}catch(err){console.error(err);process.exitCode=1;}
}
