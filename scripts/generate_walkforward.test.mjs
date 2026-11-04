import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDraws, priorFlags, makeWalkforward, auditAgainstSavedSnapshot } from './generate_walkforward.mjs';

function fakeDraws(count=52){
  return Array.from({length:count},(_,i)=>{
    const numbers=Array.from({length:6},(_,j)=>((i*7+j*5)%45)+1).sort((a,b)=>a-b);
    const bonus=Array.from({length:45},(_,j)=>j+1).find(n=>!numbers.includes(n));
    return {draw_no:i+1,numbers,bonus_no:bonus};
  });
}

test('1회부터 모든 회차 번호 정합성 점검',()=>{
  const d=normalizeDraws(fakeDraws());
  assert.equal(d.length,52);
  assert.throws(()=>normalizeDraws([...d.slice(1)]),/검증 실패/);
});

test('미래 회차 결과를 바꿔도 해당 회차 사전 판정은 불변',()=>{
  const d=fakeDraws(),prior=d.slice(0,31);
  const before=Array.from({length:45},(_,i)=>priorFlags(prior,i+1));
  d[31].numbers=[1,2,3,4,5,6];
  d[32].numbers=[8,9,10,11,12,13];
  const after=Array.from({length:45},(_,i)=>priorFlags(d.slice(0,31),i+1));
  assert.deepEqual(before,after);
});

test('과거 복원은 사전 실전 성적과 분리하며 11개 축/후반 테스트 유지',()=>{
  const report=makeWalkforward(fakeDraws(52));
  assert.equal(report.origin,'historical-walkforward-reconstruction-only');
  assert.equal(report.totalRounds,51);
  assert.equal(report.rows.length,11);
  assert.equal(report.earlyRounds+report.lateRounds,51);
  assert.ok(report.rows.every(r=>r.late.pBetterAdjusted>=0&&r.late.pBetterAdjusted<=1));
  assert.ok(report.rows.every(r=>r.late.pWorseAdjusted>=0&&r.late.pWorseAdjusted<=1));
  assert.equal(report.examples.length,8);
  assert.equal(report.environment.rows.length,66);
  assert.equal(report.environment.correctedComparisons,132);
  assert.ok(report.environment.rows.every(r=>r.early.rounds<=report.earlyRounds&&r.late.rounds<=report.lateRounds));
  assert.ok(report.environment.rows.every(r=>r.late.pBetterAdjusted>=0&&r.late.pBetterAdjusted<=1));
  assert.ok(report.environment.rows.every(r=>r.late.pWorseAdjusted>=0&&r.late.pWorseAdjusted<=1));
  assert.equal(report.followupReview.rows.length,11);
  assert.deepEqual(report.followupReview.horizons,[1,2,3,5,10]);
  assert.equal(report.followupReview.numberRows.length,45);
  assert.equal(report.followupReview.caseIndex.numbers.length,45);
  assert.equal(report.followupReview.origin,'historical-retrospective-not-predraw');
  assert.equal(report.examples.at(-1).followup.observedRounds,0);
});

test('과거 전체 1~45번 사례 색인은 당시 검색 비트·당첨·최초 재등장을 원본과 일치시킨다',()=>{
  const draws=fakeDraws(52),review=makeWalkforward(draws).followupReview;
  const index=review.caseIndex;
  assert.equal(index.version,1);
  assert.equal(index.axisKeys.length,11);
  for(const item of index.numbers){
    assert.ok(item.n>=1&&item.n<=45);
    const cases=new Map(item.cases.map(c=>[c[0],c]));
    assert.equal(cases.size,item.cases.length);
    for(let round=2;round<=52;round++){
      const flags=priorFlags(draws.slice(0,round-1),item.n);
      const mask=index.axisKeys.reduce((v,key,i)=>flags.includes(key)?v|(1<<i):v,0);
      const won=draws[round-1].numbers.includes(item.n)?1:0;
      const record=cases.get(round);
      if(!mask&&!won){assert.equal(record,undefined);continue;}
      const next=draws.slice(round,round+10).findIndex(d=>d.numbers.includes(item.n));
      assert.deepEqual(record,[round,mask,won,next<0?null:next+1],`${item.n}번 ${round}회`);
    }
    for(const [axisBit,key] of index.axisKeys.entries())for(const type of ['predictedButMissed','unpredictedWinner']){
      for(const row of review.numberRows[item.n-1].axes[key][type]){
        const relevant=item.cases.filter(([round,mask,won])=>{
          if(round>52-row.horizon)return false;
          const picked=!!(mask&(1<<axisBit));
          return type==='predictedButMissed'?picked&&!won:!picked&&!!won;
        });
        assert.equal(row.eligible,relevant.length);
        assert.equal(row.seen,relevant.filter(c=>c[3]!==null&&c[3]<=row.horizon).length);
      }
    }
  }
});

