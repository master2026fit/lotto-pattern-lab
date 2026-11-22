/* Lotto Note: selected ending-line inclusion/exclusion overview, distinct from O/X forecast signals. */
(function installEndingLineOverview(){
 'use strict';
 const host=document.querySelector('#ln-connection-schedule-v1 [data-lned]');
 if(!host||host.querySelector('[data-lnel]'))return;
 const style=document.createElement('style');
 style.textContent=[
 '#ln-connection-schedule-v1 .lned .lnel{margin:0 0 14px;padding:13px;border:2px solid #d5ad69;background:#fffdf6;border-radius:13px;color:#304c60;box-sizing:border-box;scroll-margin-top:15px}',
 '#ln-connection-schedule-v1 .lned .lnel *{box-sizing:border-box}',
 '#ln-connection-schedule-v1 .lned .lnel h6{margin:0 0 5px;color:#795119;font-size:17px;font-weight:900}',
 '#ln-connection-schedule-v1 .lned .lnel p{margin:5px 0 9px;font-size:11px;line-height:1.7;color:#4f6778}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-bar{display:flex;align-items:end;gap:7px;flex-wrap:wrap;margin:10px 0}',
 '#ln-connection-schedule-v1 .lned .lnel label{display:flex;flex:1;min-width:110px;flex-direction:column;gap:3px;font-size:11px;color:#36556c;font-weight:850}',
 '#ln-connection-schedule-v1 .lned .lnel input{background:#fff;border:1px solid #a1b9c9;border-radius:8px;color:#23465d;min-height:40px;padding:7px;font-size:13px;font-weight:800;width:100%}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-go,#ln-connection-schedule-v1 .lned .lnel .lnel-clear{min-height:40px;padding:8px 11px;border-radius:8px;border:1px solid #9db6ca;font-size:12px;font-weight:850;background:#244e6c;color:#fff!important}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-clear{background:#f1f5f8;color:#375874!important}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-status{padding:8px;border:1px solid #cbd5de;border-radius:7px;background:#f6f9fc;color:#4b6377;font-size:11px;line-height:1.6}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-summary{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:9px 0}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-group{border-radius:10px;padding:10px 9px;min-width:0;border:1px solid #c2d4db;background:#fff}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-group.exclude{border-color:#df9aab;background:#ffe9ed}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-group.include{border-color:#97caaa;background:#e0f4e8}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-group strong{display:block;color:#32556c;font-size:12px}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-group.exclude strong{color:#9c354d}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-group.include strong{color:#175f40}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-group b{display:block;font-size:18px;color:#284e64;line-height:1.5;word-break:break-word}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-digits{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin:9px 0}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-digits button{min-width:0;min-height:65px;padding:5px 1px;border:1px solid #a9c3d0;border-radius:9px;background:#eff5f8;color:#31516a!important;display:flex;flex-direction:column;align-items:center;justify-content:center}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-digits button.exclude{background:#f9d5de!important;color:#8d2b44!important;border:2px solid #d38296}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-digits button.include{background:#d4f0de!important;color:#1c6142!important;border:1px solid #8dc5a4}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-digits button strong{font-size:20px;color:inherit}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-digits button small{font-size:10px;color:inherit}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-numbers{background:#fff;border:1px solid #c0d4dd;border-radius:9px;padding:9px;margin:7px 0;color:#34556d}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-numbers b{font-size:12px;color:#284f67}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-number-row{margin:5px 0;padding:4px 0;border-bottom:1px solid #e0e8ee;font-size:12px;line-height:1.6}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-number-row:last-child{border:0}',
 '#ln-connection-schedule-v1 .lned .lnel details{border:1px solid #bed0db;background:#fff;padding:8px;border-radius:9px;margin:7px 0}',
 '#ln-connection-schedule-v1 .lned .lnel summary{cursor:pointer;font-size:12px;font-weight:900;color:#28516b}',
 '#ln-connection-schedule-v1 .lned .lnel .lnel-note{border-left:4px solid #cba866;background:#fff4d7;padding:8px;border-radius:5px;font-size:11px;line-height:1.7;color:#6b5328}',
 '@media(min-width:680px){#ln-connection-schedule-v1 .lned .lnel .lnel-digits{grid-template-columns:repeat(10,minmax(0,1fr))}}',
 '@media(max-width:390px){#ln-connection-schedule-v1 .lned .lnel{padding:9px}#ln-connection-schedule-v1 .lned .lnel .lnel-group b{font-size:15px}}'
 ].join('\n');
 host.append(style);
 const panel=document.createElement('section');
 panel.className='lnel';panel.dataset.lnel='1';
 panel.innerHTML=[
 '<h6>🎯 이번 회차 끝수: 해당 ↔ 제외라인</h6>',
 '<p>현재 제외라인으로 보신 끝수는 따로 표시합니다. 나머지는 <b>제외하지 않은 해당 끝수</b>입니다. 끝수 전체를 제외하는 가설이며 기존 세로열 제외, 출현/미출현(O/X) 패턴 신호와는 구별합니다.</p>',
 '<div class="lnel-bar"><label>확인 회차<input type="number" inputmode="numeric" min="1" data-lnel-round></label>',
 '<button type="button" class="lnel-go" data-lnel-go>회차 보기</button><button type="button" class="lnel-clear" data-lnel-clear>이번 표시 초기화</button></div>',
 '<div class="lnel-status" data-lnel-status>최근 당첨기록을 확인하는 중입니다.</div>',
 '<div class="lnel-summary"><div class="lnel-group exclude"><strong>🚫 제외라인으로 보는 끝수</strong><b data-lnel-excluded>—</b></div>',
 '<div class="lnel-group include"><strong>✅ 나머지 해당 끝수</strong><b data-lnel-included>—</b></div></div>',
 '<div class="lnel-digits" data-lnel-digits></div>',
 '<p>끝수 칸을 누르면 <b>해당 ↔ 제외</b>가 바뀌고 이 기기에 해당 회차별로 저장됩니다.</p>',
 '<div class="lnel-numbers" data-lnel-excluded-numbers></div>',
 '<details data-lnel-included-details><summary>✅ 해당 끝수의 1~45 전체 번호 펼치기</summary><div data-lnel-included-numbers></div></details>',
 '<div class="lnel-note">중요: 이 분류는 사용자가 설정한 <b>끝수 제외 가설</b>이지, 당첨 제외가 확정됐다는 의미가 아닙니다. 7끝수가 다른 패턴에서 출현 연결로 잡혀도 양쪽 신호를 그대로 유지해 복기할 수 있습니다. 조합기 번호를 자동으로 제외하지 않습니다.</div>'
 ].join('');
 const first=host.querySelector('.lned-label');
 if(first)first.before(panel);else host.prepend(panel);
 const $=q=>panel.querySelector(q);
 const STORE='ln_ending_line_marked_v1';
 let round=0,last=0;
 const all=Array.from({length:10},(_,i)=>i);
 const groups=d=>Array.from({length:45},(_,i)=>i+1).filter(n=>n%10===d);
 const clean=a=>[...new Set((Array.isArray(a)?a:[]).map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<=9))].sort((a,b)=>a-b);
 function read(){
   try{const val=JSON.parse(localStorage.getItem(STORE)||'{}');return val&&typeof val==='object'&&!Array.isArray(val)?val:{};}catch(_){return {};}
 }
 function marks(r){
   const saved=read();
   if(Object.prototype.hasOwnProperty.call(saved,r)&&Array.isArray(saved[r]))return {digits:clean(saved[r]),source:'저장된 분류'};
   if(r===1252)return {digits:[6,7,9],source:'1252회 사용자 관찰 분류'};
   return {digits:[],source:'제외라인 미지정'};
 }
 function save(r,digits){
   const saved=read();saved[r]=clean(digits);
   try{localStorage.setItem(STORE,JSON.stringify(saved));}catch(_){}
 }
 function numberRows(where,digits){
   const out=$(where);out.replaceChildren();
   if(!digits.length){const line=document.createElement('p');line.textContent='지정된 끝수가 없습니다.';out.append(line);return;}
   for(const d of digits){
     const div=document.createElement('div');div.className='lnel-number-row';
     div.textContent=d+'끝 : '+groups(d).join(' · ');
     out.append(div);
   }
 }
 function currentLast(){
   const m=window.LNConnectionSchedule?.getModel();
   return Number(m?.last)||Number(window.LNEndingGeometry?.getModel()?.last)||0;
 }
 function show(){
   if(!last)last=currentLast();
   if(!last){$('[data-lnel-status]').textContent='당첨 데이터가 준비되면 끝수 표시가 나옵니다.';return;}
   if(!round||round>last+1)round=last+1;
   $('[data-lnel-round]').max=last+1;
   $('[data-lnel-round]').value=String(round);
   const chosen=marks(round),excluded=chosen.digits,included=all.filter(d=>!excluded.includes(d));
   $('[data-lnel-excluded]').textContent=excluded.length?excluded.map(d=>d+'끝').join(' · '):'미지정';
   $('[data-lnel-included]').textContent=(chosen.source==='제외라인 미지정'?'잠정 전체 · ':'')+included.map(d=>d+'끝').join(' · ');
   $('[data-lnel-status]').textContent=round+'회 · '+chosen.source+' · 제외 '+excluded.length+'끝수 / 해당 '+included.length+'끝수'+(round<=last?' · 추첨완료 회차(사전 예측 기록 아님)':' · 추첨 전 관찰');
   const grid=$('[data-lnel-digits]');grid.replaceChildren();
   for(const d of all){
     const excludedDigit=excluded.includes(d);
     const btn=document.createElement('button');btn.type='button';btn.className=excludedDigit?'exclude':'include';
     btn.setAttribute('aria-pressed',excludedDigit?'true':'false');
     const title=document.createElement('strong');title.textContent=d+'끝';
     const small=document.createElement('small');small.textContent=excludedDigit?'제외라인':'해당 끝수';
     btn.append(title,small);
     btn.addEventListener('click',()=>{
       const next=excludedDigit?excluded.filter(n=>n!==d):clean(excluded.concat(d));
       save(round,next);show();
     });
     grid.append(btn);
   }
   numberRows('[data-lnel-excluded-numbers]',excluded);
   numberRows('[data-lnel-included-numbers]',included);
 }
 function gotoRound(){
   const target=Number($('[data-lnel-round]').value);
   if(!Number.isInteger(target)||target<1||target>last+1){
     $('[data-lnel-status]').textContent='회차는 1~'+(last+1)+'회에서 선택하세요.';return;
   }
   round=target;show();
 }
 $('[data-lnel-go]').addEventListener('click',gotoRound);
 $('[data-lnel-round]').addEventListener('change',gotoRound);
 $('[data-lnel-clear]').addEventListener('click',()=>{save(round,[]);show();});
 window.addEventListener('lncs:schedule-ready',()=>{
   const newer=currentLast();
   if(newer){
     const previous=last;
     last=newer;
     if(!round||round===previous+1||round>last+1)round=last+1;
     show();
   }
 });
 last=currentLast();
 if(last){round=last+1;show();}
})();