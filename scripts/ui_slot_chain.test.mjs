import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const start = html.indexOf('function analyzeHistoricalSlotChains(');
const end = html.indexOf('function historicalSlotChainSVG(', start);
assert.ok(start >= 0 && end > start, '앱에 자리 연구 함수가 있어야 합니다.');
const analyze = new Function(html.slice(start, end) + '\nreturn analyzeHistoricalSlotChains;')();

const slots = {
  1: [21,30,31,32,33,34], 2: [1,21,30,31,32,33],
  3: [1,2,21,30,31,32], 4: [1,2,3,21,30,31],
  5: [1,2,3,4,21,31], 6: [1,2,3,4,5,21]
};
function sample(events, total = 16) {
  const byRound = new Map(events);
  return Array.from({length: total}, (_, i) => {
    const round = i + 1;
    return {draw_no:round,numbers:(slots[byRound.get(round)] || [1,2,3,4,5,6]).slice(),
      bonus_no:45};
  });
}
test('6구→3구→1구는 동일 번호의 실제 과거 출현 자리로만 연결한다', () => {
  const r=analyze(sample([[2,6],[4,3],[6,1],[7,2]],10),[6,3,1],21);
  assert.equal(r.prefixKnown.length,1);
  assert.equal(r.prefixSucceeded.length,1);
  assert.equal(r.completed.length,1);
  assert.deepEqual(r.completed[0].chain.map(p=>p.round),[2,4,6]);
  assert.deepEqual(r.completed[0].chain.map(p=>p.slot),[6,3,1]);
  assert.equal(r.nextDrawHits.length,1);
  assert.equal(r.fiveEligible.length,0, '추첨 후 5회 미경과는 성패 판단 제외');
});
test('6→3→1→6→3→1의 여섯 출현 자리는 정확히 이어진 경우에만 탐지', () => {
  const draws=sample([[2,6],[4,3],[6,1],[8,6],[10,3],[12,1],[14,4]],16);
  const short=analyze(draws,[6,3,1],21);
  const long=analyze(draws,[6,3,1,6,3,1],21);
  assert.equal(short.completed.length,2);
  assert.equal(short.repeated.length,1);
  assert.equal(long.completed.length,1);
  assert.equal(long.completed[0].chain.length,6);
  assert.equal(long.completed[0].next.slot,4);
});
test('자리 패턴이 틀리면 성공으로 표시하지 않는다', () => {
  const draws=sample([[2,6],[4,3],[6,1]],10);
  assert.equal(analyze(draws,[6,4,2],21).completed.length,0);
  assert.equal(analyze(draws,[5,5,5],21).completed.length,0);
});
test('당시 완성 기록은 미래 결과를 바꿔도 변하지 않는다', () => {
  const base=sample([[2,6],[4,3],[6,1],[7,2]],10);
  const changed=sample([[2,6],[4,3],[6,1]],10);
  const a=analyze(base,[6,3,1],21),b=analyze(changed,[6,3,1],21);
  assert.deepEqual(a.completed.map(e=>e.chain),b.completed.map(e=>e.chain));
  assert.equal(a.nextDrawHits.length,1);
  assert.equal(b.nextDrawHits.length,0);
});
test('잘못된 자리 및 번호 입력을 거부한다',()=>{
  const draws=sample([],10);
  assert.throws(()=>analyze(draws,[6,3,7],0));
  assert.throws(()=>analyze(draws,[6,3,1],46));
  assert.throws(()=>analyze(draws,[],0));
});
