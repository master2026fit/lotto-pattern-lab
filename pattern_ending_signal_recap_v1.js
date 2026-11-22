/* Lotto Note: true pre-draw ending-signal and excluded-ending failure replay by historical target. */
(function installEndingSignalReplay(){
'use strict';
const host=document.querySelector('#ln-connection-schedule-v1 [data-lned] [data-lneg]');
if(!host||host.querySelector('[data-lnsr]'))return;
const css=document.createElement('style');
css.textContent=`
#ln-connection-schedule-v1 .lned .lnsr{padding:12px;margin:12px 0 16px;background:#fffdf6;border:2px solid #be9a57;color:#304d61;border-radius:13px;box-sizing:border-box;min-width:0}
#ln-connection-schedule-v1 .lned .lnsr *{box-sizing:border-box}
#ln-connection-schedule-v1 .lned .lnsr h6{margin:0 0 7px;color:#65471e;font-weight:900;font-size:17px}
#ln-connection-schedule-v1 .lned .lnsr h5{font-size:13px;margin:13px 0 7px;color:#34556b;font-weight:900}
#ln-connection-schedule-v1 .lned .lnsr p{font-size:11px;line-height:1.65;margin:5px 0 8px;color:#4d6171}
#ln-connection-schedule-v1 .lned .lnsr strong{color:#264b62}
#ln-connection-schedule-v1 .lned .lnsr button{cursor:pointer;touch-action:manipulation;font-family:inherit}
#ln-connection-schedule-v1 .lned .lnsr button:disabled{opacity:.6;cursor:wait}
#ln-connection-schedule-v1 .lned .lnsr [hidden]{display:none!important}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:9px 0}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-controls label{min-width:0;display:flex;flex-direction:column;gap:5px;font-size:11px;color:#486176;font-weight:850}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-controls select,#ln-connection-schedule-v1 .lned .lnsr .lnsr-controls input{width:100%;border:1px solid #a7bfce;border-radius:8px;background:#fff;color:#1b4965;min-height:41px;font-size:12px;padding:7px}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-search{background:#294f6f!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border:1px solid #214765!important;border-radius:9px;padding:10px;min-height:45px;width:100%;font-size:12px;font-weight:900;letter-spacing:.01em}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-status{padding:8px;background:#e8f2fb;color:#315774;border:1px solid #c2d4df;border-radius:8px;font-size:11px;margin:9px 0;line-height:1.65}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:8px 0}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-card{background:#fff;border:1px solid #bdcddb;border-radius:10px;padding:9px;min-width:0}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-card.current{border:2px solid #e5b05d;background:#fff8e7}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-card h5{font-size:13px;margin:0 0 6px}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-card small{font-size:10px;line-height:1.6;color:#5a7384}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-digits{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;margin:6px 0}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-digit{display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:57px;min-width:0;border-radius:8px;padding:5px 1px;border:1px solid #bdd0da;background:#e9f2f8;color:#2e5a75;font-weight:850}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-digit b{font-size:17px;color:inherit}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-digit small{font-size:9px;font-weight:800;color:inherit}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-digit.o{background:#cbedda;border-color:#8bc7a6;color:#176140}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-digit.x{background:#ffdde3;border-color:#dfa4af;color:#983d4a}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-digit.both{background:#fff1c9;border-color:#d6aa53;color:#785316}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-digit.active{box-shadow:inset 0 0 0 2px #cc9632}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-pill{display:inline-block;padding:4px 6px;margin:3px 3px 2px 0;border-radius:6px;border:1px solid #b8cddd;background:#eff5fa;color:#264d6b;font-size:11px;font-weight:850}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-ball{display:inline-flex;min-height:32px;min-width:32px;padding:4px;margin:3px;align-items:center;justify-content:center;border:1px solid #a8c6d6;border-radius:7px;background:#eef5fa;font-size:11px;font-weight:900;color:#2a526e}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-ball.hit{background:#c7f1d9;color:#17613e;border-color:#73c399}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-ball.excluded{background:#ffe1e7;color:#973845;border-color:#dfa0ae}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-ball.missed{background:#efb3be;border-color:#c96a80;color:#742b36;box-shadow:inset 0 0 0 2px #a73952}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-row{border:1px solid #bed0de;border-radius:9px;background:#fff;padding:8px;margin:7px 0;min-width:0}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-row.o{border-left:4px solid #6ab58b}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-row.x{border-left:4px solid #dd98a5}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-row.both{border-left:4px solid #d1a657}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-row b{font-size:12px;line-height:1.55}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-row button{margin-top:5px;border:1px solid #abc5d5;border-radius:7px;background:#eff6fa;color:#2a526d;min-height:33px;font-size:11px;padding:7px 9px;font-weight:850}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-detail{background:#fff8df;padding:9px;border:1px solid #d2ac6c;border-radius:9px;margin:6px 0;color:#5c4726}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-detail .lnsr-step{display:flex;gap:8px;align-items:center;background:#fff;border:1px solid #dfd1b7;border-radius:8px;padding:7px;margin:4px 0;font-size:11px;line-height:1.6;color:#3d5366}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-detail .lnsr-step b{color:#7d5c2a}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-statgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:8px 0}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-stat{border:1px solid #c1d2db;background:#fff;padding:9px;border-radius:8px;min-width:0}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-stat small{display:block;font-size:10px;color:#577288}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-stat b{display:block;font-size:15px;color:#24536b;margin:5px 0}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-audit summary{font-size:12px;font-weight:850;line-height:1.6;cursor:pointer;color:#27556f}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-audit details{border:1px solid #c4d4df;background:#fff;border-radius:9px;padding:8px;margin:7px 0}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-more{display:block;width:100%;min-height:42px;background:#ebf4fd;border:1px solid #b4cad9;border-radius:8px;color:#275270;font-size:12px;font-weight:900;margin-top:8px}
#ln-connection-schedule-v1 .lned .lnsr .lnsr-note{border-left:4px solid #cfac67;background:#f7edd7;border-radius:5px;padding:9px;font-size:11px;color:#635027;line-height:1.65;margin:9px 0}
@media(min-width:650px){#ln-connection-schedule-v1 .lned .lnsr .lnsr-cards{grid-template-columns:1fr 1fr}#ln-connection-schedule-v1 .lned .lnsr .lnsr-statgrid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:540px){#ln-connection-schedule-v1 .lned .lnsr{padding:9px}#ln-connection-schedule-v1 .lned .lnsr .lnsr-cards{grid-template-columns:1fr}#ln-connection-schedule-v1 .lned .lnsr .lnsr-digits{grid-template-columns:repeat(5,minmax(0,1fr))}}
`;
host.append(css);
const panel=document.createElement('section');panel.className='lnsr';panel.dataset.lnsr='1';
panel.innerHTML=`
<h6>🎯 지난 회차 끝수 신호 복기 → 이번 회차 해당·제외 끝수</h6>
<p>사진의 <b>7끝수 한 칸 건너 출현</b>을 포함해, 가로·세로·대각·건너뛰기 규칙으로 <b>대상 회차 이전에 알 수 있던 O/X 신호</b>를 만들고 실제 당첨과 대조합니다. 7끝수도 출현 신호일 뿐 필출 확정은 아닙니다.</p>
<div class="lnsr-controls">
<label>연결 방향<select data-lnsr-dir>
<option value="V">세로 · 같은 끝수</option><option value="P">↗ 대각 · 끝수 증가</option><option value="N">↖ 대각 · 끝수 감소</option><option value="H">가로 · 직전 회차</option><option value="all">세로·대각·가로 전체</option>
</select></label>
<label>회차 간격<select data-lnsr-gap><option value="2">1회 건너뛰기 · 2회 간격</option><option value="1">직전 회차 · 1회 간격</option><option value="3">2회 건너뛰기 · 3회 간격</option><option value="4">3회 건너뛰기 · 4회 간격</option><option value="5">4회 건너뛰기 · 5회 간격</option><option value="10">10회 간격</option><option value="20">20회 간격</option><option value="any20">1~20회 전체</option></select></label>
<label>끝수 칸 이동<select data-lnsr-step><option value="1">바로 옆 1칸</option><option value="2">2칸 이동</option><option value="3">3칸 이동</option><option value="any">1~3칸 모두</option></select></label>
<label>최소 연결점<select data-lnsr-min><option value="3">3점 이상</option><option value="4">4점 이상</option><option value="5">5점 이상</option></select></label>
<label>복기할 대상 회차<input type="number" min="6" inputmode="numeric" data-lnsr-round placeholder="1252"></label>
<label>과거 사례 끝수 필터<select data-lnsr-digit><option value="all">0~9끝수 전체</option><option value="0">0끝</option><option value="1">1끝</option><option value="2">2끝</option><option value="3">3끝</option><option value="4">4끝</option><option value="5">5끝</option><option value="6">6끝</option><option value="7" selected>7끝</option><option value="8">8끝</option><option value="9">9끝</option></select></label>
</div>
<button class="lnsr-search" type="button" data-lnsr-run>📊 지난 결과·이번 후보·미출현 예상 실패까지 복기</button>
<div class="lnsr-status" data-lnsr-status>과거 연결 패턴을 불러옵니다.</div>
<div class="lnsr-cards">
 <div class="lnsr-card" data-lnsr-past></div>
 <div class="lnsr-card current" data-lnsr-current></div>
</div>
<div class="lnsr-note">초록 = <b>출현 연장 관찰</b>, 분홍 = <b>미출현 연장 관찰(제외 가설)</b>, 노랑 = <b>양쪽 신호 충돌</b>. 추첨 후에는 출현 예상 실패와 제외 가설 실패를 모두 기록합니다. 연결을 찾았다는 사실은 당첨 확률이나 제외 정확도가 입증됐다는 뜻이 아닙니다.</div>
<h5>출현 예상 끝수 ↔ 실제 번호와 제외열 충돌</h5>
<div data-lnsr-endings></div>
<h5>과거 실제 적중·제외 실패 통계 (무작위 기대와 비교)</h5>
<div class="lnsr-statgrid" data-lnsr-stats></div>
<div class="lnsr-note">교차되는 <b>1·2·4열 제외</b>는 현재 선택한 열을 과거에도 고정 적용한 가정일 뿐, 그 회차 당시 실제 제외 중라인이 발생했다고 기록한 것이 아닙니다. 연결번호군과 제외열은 위의 끝수 교차 연구 설정을 따릅니다.</div>
<h5>과거 회차별 사전 신호 → 실제 당첨번호</h5>
<div class="lnsr-audit" data-lnsr-cases></div>
<button type="button" class="lnsr-more" data-lnsr-more hidden>더 오래된 회차 보기</button>
`;
const first=host.querySelector('.lneg-tools');if(first)first.before(panel);else host.prepend(panel);
const $=q=>panel.querySelector(q);
let latest=0,model=null,busy=false,retry=false,serial=0,shown=10,cases=[],viewRound=0,selectedDigit=7,exclusionMemo=new Map();
const lastDigitNumbers=d=>Array.from({length:45},(_,i)=>i+1).filter(n=>n%10===d);
const digits=Array.from({length:10},(_,i)=>i);
const probability=d=>{
 const k=lastDigitNumbers(d).length;let none=1;
 for(let i=0;i<6;i++)none*=(45-k-i)/(45-i);
 return 1-none;
};
function cfg(){
 const gap=$('[data-lnsr-gap]').value;
 const sh=$('[data-lnsr-step]').value;
 const dir=$('[data-lnsr-dir]').value;
 return {dirs:dir==='all'?['V','P','N','H']:[dir],
   gaps:gap==='any20'?Array.from({length:20},(_,i)=>i+1):[Number(gap)],
   hops:sh==='any'?[1,2,3]:[Number(sh)],
   min:Number($('[data-lnsr-min]').value),type:'both'};
}
const actual=r=>model?.byDraw?.[r] instanceof Set&&model.byDraw[r].size===6?model.byDraw[r]:null;
const numbers=(r,d)=>actual(r)?[...actual(r)].filter(n=>n%10===d).sort((a,b)=>a-b):[];
const allWinners=r=>actual(r)?[...actual(r)].sort((a,b)=>a-b):[];
const nameDir=kind=>({V:'세로',P:'↗ 대각',N:'↖ 대각',H:'가로'})[kind]||kind;
function classify(round,config){
 const api=window.LNEndingGeometry;
 if(!api)return Array.from({length:10},(_,digit)=>({digit,state:'-',paths:[]}));
 const paths=api.candidatesAt(round,config).all.slice();
 if(config.dirs.includes('H')){
   const horizontal=api.horizontalAt(round-1,config);
   for(const signal of horizontal){
     for(const digit of signal.digits)paths.push({...signal,digit,kind:'H'});
   }
 }
 const result=Array.from({length:10},(_,digit)=>({digit,state:'-',paths:[]}));
 for(const p of paths){
   const row=result[p.digit];
   row.paths.push(p);
 }
 for(const row of result){
   const distinct=new Set(row.paths.map(p=>p.state));
   row.state=distinct.size>1?'B':distinct.size===1?[...distinct][0]:'-';
   row.paths.sort((a,b)=>b.length-a.length||a.gap-b.gap||Math.abs(a.delta)-Math.abs(b.delta));
 }
 return result;
}
function makeBall(n,status,hit){
 const node=document.createElement('span');node.className='lnsr-ball'+(status==='excluded'?' excluded':status==='missed'?' missed':hit?' hit':'');node.textContent=String(n);return node;
}
function stat(t,v,n){
 const div=document.createElement('div');div.className='lnsr-stat';
 const sm=document.createElement('small');sm.textContent=t;
 const b=document.createElement('b');b.textContent=v;
 const p=document.createElement('p');p.textContent=n||'';
 div.append(sm,b,p);return div;
}
function currentExclusion(round){
 const chosen=[...root.querySelectorAll('[data-lned-lanes] input[data-lane]:checked')].map(x=>Number(x.dataset.lane));
 const tier=root.querySelector('[data-lned-tier]')?.value||'1';
 const key=round+'|'+tier+'|'+chosen.slice().sort().join(',');
 const cached=exclusionMemo.get(key);
 if(cached)return cached;
 const nums=[],result=new Set();
 if(!window.LNOverlapAudit||!model?.byDraw)return {set:result,chosen,tier};
 const cnt=window.LNOverlapAudit.countConnections(round,model.byDraw);
 for(let n=1;n<=45;n++)if(cnt[n]>0&&(cnt[n]>=6?'6':String(cnt[n]))===tier)nums.push(n);
 for(let i=0;i<nums.length;i++)if(chosen.includes(i%6))result.add(nums[i]);
 const info={set:result,chosen,tier};
 exclusionMemo.set(key,info);
 return info;
}
function showPath(signal,box){
 box.replaceChildren();
 const body=document.createElement('div');body.className='lnsr-detail';
 const title=document.createElement('strong');
 title.textContent=signal.kind==='H'?
   signal.sourceRound+'회 가로 '+signal.length+'점 → '+signal.round+'회 '+signal.digit+'끝 출현 확인':
   signal.round+'회 '+signal.digit+'끝 · '+nameDir(signal.kind)+' '+signal.length+'점 / '+signal.gap+'회 간격 · '+(signal.state==='O'?'출현':'미출현')+' 연장 가설';
 body.append(title);
 let steps=[];
 if(signal.kind==='H'){
   steps=signal.digits.map(di=>({r:signal.sourceRound,d:di})).concat([{r:signal.round,d:signal.digit,target:true}]);
 }else{
   for(let k=signal.length;k>=1;k--)steps.push({r:signal.round-k*signal.gap,d:signal.digit-k*signal.delta});
   steps.push({r:signal.round,d:signal.digit,target:true});
 }
 for(const item of steps){
   const row=document.createElement('div');row.className='lnsr-step';
   const nr=actual(item.r);
   const endingNums=numbers(item.r,item.d);
   const txt=document.createElement('span');
   txt.textContent=item.r+'회 '+item.d+'끝'+(item.target?' (검증 대상)':' (선행 연결)')+' : '+
     (!nr?'결과 대기':endingNums.length?endingNums.join('·')+'번 출현':'미출현');
   row.append(txt);body.append(row);
 }
 box.append(body);
}
function addList(title,entries,round,div){
 const heading=document.createElement('p');
 heading.textContent=title;div.append(heading);
 if(!entries.length){const t=document.createElement('small');t.textContent='해당 없음';div.append(t);return;}
 const list=document.createElement('div');list.className='lnsr-digits';
 for(const e of entries){
   const btn=document.createElement('button');btn.type='button';
   btn.className='lnsr-digit '+(e.state==='O'?'o':e.state==='X'?'x':'both')+(e.digit===selectedDigit?' active':'');
   const label=document.createElement('b');label.textContent=e.digit+'끝';
   const caption=document.createElement('small');
   caption.textContent=!actual(round)?e.state+' 대기':e.state==='B'?'O/X 충돌':
     e.state==='O'?(numbers(round,e.digit).length?'출현 '+numbers(round,e.digit).join('·'):'예상 실패'):
      (numbers(round,e.digit).length?'제외 실패 '+numbers(round,e.digit).join('·'):'미출현 적중');
   btn.append(label,caption);
   btn.addEventListener('click',()=>{
     selectedDigit=e.digit;$('[data-lnsr-digit]').value=String(e.digit);
     const detail=div.querySelector('[data-lnsr-inline]')||document.createElement('div');
     detail.dataset.lnsrInline='1';
     const path=e.paths[0];
     if(path)showPath(path,detail);
     if(!detail.parentElement)div.append(detail);
     renderEndings();
   });
   list.append(btn);
 }
 div.append(list);
}
function card(round,type){
 const section=type==='past'?$('[data-lnsr-past]'):$('[data-lnsr-current]');
 section.replaceChildren();
 const heading=document.createElement('h5');
 heading.textContent=(type==='past'?'지난 ':'이번 ')+round+'회 · '+(actual(round)?'실제 당첨 복기':'출현·제외 관찰 대상');
 section.append(heading);
 const rows=classify(round,cfg());
 const o=rows.filter(x=>x.state==='O'),x=rows.filter(x=>x.state==='X'),both=rows.filter(x=>x.state==='B');
 addList('🟩 출현 연장 끝수: '+(o.map(x=>x.digit+'끝').join(' · ')||'없음'),o,round,section);
 addList('🟥 미출현(제외) 연장 끝수: '+(x.map(x=>x.digit+'끝').join(' · ')||'없음'),x,round,section);
 if(both.length)addList('🟨 상충 신호: '+both.map(x=>x.digit+'끝').join(' · '),both,round,section);
 const outcome=document.createElement('p');
 if(actual(round)){
   const drawn=allWinners(round);
   outcome.textContent=round+'회 본당첨 6수: '+drawn.join(' · ');
   section.append(outcome);
   const grouped=['O','X','B','-'].map(state=>{
     const nums=drawn.filter(n=>rows[n%10].state===state);
     return {state,nums};
   });
   const names={O:'출현 가설에서 실제 출현',X:'제외 가설에서 당첨 놓침',B:'상충 끝수에서 출현','-':'연결 신호가 없던 끝수에서 출현'};
   for(const g of grouped){
     const p=document.createElement('p');p.textContent=names[g.state]+': '+(g.nums.join(' · ')||'없음');
     section.append(p);
   }
 }else{
   outcome.textContent=round+'회 아직 추첨 전 · O/X는 확정된 당첨 결과가 아니라 과거 연결에서 나온 관찰 신호입니다.';
   section.append(outcome);
 }
}
function digitRow(e,round,exclusion,place){
 const d=e.digit,state=e.state,nums=lastDigitNumbers(d),hits=numbers(round,d);
 const subset=nums.filter(n=>exclusion.set.has(n));
 const remaining=nums.filter(n=>!exclusion.set.has(n));
 const block=document.createElement('div');block.className='lnsr-row '+(state==='O'?'o':state==='X'?'x':state==='B'?'both':'');
 const heading=document.createElement('b');heading.textContent=d+'끝 · '+(state==='O'?'출현 관찰':state==='X'?'미출현·제외 관찰':'O/X 신호 충돌');
 block.append(heading);
 const clue=document.createElement('p');
 clue.textContent='번호 '+nums.join('·')+
   ' · 제외열 '+(subset.join('·')||'없음')+
   ' / 잔여 '+(remaining.join('·')||'없음')+
   (actual(round)?' · 실제 출현 '+(hits.join('·')||'없음'):' · 실제 결과 대기');
 block.append(clue);
 const balls=document.createElement('div');
 for(const n of nums){
   const collides=exclusion.set.has(n);
   const missed=collides&&actual(round)?.has(n);
   balls.append(makeBall(n,missed?'missed':collides?'excluded':'',actual(round)?.has(n)));
 }
 block.append(balls);
 const explain=document.createElement('p');
 explain.textContent=state==='O'?
    '이 끝수 전체가 출현 연장 관찰 대상이며, 물리적 제외열과 겹치는 번호만 따로 표시했습니다.':
    state==='X'?'이 끝수 전체가 미출현 연장 관찰 대상입니다. 여기서 실제 출현한 번호는 제외 가설 실패입니다.':
    '서로 다른 연결에서 출현·미출현 신호가 충돌했으므로 한쪽으로 확정하지 않습니다.';
 block.append(explain);
 if(e.paths.length){
   const btn=document.createElement('button');btn.type='button';btn.textContent='과거 연결 경로·당시 당첨번호 보기';
   const holder=document.createElement('div');
   btn.addEventListener('click',()=>{
     if(holder.childElementCount){holder.replaceChildren();return;}
     showPath(e.paths[0],holder);
   });
   block.append(btn,holder);
 }
 place.append(block);
}
function renderEndings(){
 const round=viewRound,rows=classify(round,cfg()),exclusion=currentExclusion(round),
   area=$('[data-lnsr-endings]');area.replaceChildren();
 const header=document.createElement('p');
 header.textContent=round+'회 '+exclusion.tier+'건 번호군에서 '+
   exclusion.chosen.map(i=>i+1+'열').join('·')+'을 제외한다고 가정합니다. 이 가정은 실제 중라인 제외 판정 기록과 다릅니다.';
 area.append(header);
 const chosen=rows.filter(x=>x.state==='O'||x.state==='X'||x.state==='B');
 const filtered=$('[data-lnsr-digit]').value;
 const visible=filtered==='all'?chosen:chosen.filter(x=>x.digit===Number(filtered));
 if(!visible.length){const note=document.createElement('p');note.textContent='해당 끝수의 조건 성립 신호가 없습니다. 다른 끝수·간격을 선택해 보세요.';area.append(note);}
 for(const row of visible)digitRow(row,round,exclusion,area);
 if(filtered==='all')return;
 // Allow study of a digit without a signal, keeping the status explicit.
 if(!visible.length){
   const digit=Number(filtered);
   const none=rows[digit];
   const hint=document.createElement('p');hint.textContent=digit+'끝은 선택한 조건에서 신호 없음 · 출현/제외 예상으로 분류하지 않습니다.';area.append(hint);
   const nums=lastDigitNumbers(digit),p=document.createElement('p');
   p.textContent='해당 끝수 1~45 번호: '+nums.join(' · ');area.append(p);
 }
}
function summarizeAudit(){
 const out=$('[data-lnsr-stats]');out.replaceChildren();
 let nO=0,hitO=0,expectedO=0,nX=0,safeX=0,expectedX=0,missedX=0,
     predictedOOccurrences=0,expectedNums=0,retainedHit=0,retainedNum=0,excludedHit=0,conflicts=0;
 for(const rec of cases){
   const win=actual(rec.round);
   if(!win)continue;
   const exclusion=rec.exclusion||currentExclusion(rec.round);
   for(const row of rec.rows){
     const nums=numbers(rec.round,row.digit),p=probability(row.digit);
     if(row.state==='O'){
       nO++;hitO+=+(nums.length>0);expectedO+=p;
       predictedOOccurrences+=nums.length;
       const keep=lastDigitNumbers(row.digit).filter(n=>!exclusion.set.has(n));
       retainedNum+=keep.length;
       retainedHit+=keep.filter(n=>win.has(n)).length;
       expectedNums+=keep.length*6/45;
       excludedHit+=lastDigitNumbers(row.digit).filter(n=>exclusion.set.has(n)&&win.has(n)).length;
     }else if(row.state==='X'){
       nX++;safeX+=+(nums.length===0);expectedX+=1-p;
       missedX+=nums.length;
     }else if(row.state==='B')conflicts++;
   }
 }
 out.append(
   stat('과거 동일 연결 신호 검증',cases.length+'회','추첨 결과가 확정된 과거 대상 회차'),
   stat('O·출현 연장 가설',hitO+'/'+nO+'회','무작위 같은 끝수 기대 '+expectedO.toFixed(1)+'회'),
   stat('X·미출현 연장 가설',safeX+'/'+nX+'회','무작위 같은 끝수 기대 '+expectedX.toFixed(1)+'회'),
   stat('제외끝수에서 실제 출현',missedX+'개','X 관찰이 실패해 놓쳤을 당첨번호 총수'),
   stat('O끝수 잔여번호 적중',retainedHit+'개','고정 제외열 바깥 '+retainedNum+'수 · 무작위 기대 '+expectedNums.toFixed(1)+'개'),
   stat('O끝수와 제외열 충돌 실패',excludedHit+'개','고정 제외열 안에서 실제 출현한 번호'),
   stat('신호 상충',conflicts+'건','출현/미출현 연장 조건이 같은 끝수에서 동시에 성립')
 );
}
function renderAudit(){
 const box=$('[data-lnsr-cases]');box.replaceChildren();
 const filter=$('[data-lnsr-digit]').value;
 const filtered=cases.filter(r=>filter==='all'||r.rows[Number(filter)]?.state!=='-');
 const take=filtered.slice(0,shown);
 for(const rec of take){
   const div=document.createElement('details');
   const head=document.createElement('summary');
   const signals=rec.rows.filter(r=>r.state!=='-'&&(filter==='all'||r.digit===Number(filter)));
   const parts=signals.map(r=>r.digit+'끝 '+r.state).join(' · ');
   const bad=signals.filter(r=>r.state==='X').flatMap(r=>numbers(rec.round,r.digit));
   head.textContent=rec.round+'회 · '+(parts||'신호 없음')+' · 실제 '+(allWinners(rec.round).join('·')||'기록 없음')+
     (bad.length?' · 제외 가설 실패 '+bad.join('·'):'');
   div.append(head);
   div.addEventListener('toggle',()=>{
     if(!div.open||div.dataset.done)return;div.dataset.done='1';
     const intro=document.createElement('p');
     intro.textContent=(rec.round-1)+'회까지 결과로 '+rec.round+'회 끝수 신호 계산 · 실제 당첨 6수 '+allWinners(rec.round).join(' · ');
     div.append(intro);
     const exclusion=rec.exclusion||currentExclusion(rec.round);
     for(const row of signals)digitRow(row,rec.round,exclusion,div);
   });
   box.append(div);
 }
 $('[data-lnsr-more]').hidden=shown>=filtered.length;
 $('[data-lnsr-more]').textContent='이전 회차 '+Math.min(10,filtered.length-shown)+'건 더 보기 ('+Math.min(shown,filtered.length)+'/'+filtered.length+')';
}
async function compute(){
 if(busy){serial++;retry=true;return;}
 const api=window.LNEndingGeometry?.getModel();
 if(!api?.last||!api.byDraw){$('[data-lnsr-status]').textContent='끝수 연결 모델을 불러오지 못했습니다. 앱의 자료가 로드된 뒤 다시 시도하세요.';return;}
 model=api;latest=model.last;
 let round=Number($('[data-lnsr-round]').value)||latest+1;
 if(!Number.isInteger(round)||round<6||round>latest+1){$('[data-lnsr-status]').textContent='회차는 6~'+(latest+1)+'회 사이로 선택하세요.';return;}
 viewRound=round;
 const config=cfg(),currentId=++serial;
 const status=$('[data-lnsr-status]'),run=$('[data-lnsr-run]');
 busy=true;run.disabled=true;status.textContent='과거 끝수 신호를 회차별로 복기 중…';
 try{
   exclusionMemo.clear();
   const next=[];
   for(let t=6;t<=latest;t++){
     if(serial!==currentId)return;
     if(!actual(t))continue;
     const rows=classify(t,config);
     if(rows.some(x=>x.state!=='-')){
       const exclusion=currentExclusion(t);
       next.push({round:t,rows,exclusion});
     }
     if(t%20===0){
       status.textContent=t+'/'+latest+'회 · 당시 출현·제외 신호 및 실제 당첨 확인';
       await new Promise(resolve=>requestAnimationFrame(resolve));
     }
   }
   if(serial!==currentId)return;
   cases=next.reverse();shown=10;
   card(Math.max(6,round-1),'past');card(round,'current');
   renderEndings();summarizeAudit();renderAudit();
   status.textContent=round+'회 · '+nameDir(config.dirs[0])+' / '+config.gaps.join('·')+'회 간격 / '+
     config.min+'점 이상 · 검증된 과거 해당 회차 '+cases.length+'회 · 별도의 실제 제외 신호 기록은 적용하지 않음';
 }catch(e){status.textContent='끝수 복기 중 오류: '+e.message;}
 finally{
   busy=false;run.disabled=false;
   if(retry){
     retry=false;
     requestAnimationFrame(()=>compute());
   }
 }
}
function reset(){
 serial++;if(busy){retry=true;return;}
 compute();
}
$('[data-lnsr-run]').addEventListener('click',compute);
for(const sel of panel.querySelectorAll('.lnsr-controls select'))sel.addEventListener('change',()=>{
 selectedDigit=$('[data-lnsr-digit]').value==='all'?-1:Number($('[data-lnsr-digit]').value);
 if(sel.dataset.lnsrDigit){renderEndings();renderAudit();}
 else reset();
});
$('[data-lnsr-round]').addEventListener('change',reset);
$('[data-lnsr-more]').addEventListener('click',()=>{shown+=10;renderAudit();});
for(const sel of root.querySelectorAll('[data-lned-lanes] input[data-lane]'))sel.addEventListener('change',()=>{
 exclusionMemo.clear();reset();
});
root.querySelector('[data-lned-tier]')?.addEventListener('change',()=>{
 exclusionMemo.clear();reset();
});
window.addEventListener('lncs:schedule-ready',()=>{
 serial++;
 if(busy){retry=true;return;}
 const fresh=window.LNEndingGeometry?.getModel();
 if(fresh?.last){
   $('[data-lnsr-round]').max=fresh.last+1;
   $('[data-lnsr-round]').value=String(fresh.last+1);
   compute();
 }
});
window.addEventListener('lneg:ready',()=>{
 if(!model&&window.LNEndingGeometry?.getModel()?.last)compute();
});
const ready=window.LNEndingGeometry?.getModel();
if(ready?.last){
 $('[data-lnsr-round]').max=ready.last+1;
 $('[data-lnsr-round]').value=String(ready.last+1);
 compute();
}
})();
