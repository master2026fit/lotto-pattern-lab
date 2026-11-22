/* Lotto Note: per-draw 0-9 ending digit evidence x fixed 1-6 column exclusion hypothesis (research only). */
(function installEndingDigitCrossLab(){
 'use strict';
 const parent=document.querySelector('#ln-connection-schedule-v1 [data-lnnxt]');
 if(!parent||parent.querySelector('[data-lned]'))return;
 const css=document.createElement('style');
 css.textContent=`
 #ln-connection-schedule-v1 .lned{box-sizing:border-box;min-width:0;max-width:100%;background:#f7fbff;color:#263f54;border:2px solid #9fbad2;border-radius:13px;padding:11px;margin:13px 0}
 #ln-connection-schedule-v1 .lned h6{font-size:17px;font-weight:900;color:#234f6a;margin:0 0 7px}
 #ln-connection-schedule-v1 .lned p{font-size:12px;line-height:1.7;color:#45657b;margin:7px 0}
 #ln-connection-schedule-v1 .lned b{color:#21516c}
 #ln-connection-schedule-v1 .lned .lned-label{font-size:13px;color:#315974;font-weight:900;margin:12px 0 7px}
 #ln-connection-schedule-v1 .lned .lned-controls{display:flex;align-items:end;flex-wrap:wrap;gap:8px;margin:8px 0}
 #ln-connection-schedule-v1 .lned label{display:flex;flex:1 1 145px;min-width:0;flex-direction:column;gap:5px;font-size:12px;color:#315470;font-weight:850}
 #ln-connection-schedule-v1 .lned select,#ln-connection-schedule-v1 .lned input{background:#fff;color:#23445c;border:1px solid #adc8d9;border-radius:8px;padding:9px;min-height:42px;font-size:13px;width:100%;box-sizing:border-box}
 #ln-connection-schedule-v1 .lned button{cursor:pointer;touch-action:manipulation;font-family:inherit;font-weight:900}
 #ln-connection-schedule-v1 .lned button:focus-visible{outline:3px solid #dfaa4b;outline-offset:2px}
 #ln-connection-schedule-v1 .lned button:disabled{opacity:.55;cursor:wait}
 #ln-connection-schedule-v1 .lned [hidden]{display:none!important}
 #ln-connection-schedule-v1 .lned .lned-digits{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px}
 #ln-connection-schedule-v1 .lned .lned-digit{min-width:0;padding:7px 2px;background:#e8f2fb;color:#315472;border:1px solid #a9c4d9;border-radius:9px;min-height:70px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px}
 #ln-connection-schedule-v1 .lned .lned-digit strong{font-size:18px;color:inherit}
 #ln-connection-schedule-v1 .lned .lned-digit small{font-size:10px;line-height:1.45;font-weight:700;color:inherit}
 #ln-connection-schedule-v1 .lned .lned-digit.active{background:#ffe6b3!important;border:2px solid #bc9054!important;color:#533c1e!important}
 #ln-connection-schedule-v1 .lned .lned-digit.gap{background:#e1f1eb;border-color:#93c2b0;color:#275a49}
 #ln-connection-schedule-v1 .lned .lned-note{background:#e5f1fa;border-left:4px solid #7faec9;padding:9px 10px;border-radius:5px;font-size:11px;line-height:1.7;color:#365970;margin:10px 0}
 #ln-connection-schedule-v1 .lned .lned-current{background:#fff;border:1px solid #bfd2de;border-radius:11px;padding:10px;margin:10px 0}
 #ln-connection-schedule-v1 .lned .lned-current p{margin:5px 0}
 #ln-connection-schedule-v1 .lned .lned-balls{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0}
 #ln-connection-schedule-v1 .lned .lned-ball{min-width:39px;min-height:39px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid #b5cbd8;background:#f2f7fb;color:#244962;font-size:13px;font-weight:900;padding:2px 4px;box-sizing:border-box}
 #ln-connection-schedule-v1 .lned .lned-ball.excluded{background:#ffe2e6;color:#993748;border-color:#e6abb4}
 #ln-connection-schedule-v1 .lned .lned-ball.retain{background:#cef1db;color:#1b6642;border-color:#8bc7a7}
 #ln-connection-schedule-v1 .lned .lned-ball.hit{box-shadow:inset 0 0 0 2px #25855b}
 #ln-connection-schedule-v1 .lned .lned-pill{padding:3px 6px;background:#e5f3fb;color:#245572;border:1px solid #bad4e3;border-radius:8px;font-size:11px;font-weight:850}
 #ln-connection-schedule-v1 .lned .lned-lookup{display:flex;align-items:end;gap:7px;flex-wrap:wrap;margin-top:10px}
 #ln-connection-schedule-v1 .lned .lned-lookup label{flex:1 1 90px}
 #ln-connection-schedule-v1 .lned .lned-lookup button,#ln-connection-schedule-v1 .lned .lned-run,#ln-connection-schedule-v1 .lned .lned-more{background:#234f73;color:#fff!important;-webkit-text-fill-color:#fff!important;border:1px solid #153f5e;min-height:42px;padding:9px 12px;border-radius:8px;font-size:12px;letter-spacing:.01em}
 #ln-connection-schedule-v1 .lned .lned-run,#ln-connection-schedule-v1 .lned .lned-more{width:100%;display:block;margin:10px 0}
 #ln-connection-schedule-v1 .lned .lned-status{margin:9px 0;background:#e1edf7;color:#2b5775;border-radius:8px;padding:9px;font-size:12px;line-height:1.55}
 #ln-connection-schedule-v1 .lned .lned-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:9px 0}
 #ln-connection-schedule-v1 .lned .lned-metric{border-radius:9px;background:#fff;border:1px solid #bdd3e0;padding:9px;min-width:0}
 #ln-connection-schedule-v1 .lned .lned-metric small{display:block;color:#5d7889;font-size:10px;line-height:1.6}
 #ln-connection-schedule-v1 .lned .lned-metric strong{font-size:16px;color:#214b66;line-height:1.5}
 #ln-connection-schedule-v1 .lned .lned-metric p{font-size:10px;margin:4px 0 0}
 #ln-connection-schedule-v1 .lned details{background:#fff;border:1px solid #b9d0df;border-radius:9px;margin:7px 0;padding:8px}
 #ln-connection-schedule-v1 .lned summary{cursor:pointer;font-size:12px;font-weight:900;color:#365973;line-height:1.6}
 #ln-connection-schedule-v1 .lned .lned-six{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:4px;margin:10px 0}
 #ln-connection-schedule-v1 .lned .lned-six div{background:#e6f1fa;border:1px solid #b7ccde;border-radius:7px;text-align:center;padding:6px 1px;min-width:0;line-height:1.4;font-weight:800;font-size:10px;color:#315875}
 #ln-connection-schedule-v1 .lned .lned-six div strong{display:block;color:inherit;font-size:14px}
 #ln-connection-schedule-v1 .lned .lned-six div.excluded{background:#ffe4e9;color:#9d3f4c;border-color:#dca0aa}
 #ln-connection-schedule-v1 .lned .lned-six div.selected{background:#e0f4e8;color:#226544;border-color:#a1cbae}
 #ln-connection-schedule-v1 .lned .lned-case{font-size:12px;color:#3a5e74;line-height:1.65}
 #ln-connection-schedule-v1 .lned .lned-history{margin-top:10px}
 #ln-connection-schedule-v1 .lned .lned-checks{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
 #ln-connection-schedule-v1 .lned .lned-checks label{display:flex;flex:0 0 auto;flex-direction:row;align-items:center;background:#f0f6fa;border:1px solid #c5d8e4;border-radius:7px;padding:7px 9px;gap:5px;color:#355670}
 #ln-connection-schedule-v1 .lned .lned-checks input{appearance:auto;width:16px;height:16px;min-height:0;accent-color:#a35b43}
 #ln-connection-schedule-v1 .lned .lned-pattern-table{width:100%;border-collapse:separate;border-spacing:2px;table-layout:fixed;margin:8px 0}
 #ln-connection-schedule-v1 .lned .lned-pattern-table th{font-size:10px;color:#235373;background:#dcebf7;padding:6px 0;border-radius:4px;vertical-align:middle;text-align:center}
 #ln-connection-schedule-v1 .lned .lned-pattern-table th:first-child{width:47px}
 #ln-connection-schedule-v1 .lned .lned-pattern-table td{min-width:0;padding:0}
 #ln-connection-schedule-v1 .lned .lned-pattern-table button{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:0;width:100%;min-height:32px;padding:1px 0;border:1px solid #c4d2dc;border-radius:5px;font-size:11px;background:#ebf1f6;color:#536677;box-sizing:border-box}
 #ln-connection-schedule-v1 .lned .lned-pattern-table button.hit{background:#c8f1db;color:#185b3b;border-color:#8acaa6}
 #ln-connection-schedule-v1 .lned .lned-pattern-table button.miss{background:#ffe0e5;color:#a23f4c;border-color:#e7a8b2}
 #ln-connection-schedule-v1 .lned .lned-pattern-table button.pending{background:#fff0c4;color:#795913;border-color:#d9b979}
 #ln-connection-schedule-v1 .lned .lned-pattern-table button.signal{outline:2px solid #deaa43;outline-offset:-2px}
 #ln-connection-schedule-v1 .lned .lned-pattern-table button.chosen{border:2px solid #1c5b83}
 #ln-connection-schedule-v1 .lned .lned-pattern-table button small{display:block;font-size:8px;line-height:1;color:inherit}
 #ln-connection-schedule-v1 .lned .lned-pattern-table .lned-round{background:#e1eff8;color:#235373;text-align:center;border-radius:4px;font-size:10px;font-weight:850;padding:8px 1px}
 #ln-connection-schedule-v1 .lned .lned-table-more{display:block;width:100%;margin:8px 0;border:1px solid #94b3c8;background:#edf7fd;color:#245578;min-height:38px;padding:8px;font-size:12px;border-radius:8px}
 @media(max-width:700px){
   #ln-connection-schedule-v1 .lncm-master .lned table.lned-pattern-table{display:table!important;width:100%!important;table-layout:fixed!important;border-spacing:1px!important}
   #ln-connection-schedule-v1 .lncm-master .lned .lned-pattern-table thead{display:table-header-group!important}
   #ln-connection-schedule-v1 .lncm-master .lned .lned-pattern-table tbody{display:table-row-group!important;gap:0!important}
   #ln-connection-schedule-v1 .lncm-master .lned .lned-pattern-table tr{display:table-row!important;grid-template-columns:none!important;background:transparent!important;border:0!important;border-radius:0!important;padding:0!important;overflow:visible!important}
   #ln-connection-schedule-v1 .lncm-master .lned .lned-pattern-table th{display:table-cell!important;background:#dcebf7!important;border:0!important;border-radius:3px!important;padding:5px 0!important}
   #ln-connection-schedule-v1 .lncm-master .lned .lned-pattern-table td{display:table-cell!important;min-width:0!important;border:0!important;border-radius:3px!important;background:transparent!important;padding:0!important;overflow:visible!important}
   #ln-connection-schedule-v1 .lncm-master .lned .lned-pattern-table .lned-round{background:#e1eff8!important;color:#235373!important;padding:5px 0!important}
   #ln-connection-schedule-v1 .lned .lned-pattern-table th:first-child{width:42px}
   #ln-connection-schedule-v1 .lned .lned-pattern-table button{font-size:10px!important;padding:2px 0!important;min-height:31px!important}
 }
 @media(min-width:640px){#ln-connection-schedule-v1 .lned .lned-digits{grid-template-columns:repeat(10,minmax(0,1fr))}#ln-connection-schedule-v1 .lned .lned-metrics{grid-template-columns:repeat(3,minmax(0,1fr))}}
 `;
 parent.append(css);
 const section=document.createElement('section');section.className='lned';section.dataset.lned='1';
 section.innerHTML=`
  <h6>🔢 0~9끝수 × 세로·대각 제외라인 교차 연구</h6>
  <p>기존 앱의 <b>끝수 최근 5회 출현·공백</b>, <b>2·3·5회 공백</b>, <b>끝수 두 종류 동시 5회 공백</b> 규칙을 회차별로 복원합니다. 끝수가 '필출'로 확정됐다는 의미는 아닙니다.</p>
  <div class="lned-label">다음 회차 끝수 0~9 전체 검색 <span data-lned-target-label></span></div>
  <div data-lned-digits class="lned-digits"></div>
  <div class="lned-label">회차별 0~9끝수 O/X · 최신 회차부터</div>
  <p>O: 본당첨에 해당 끝수 출현, X: 미출현, ?: 추첨 전. <b>금색 테두리</b>는 선택한 공백·출현 조건이 추첨 전에 성립했다는 뜻입니다. 칸을 누르면 그 회차와 끝수를 조회합니다.</p>
  <table class="lned-pattern-table" aria-label="회차별 끝수 0부터 9까지 실제 출현표">
    <thead><tr><th scope="col">회차</th><th scope="col">0</th><th scope="col">1</th><th scope="col">2</th><th scope="col">3</th><th scope="col">4</th><th scope="col">5</th><th scope="col">6</th><th scope="col">7</th><th scope="col">8</th><th scope="col">9</th></tr></thead>
    <tbody data-lned-timeline></tbody>
  </table>
  <button type="button" data-lned-table-more class="lned-table-more">과거 25회 더 보기</button>
  <div class="lned-controls">
    <label>끝수 신호 조건
      <select data-lned-signal>
       <option value="gap2">최근 2회 공백</option>
       <option value="gap3">최근 3회 공백</option>
       <option value="gap5">최근 5회 공백</option>
       <option value="pair5">다른 끝수와 함께 5회 공백</option>
       <option value="present5">최근 5회 출현</option>
       <option value="all">모든 회차(조건 없음)</option>
      </select>
    </label>
    <label>연결번호군 (끝수는 0~9 전체 동일)
      <select data-lned-tier>
        <option value="1">1건 중복</option>
        <option value="2">2건 중복</option>
        <option value="3">3건 중복</option>
        <option value="4">4건 중복</option>
        <option value="5">5건 중복</option>
        <option value="6">6건 이상</option>
      </select>
    </label>
    <label>회차 이동
      <input type="number" data-lned-round min="6" inputmode="numeric" placeholder="예: 1252">
    </label>
    <button type="button" data-lned-goto>회차 보기</button>
  </div>
  <div data-lned-current class="lned-current"></div>
  <div class="lned-label">교차 검증용 제외 가정: 어떤 세로열을 제외할까요?</div>
  <div class="lned-checks" data-lned-lanes></div>
  <div class="lned-note">1·2·4열은 현재 관찰하신 <b>제외 중라인</b>과 비교하기 위한 고정 가정입니다. 선택한 번호군에서 번호를 오름차순으로 6칸씩 배치했을 때의 열입니다. 과거 모든 회차에서 그 열에 동일한 제외 신호가 있었음을 뜻하지 않습니다. 이 연구 표는 실제 제외라인 판정 기록과 분리해서 계산합니다.</div>
  <button type="button" class="lned-run" data-lned-run>📊 선택 끝수 · 과거 전체 회차 교차복기</button>
  <div data-lned-status class="lned-status">끝수·제외열을 선택하고 과거 검증을 실행하세요.</div>
  <div data-lned-metrics class="lned-metrics"></div>
  <div data-lned-history class="lned-history"></div>
  <button type="button" class="lned-more" data-lned-more hidden>이전 회차 12개 더 보기</button>
  <div class="lned-note">무작위 비교는 각 회차의 <b>잔여 후보 개수를 동일하게 유지</b>했을 때의 출현 기대치입니다. 끝수 신호·제외열 모두 과거 결과를 보기 전에 정해지는 규칙만 적용합니다. 단, 이 교차 조합은 현재 사례를 보고 설정한 연구 가설이므로 과거 복기 우위가 미래 예측력의 증거는 아닙니다.</div>
 `;
 const prev=parent.querySelector('[data-lnvd]')||parent.querySelector('[data-lnhi]');
 if(prev)prev.after(section);else parent.append(section);
 const $=q=>section.querySelector(q);
 const digits=Array.from({length:10},(_,d)=>d);
 const numberList=d=>Array.from({length:45},(_,i)=>i+1).filter(n=>n%10===d);
 const rngChanceAny=k=>{
   if(k<=0)return 0;
   let none=1;for(let i=0;i<6;i++)none*=(45-k-i)/(45-i);
   return 1-none;
 };
 const fmt=p=>(100*p).toFixed(1)+'%';
 let model=null,byDraw=null,last=0,chosenDigit=7,viewRound=0,records=[],showCount=12,busy=false,serial=0,timelineCount=25,tier='1';
 let builtRounds=new Map();
 const signalSelect=$('[data-lned-signal]'),digitHost=$('[data-lned-digits]');
 const selectedLanes=new Set([0,1,3]);
 for(let i=0;i<6;i++){
   const label=document.createElement('label');
   const input=document.createElement('input');input.type='checkbox';input.checked=selectedLanes.has(i);input.dataset.lane=String(i);
   input.addEventListener('change',()=>{
     if(input.checked)selectedLanes.add(i);else selectedLanes.delete(i);
     invalidate();drawCurrent();
   });
   const txt=document.createElement('span');txt.textContent=(i+1)+'열';label.append(input,txt);
   $('[data-lned-lanes]').append(label);
 }
 const recent=(r,period,d)=>{
   if(r<=period)return null;
   let count=0;
   for(let t=r-period;t<r;t++){
     if(!(byDraw[t] instanceof Set)||byDraw[t].size!==6)return null;
     for(const n of byDraw[t])if(n%10===d)count++;
   }
   return count;
 };
 const gap=(r,d)=>{
   for(let t=r-1;t>=1;t--){
     const actual=byDraw[t];
     if(!(actual instanceof Set)||actual.size!==6)return null;
     if([...actual].some(n=>n%10===d))return r-1-t;
   }
   return r-1;
 };
 const pair5=(r,d)=>digits.filter(other=>other!==d&&recent(r,5,other)===0&&recent(r,5,d)===0);
 const flag=(r,d,kind)=>{
   const c5=recent(r,5,d),c3=recent(r,3,d),c2=recent(r,2,d);
   if(c5===null||c3===null||c2===null)return false;
   if(kind==='gap2')return c2===0;
   if(kind==='gap3')return c3===0;
   if(kind==='gap5')return c5===0;
   if(kind==='pair5')return pair5(r,d).length>0;
   if(kind==='present5')return c5>0;
   return true;
 };
 function laneData(round){
   if(builtRounds.has(round))return builtRounds.get(round);
   const c=window.LNOverlapAudit?.countConnections(round,byDraw);
   if(!c)return null;
   const nums=[];for(let n=1;n<=45;n++)if(c[n]>0&&(c[n]>=6?'6':String(c[n]))===tier)nums.push(n);
   const lanes=Array.from({length:6},(_,j)=>nums.filter((n,i)=>i%6===j));
   const value={nums,lanes};
   builtRounds.set(round,value);return value;
 }
 const intersection=(a,b)=>a.filter(x=>b.has(x));
 function statusDigit(round,d){
   const actual=byDraw[round];
   if(!(actual instanceof Set)||actual.size!==6)return null;
   const hits=intersection(numberList(d),actual);
   return hits;
 }
 const getExclusionSet=lanes=>{
   const set=new Set();
   for(const i of selectedLanes)for(const n of lanes[i]||[])set.add(n);
   return set;
 };
 const labelSignal=kind=>({gap2:'최근 2회 공백',gap3:'최근 3회 공백',gap5:'최근 5회 공백',
   pair5:'두 끝수 동시 5회 공백',present5:'최근 5회 출현',all:'전체 회차'})[kind]||kind;
 function renderTimeline(){
   const body=$('[data-lned-timeline]');body.replaceChildren();
   if(!last)return;
   const first=last+1,min=Math.max(6,first-timelineCount+1);
   const fragment=document.createDocumentFragment();
   for(let r=first;r>=min;r--){
     const row=document.createElement('tr'),round=document.createElement('td');
     round.className='lned-round';round.textContent=r+'회';row.append(round);
     const actual=byDraw[r];
     for(const digit of digits){
       const td=document.createElement('td'),btn=document.createElement('button');
       const has=actual instanceof Set&&actual.size===6;
       const hit=has&&[...actual].some(n=>n%10===digit);
       const val=!has?'?':hit?'O':'X';
       btn.type='button';
       btn.className=(!has?'pending':hit?'hit':'miss')+
         (flag(r,digit,signalSelect.value)?' signal':'')+
         (digit===chosenDigit&&r===viewRound?' chosen':'');
       btn.textContent=val;
       const mark=document.createElement('small');
       const c5=recent(r,5,digit);
       mark.textContent=c5===null?'':c5+'';
       btn.append(mark);
       btn.setAttribute('aria-label',r+'회 '+digit+'끝수, 실제 '+(val==='O'?'출현':val==='X'?'미출현':'대기')+
         ', 직전 5회 '+(c5===null?'자료 부족':c5+'개 출현')+
         (flag(r,digit,signalSelect.value)?', 선택한 사전 조건 성립':''));
       btn.addEventListener('click',()=>{
         chosenDigit=digit;viewRound=r;invalidate();renderDigitButtons();renderTimeline();drawCurrent();
         section.querySelector('[data-lned-current]')?.scrollIntoView({behavior:'smooth',block:'nearest'});
       });
       td.append(btn);row.append(td);
     }
     fragment.append(row);
   }
   body.append(fragment);
   const more=$('[data-lned-table-more]');more.hidden=min===6;
   more.textContent='이전 '+Math.min(25,min-6)+'회 더 보기 ('+(first-min+1)+'/'+(first-5)+')';
 }
 function renderDigitButtons(){
   digitHost.replaceChildren();
   for(const digit of digits){
     const c5=recent(viewRound,5,digit),g=gap(viewRound,digit);
     const btn=document.createElement('button');btn.type='button';
     btn.className='lned-digit'+(digit===chosenDigit?' active':'')+(g>=2?' gap':'');
     const header=document.createElement('strong');header.textContent=digit+'끝';
     const count=document.createElement('small');count.textContent='5회 '+(c5===null?'—':c5+'개');
     const mark=document.createElement('small');mark.textContent='연속공백 '+(g===null?'—':g+'회');
     btn.setAttribute('aria-pressed',String(digit===chosenDigit));
     btn.append(header,count,mark);
     btn.addEventListener('click',()=>{chosenDigit=digit;invalidate();renderDigitButtons();renderTimeline();drawCurrent();});
     digitHost.append(btn);
   }
 }
 function makeBall(n,cls){
   const elem=document.createElement('span');
   elem.className='lned-ball '+cls;
   elem.textContent=String(n);return elem;
 }
 function drawCurrent(){
   if(!model)return;
   $('[data-lned-target-label]').textContent=' · '+viewRound+'회 기준';
   $('[data-lned-round]').value=String(viewRound);
   const box=$('[data-lned-current]');box.replaceChildren();
   const c5=recent(viewRound,5,chosenDigit),g=gap(viewRound,chosenDigit);
   const p=document.createElement('p');p.textContent=viewRound+'회 · '+chosenDigit+'끝수 · '+tier+'건 중복군 교차 · '+
     (c5===null?'과거 5회 데이터 부족':'직전 5회 '+c5+'개 출현 / 연속 공백 '+g+'회')+
     ' · 선택 조건: '+labelSignal(signalSelect.value)+' '+(flag(viewRound,chosenDigit,signalSelect.value)?'성립':'불성립');
   box.append(p);
   const pairs=pair5(viewRound,chosenDigit);
   const note=document.createElement('p');note.textContent=pairs.length?'같이 5회 공백인 다른 끝수: '+pairs.join('·')+'끝':'동시 5회 공백 끝수쌍 없음';
   box.append(note);
   const nums=numberList(chosenDigit),data=laneData(viewRound),excluded=data?getExclusionSet(data.lanes):new Set();
   const remaining=nums.filter(n=>!excluded.has(n));
   const currentOutcome=statusDigit(viewRound,chosenDigit);
   const legend=document.createElement('p');
   legend.textContent='분홍: 고정 제외열에 포함 · 초록: 제외열 밖에 남음 · 당첨번호를 아는 회차는 ✓로 표시';
   box.append(legend);
   const balls=document.createElement('div');balls.className='lned-balls';
   for(const n of nums)balls.append(makeBall(n,(excluded.has(n)?'excluded':'retain')+(currentOutcome?.includes(n)?' hit':'')));
   box.append(balls);
   const exact=document.createElement('p');
   exact.textContent=nums.length+'수 중 고정 제외열 중복 '+nums.filter(n=>excluded.has(n)).length+
     '수 ('+nums.filter(n=>excluded.has(n)).join('·')+'번), 잔여 '+remaining.length+'수 ('+remaining.join('·')+'번).';
   box.append(exact);
   if(currentOutcome){
     const res=document.createElement('p');
     res.textContent='실제 '+viewRound+'회 '+chosenDigit+'끝수 출현: '+(currentOutcome.join('·')+'번'||'없음')+
       ' · 잔여군 출현 '+remaining.filter(n=>currentOutcome.includes(n)).length+'수';
     box.append(res);
   }else{
     const pending=document.createElement('p');
     pending.textContent=viewRound+'회 본당첨 결과 미확정 · 모든 번호는 연구 후보입니다.';
     box.append(pending);
   }
 }
 const statCard=(label,value,note)=>{
   const div=document.createElement('div');div.className='lned-metric';
   const small=document.createElement('small');small.textContent=label;
   const b=document.createElement('strong');b.textContent=value;
   const p=document.createElement('p');p.textContent=note;
   div.append(small,b,p);return div;
 };
 function renderStats(){
   const area=$('[data-lned-metrics]');area.replaceChildren();
   let endWins=0,remainingHits=0,excludedHits=0,expectedHits=0,remainAny=0,excludedAny=0,expectAny=0,
       keptNums=0,removedNums=0;
   for(const r of records){
     endWins+=r.endHits.length>0?1:0;remainingHits+=r.remainHits.length;
     excludedHits+=r.excludedHits.length;expectedHits+=r.remaining.length*6/45;
     remainAny+=+(r.remainHits.length>0);excludedAny+=+(r.excludedHits.length>0);
     expectAny+=rngChanceAny(r.remaining.length);
     keptNums+=r.remaining.length;removedNums+=r.excluded.length;
   }
   const n=records.length,k=numberList(chosenDigit).length,baseline=rngChanceAny(k);
   const pct=(num,den)=>den?((100*num/den).toFixed(1)+'%'):'—';
   area.append(
     statCard('끝수 조건 맞은 과거 회차',n+'회',labelSignal(signalSelect.value)+' · 대상 회차 이전 결과만 사용'),
     statCard('해당 끝수 실제 출현',endWins+'/'+n,pct(endWins,n)+' · 무작위 끝수 출현 기준 '+fmt(baseline)),
     statCard('교차 후 잔여수',keptNums+'수','회차별 합계 · 평균 '+(n?(keptNums/n).toFixed(2):'—')+'수/회'),
     statCard('잔여번호 실제 출현',remainingHits+'수','무작위 동일 개수 기대 '+expectedHits.toFixed(1)+'수'),
     statCard('잔여번호 1수 이상 출현',remainAny+'/'+n,'무작위 동일 개수 기준 기대 '+expectAny.toFixed(1)+'회'),
     statCard('제외 가정 번호에서 당첨 누락',excludedHits+'수','회차별 제외번호 합계 '+removedNums+'수'),
     statCard('제외 가정 실패 회차',excludedAny+'/'+n,pct(excludedAny,n)+' · 제외군 내 1수 이상 실제 출현')
   );
   $('[data-lned-status]').textContent='분석 완료: '+n+'회 · '+chosenDigit+'끝수 '+labelSignal(signalSelect.value)+
     ' · 잔여군 '+remainingHits+'수/기대 '+expectedHits.toFixed(1)+'수 · 무작위 대비 성공 여부는 별도 전진 검증 필요';
 }
 function recordCard(r){
   const item=document.createElement('details');
   const summary=document.createElement('summary');
   summary.textContent=r.round+'회 · '+chosenDigit+'끝 출현 '+(r.endHits.join('·')||'없음')+
     ' · 잔여 '+r.remainHits.length+'수 / 제외 쪽 누락 '+r.excludedHits.length+'수';
   item.append(summary);
   item.addEventListener('toggle',()=>{
     if(!item.open||item.dataset.rendered)return;
     item.dataset.rendered='1';
     const result=document.createElement('p');result.className='lned-case';
     result.textContent='실제 본당첨 '+[...r.actual].sort((a,b)=>a-b).join('·')+'번 / 당시 '+chosenDigit+'끝: '+
       (r.endHits.join('·')||'출현 없음');
     item.append(result);
     const six=document.createElement('div');six.className='lned-six';
     r.lanes.forEach((lane,i)=>{
       const div=document.createElement('div');
       div.className=selectedLanes.has(i)?'excluded':'selected';
       const title=document.createElement('strong');title.textContent=(i+1)+'열';
       const label=document.createElement('small');label.textContent=(selectedLanes.has(i)?'제외 가정':'잔여 열');
       const contents=document.createElement('p');contents.textContent=lane.join('·')||'없음';
       div.append(title,label,contents);six.append(div);
     });
     item.append(six);
     const balls=document.createElement('div');balls.className='lned-balls';
     for(const n of numberList(chosenDigit)){
       const ball=makeBall(n,(r.exclusionSet.has(n)?'excluded':'retain')+(r.actual.has(n)?' hit':''));
       balls.append(ball);
     }
     item.append(balls);
     const explain=document.createElement('p');
     explain.textContent='직전 5회 '+r.fiveCount+'개 출현 · '+r.gap+'회 공백 → '+r.round+'회 당첨 대조 · '+
       '잔여 '+(r.remaining.join('·')||'없음')+' / 제외 '+(r.excluded.join('·')||'없음');
     item.append(explain);
   });
   return item;
 }
 function renderRecords(){
   const box=$('[data-lned-history]');box.replaceChildren();
   for(let i=0;i<Math.min(showCount,records.length);i++)box.append(recordCard(records[i]));
   const btn=$('[data-lned-more]');btn.hidden=showCount>=records.length;
   btn.textContent='더 오래된 회차 '+Math.min(12,records.length-showCount)+'개 보기 ('+
     Math.min(showCount,records.length)+'/'+records.length+')';
 }
 function invalidate(){
   serial++;records=[];showCount=12;
   $('[data-lned-metrics]').replaceChildren();$('[data-lned-history]').replaceChildren();
   $('[data-lned-more]').hidden=true;
   if(busy){busy=false;$('[data-lned-run]').disabled=false;}
   $('[data-lned-status]').textContent='설정을 변경했습니다. 새 조건으로 교차복기를 실행하세요.';
 }
 async function runAudit(){
   if(!model||!window.LNOverlapAudit||busy)return;
   const auditId=++serial;
   busy=true;const button=$('[data-lned-run]');button.disabled=true;
   const selectedKind=signalSelect.value,selectedDigit=chosenDigit;
   const choose=new Set(selectedLanes),found=[];
   try{
     for(let round=6;round<=last;round++){
       if(serial!==auditId)return;
       if(!(byDraw[round] instanceof Set)||byDraw[round].size!==6)continue;
       if(!flag(round,selectedDigit,selectedKind))continue;
       const data=laneData(round);
       if(!data)continue;
       const exclusionSet=new Set(choose.size?[...choose].flatMap(i=>data.lanes[i]):[]);
       const digitNums=numberList(selectedDigit),excluded=digitNums.filter(n=>exclusionSet.has(n));
       const remaining=digitNums.filter(n=>!exclusionSet.has(n));
       const actual=byDraw[round],endHits=intersection(digitNums,actual),
         remainHits=intersection(remaining,actual),excludedHits=intersection(excluded,actual);
       found.push({round,lanes:data.lanes,actual,exclusionSet,excluded,remaining,endHits,remainHits,excludedHits,
         fiveCount:recent(round,5,selectedDigit),gap:gap(round,selectedDigit)});
       if(round%20===0){
         $('[data-lned-status]').textContent=round+'/'+last+'회 처리 중 · 이전 회차 번호군 복원';
         await new Promise(resolve=>requestAnimationFrame(resolve));
       }
     }
     if(serial!==auditId)return;
     records=found.reverse();showCount=12;
     renderStats();renderRecords();
   }catch(e){$('[data-lned-status]').textContent='계산 중 오류: '+e.message;}
   finally{if(serial===auditId){busy=false;button.disabled=false;}}
 }
 function changeTarget(){
   const input=$('[data-lned-round]');const n=Number(input.value);
   if(!Number.isInteger(n)||n<6||n>last+1){
     $('[data-lned-status]').textContent='회차는 6~'+(last+1)+'회 범위에서 선택해 주세요.';return;
   }
   viewRound=n;renderDigitButtons();renderTimeline();drawCurrent();
 }
 $('[data-lned-goto]').addEventListener('click',changeTarget);
 $('[data-lned-round]').addEventListener('change',changeTarget);
 signalSelect.addEventListener('change',()=>{invalidate();renderTimeline();drawCurrent();});
 $('[data-lned-tier]').addEventListener('change',()=>{
   tier=$('[data-lned-tier]').value;
   builtRounds.clear();invalidate();drawCurrent();
 });
 $('[data-lned-table-more]').addEventListener('click',()=>{timelineCount=Math.min(last-4,timelineCount+25);renderTimeline();});
 $('[data-lned-run]').addEventListener('click',runAudit);
 $('[data-lned-more]').addEventListener('click',()=>{showCount+=12;renderRecords();});
 function refresh(){
   const next=window.LNConnectionSchedule?.getModel();
   if(!next?.last||!next.byDraw||!window.LNOverlapAudit)return;
   if(next===model)return;
   model=next;byDraw=next.byDraw;last=next.last;builtRounds.clear();
   viewRound=last+1;timelineCount=25;invalidate();renderDigitButtons();renderTimeline();drawCurrent();
 }
 window.addEventListener('lncs:schedule-ready',refresh);
 window.addEventListener('lnco:ready',refresh);
 refresh();
})();