test('1~45번 개별 추적의 표본수와 재등장 건수를 모두 합치면 전체 축 집계와 일치한다',()=>{
  const report=makeWalkforward(fakeDraws(52)),review=report.followupReview;
  assert.deepEqual(review.numberRows.map(r=>r.n),Array.from({length:45},(_,i)=>i+1));
  for(const axis of review.rows){
    for(const type of ['predictedButMissed','unpredictedWinner']){
      for(const overall of axis.groups[type]){
        const records=review.numberRows.map(row=>row.axes[axis.key][type].find(item=>item.horizon===overall.horizon));
        assert.ok(records.every(r=>r&&r.seen<=r.eligible));
        assert.equal(records.reduce((total,r)=>total+r.eligible,0),overall.eligible,
          `${axis.key} ${type} +${overall.horizon} 총 표본수`);
        assert.equal(records.reduce((total,r)=>total+r.seen,0),overall.seen,
          `${axis.key} ${type} +${overall.horizon} 재등장 수`);
      }
    }
  }
});

test('후속 출현은 미당첨 검색수와 검색 밖 실제 당첨수를 별도 추적한다',()=>{
  const report=makeWalkforward(fakeDraws(52));
  for(const example of report.examples){
    const winners=new Set(example.actual);
    assert.equal(example.followup.observedRounds,Math.min(10,52-example.round));
    for(const [key,axis] of Object.entries(example.axes)){
      const searched=new Set(axis.selected);
      const traces=example.followup.axes[key];
      assert.deepEqual(traces.predictedButMissed.map(item=>item.n),axis.selected.filter(n=>!winners.has(n)));
      assert.deepEqual(traces.unpredictedWinner.map(item=>item.n),example.actual.filter(n=>!searched.has(n)));
      for(const [kind,items] of Object.entries(traces))for(const item of items){
        assert.ok(item.firstAfter===null||(item.firstAfter>=1&&item.firstAfter<=example.followup.observedRounds),`${key} ${kind} ${item.n}`);
        if(example.followup.observedRounds===0)assert.equal(item.firstAfter,null);
      }
    }
  }
  for(const axis of report.followupReview.rows)for(const type of ['predictedButMissed','unpredictedWinner']){
    const horizons=axis.groups[type];
    assert.equal(horizons.length,5);
    for(let i=0;i<horizons.length;i++){
      const item=horizons[i];
      assert.ok(item.seen>=0&&item.seen<=item.eligible);
      assert.ok(Math.abs(item.randomRate-(1-Math.pow(39/45,item.horizon)))<0.00001);
      if(i>0)assert.ok(item.eligible<=horizons[i-1].eligible);
    }
  }
});

test('미래 추첨 변경은 과거 사전 검출을 수정하지 않고 후속 출현 기록만 바꿀 수 있다',()=>{
  const d=fakeDraws(52),before=makeWalkforward(d);
  d[51]={...d[51],numbers:[1,2,3,4,5,6]};
  const after=makeWalkforward(d);
  for(const old of before.examples){
    const updated=after.examples.find(e=>e.round===old.round);
    assert.ok(updated);
    for(const key of Object.keys(old.axes))assert.deepEqual(old.axes[key].selected,updated.axes[key].selected);
  }
});

test('사전 환경 분류 두 구간은 매 축마다 모든 선택수와 적중을 빠짐없이 나눈다',()=>{
  const report=makeWalkforward(fakeDraws(52));
  for(const row of report.rows){
    const group=report.environment.rows.filter(r=>r.key===row.key);
    for(const kind of ['sum','pair','signal']){
      const parts=group.filter(r=>r.kind===kind);
      assert.equal(parts.length,2);
      for(const period of ['early','late']){
        assert.equal(parts.reduce((n,p)=>n+p[period].selected,0),row[period].selected,
          `${row.key} ${kind} ${period} 선택수 분할`);
        assert.equal(parts.reduce((n,p)=>n+p[period].hits,0),row[period].hits,
          `${row.key} ${kind} ${period} 적중수 분할`);
      }
    }
  }
});

test('같은 회차의 발표번호를 바꿔도 사전 환경 검출수는 바뀌지 않는다',()=>{
  const draws=fakeDraws(52),original=makeWalkforward(draws);
  draws[51]={...draws[51],numbers:[1,2,3,4,5,6]};
  const changed=makeWalkforward(draws);
  for(let i=0;i<original.environment.rows.length;i++){
    const before=original.environment.rows[i],after=changed.environment.rows[i];
    assert.equal(before.early.selected,after.early.selected);
    assert.equal(before.late.selected,after.late.selected);
  }
});

test('서버가 저장한 평가축과 복원 결과가 다르면 중단',()=>{
  const d=fakeDraws(),rows=Array.from({length:45},(_,i)=>({n:i+1,flags:priorFlags(d,i+1)}));
  const original={round:53,sourceRound:52,rows};
  assert.doesNotThrow(()=>auditAgainstSavedSnapshot(d,original));
  rows[0].flags=[];
  if(priorFlags(d,1).length===0)rows[0].flags=['neighbor1'];
  assert.throws(()=>auditAgainstSavedSnapshot(d,original),/조건 불일치/);
});
