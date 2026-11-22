/* Lotto Note: 0-9 last-digit geometric O/X pattern search with true historical pre-draw validation. */
(function installEndingGeometryLab(){
  'use strict';
  const root=document.querySelector('#ln-connection-schedule-v1 [data-lned]');
  if(!root||root.querySelector('[data-lneg]'))return;
  const css=document.createElement('style');
  css.textContent=`
  #ln-connection-schedule-v1 .lned .lneg{border:2px solid #9ab9d0;background:#f8fbff;border-radius:12px;padding:11px;margin:15px 0;color:#244965;box-sizing:border-box;width:100%;min-width:0}
  #ln-connection-schedule-v1 .lned .lneg h6{font-size:17px;color:#214f70;margin:0 0 8px;font-weight:900}
  #ln-connection-schedule-v1 .lned .lneg p{font-size:11px;line-height:1.65;color:#42647b;margin:5px 0 8px}
  #ln-connection-schedule-v1 .lned .lneg .lneg-title{font-size:13px;color:#224f6e;margin:11px 0 5px;font-weight:900}
  #ln-connection-schedule-v1 .lned .lneg .lneg-tools{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:9px 0}
  #ln-connection-schedule-v1 .lned .lneg .lneg-tools label{display:flex;flex-direction:column;gap:4px;color:#34566e;font-size:11px;font-weight:800;min-width:0}
  #ln-connection-schedule-v1 .lned .lneg .lneg-tools select,#ln-connection-schedule-v1 .lned .lneg .lneg-tools input{width:100%;min-height:41px;padding:8px 6px;border:1px solid #9fbace;background:#fff;color:#26445c;border-radius:8px;font-size:12px;font-weight:800;box-sizing:border-box}
  #ln-connection-schedule-v1 .lned .lneg button{cursor:pointer;touch-action:manipulation}
  #ln-connection-schedule-v1 .lned .lneg button:disabled{opacity:.6;cursor:wait}
  #ln-connection-schedule-v1 .lned .lneg [hidden]{display:none!important}
  #ln-connection-schedule-v1 .lned .lneg .lneg-actions{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
  #ln-connection-schedule-v1 .lned .lneg .lneg-actions button{flex:1;min-height:45px;border-radius:9px;background:#245579!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border:1px solid #17415e!important;font-size:12px!important;font-weight:900!important;padding:8px}
  #ln-connection-schedule-v1 .lned .lneg .lneg-status{background:#e6f3fc;border:1px solid #b9d1e2;border-radius:8px;padding:9px;font-size:11px;line-height:1.65;color:#315a77;margin:8px 0}
  #ln-connection-schedule-v1 .lned .lneg .lneg-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;margin:8px 0}
  #ln-connection-schedule-v1 .lned .lneg .lneg-stat{border:1px solid #bbd0df;background:#fff;padding:8px;min-width:0;border-radius:9px}
  #ln-connection-schedule-v1 .lned .lneg .lneg-stat small{display:block;font-size:10px;color:#5f7b8d;line-height:1.4}
  #ln-connection-schedule-v1 .lned .lneg .lneg-stat b{display:block;font-size:15px;color:#235370;line-height:1.5}
  #ln-connection-schedule-v1 .lned .lneg .lneg-stat p{font-size:10px;line-height:1.4;margin:2px 0}
  #ln-connection-schedule-v1 .lned .lneg .lneg-predictions{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;margin:7px 0}
  #ln-connection-schedule-v1 .lned .lneg .lneg-digit{min-width:0;min-height:61px;border:1px solid #b1c9da;border-radius:8px;background:#eaf2f8;color:#255575;font-weight:900;padding:5px 2px;display:flex;align-items:center;justify-content:center;gap:2px;flex-direction:column}
  #ln-connection-schedule-v1 .lned .lneg .lneg-digit small{font-size:9px;font-weight:700;color:inherit}
  #ln-connection-schedule-v1 .lned .lneg .lneg-digit b{font-size:17px;color:inherit}
  #ln-connection-schedule-v1 .lned .lneg .lneg-digit.possible{background:#d5f1df;color:#206044;border-color:#8ac6a3}
  #ln-connection-schedule-v1 .lned .lneg .lneg-digit.absence{background:#ffe1e6;color:#a04250;border-color:#dea1ae}
  #ln-connection-schedule-v1 .lned .lneg .lneg-digit.conflict{background:#fff1d6;color:#805b21;border-color:#c9a45d}
  #ln-connection-schedule-v1 .lned .lneg .lneg-row{display:flex;gap:6px;align-items:center;justify-content:space-between;min-height:49px;padding:7px;border:1px solid #bcd2df;background:#fff;border-radius:9px;margin:5px 0}
  #ln-connection-schedule-v1 .lned .lneg .lneg-row-label{font-size:11px;color:#325671;line-height:1.55;flex:1;min-width:0}
  #ln-connection-schedule-v1 .lned .lneg .lneg-row-label b{font-size:12px;color:#204c65}
  #ln-connection-schedule-v1 .lned .lneg .lneg-row button{min-width:75px;min-height:38px;background:#ecf6ff;color:#275571;border:1px solid #9cbcd2;border-radius:8px;font-size:11px;font-weight:900;padding:7px}
  #ln-connection-schedule-v1 .lned .lneg details{background:#fff;border:1px solid #b8cedf;border-radius:9px;padding:8px;margin:6px 0}
  #ln-connection-schedule-v1 .lned .lneg summary{font-size:12px;color:#315876;font-weight:850;line-height:1.5;cursor:pointer}
  #ln-connection-schedule-v1 .lned .lneg .lneg-step{display:flex;align-items:center;gap:7px;margin:6px 0}
  #ln-connection-schedule-v1 .lned .lneg .lneg-step .lneg-dot{flex:0 0 33px;min-height:33px;display:flex;align-items:center;justify-content:center;font-weight:900;border-radius:7px;background:#e8eef3;color:#325671;border:1px solid #b9cfdb}
  #ln-connection-schedule-v1 .lned .lneg .lneg-step .lneg-dot.hit{background:#c7f1dc;color:#14633e;border-color:#8dc6a8}
  #ln-connection-schedule-v1 .lned .lneg .lneg-step .lneg-dot.miss{background:#ffe3e7;color:#983b4e;border-color:#dca0ab}
  #ln-connection-schedule-v1 .lned .lneg .lneg-step .lneg-dot.pending{background:#ffecbd;color:#825c21;border-color:#d5b46b}
  #ln-connection-schedule-v1 .lned .lneg .lneg-step .lneg-step-description{font-size:11px;color:#31546d;line-height:1.4}
  #ln-connection-schedule-v1 .lned .lneg .lneg-step .lneg-step-description small{display:block;font-size:9px;color:#617c90}
  #ln-connection-schedule-v1 .lned .lneg .lneg-detail button{border-radius:8px;min-height:37px;background:#e3f2ff;color:#24516f;border:1px solid #a9c4d5;padding:8px;font-size:11px;font-weight:850}
  #ln-connection-schedule-v1 .lned .lneg .lneg-separator{border-top:1px solid #c8dbe7;margin:9px 0}
  #ln-connection-schedule-v1 .lned .lneg .lneg-breakdown{display:grid;gap:5px;margin:8px 0}
  #ln-connection-schedule-v1 .lned .lneg .lneg-break-row{background:#fff;border:1px solid #c1d2df;border-radius:9px;padding:7px;display:flex;justify-content:space-between;gap:7px;align-items:center;color:#315a73;font-size:11px;line-height:1.55}
  #ln-connection-schedule-v1 .lned .lneg .lneg-break-row b{color:#214e6a;font-size:12px}
  #ln-connection-schedule-v1 .lned .lneg .lneg-break-row small{font-size:10px;color:#5c7285}
  #ln-connection-schedule-v1 .lned .lneg .lneg-caution{background:#fff5dc;border-left:4px solid #d7b26d;border-radius:7px;padding:9px;line-height:1.6;font-size:11px;color:#6f5828;margin:8px 0}
  @media(min-width:640px){#ln-connection-schedule-v1 .lned .lneg .lneg-tools{grid-template-columns:repeat(3,minmax(0,1fr))}#ln-connection-schedule-v1 .lned .lneg .lneg-summary{grid-template-columns:repeat(3,minmax(0,1fr))}#ln-connection-schedule-v1 .lned .lneg .lneg-predictions{grid-template-columns:repeat(10,minmax(0,1fr))}}
  `;
  root.append(css);
  const panel=document.createElement('section');panel.className='lneg';panel.dataset.lneg='1';
  panel.innerHTML=`
   <h6>🔎 끝수 0~9 · 가로·세로·대각·건너뛰기 패턴 검색</h6>
   <p><b>O는 해당 끝수가 실제 출현, X는 미출현</b>한 자리입니다. 끝수표의 회차(세로)와 끝수 0~9(가로)를 함께 검색합니다. 회차·끝수 이동 간격을 고정하여 3·4·5점 이상 연결을 확인하고, 다음 칸은 별도 검증합니다.</p>
   <div class="lneg-tools">
     <label>연결 방향<select data-lneg-dir>
       <option value="all">전체: 가로+세로+양쪽 대각</option>
       <option value="V">세로 · 같은 끝수</option>
       <option value="P">대각 ↗ · 끝수 증가</option>
       <option value="N">대각 ↖ · 끝수 감소</option>
       <option value="H">가로 · 같은 회차</option>
     </select></label>
     <label>회차 간격 (건너뛰기)<select data-lneg-gap>
       <option value="any20">1~20회 전수</option>
       <option value="1">직전 연결 · 1회</option>
       <option value="2">1회 건너뛰기 · 2회</option>
       <option value="3">2회 건너뛰기 · 3회</option>
       <option value="4">3회 건너뛰기 · 4회</option>
       <option value="5">4회 건너뛰기 · 5회</option>
       <option value="10">10회 간격</option>
       <option value="20">20회 간격</option>
       <option value="any80">1~80회 전수 (확장)</option>
     </select></label>
     <label>끝수 칸 간격<select data-lneg-shift>
       <option value="any">1~3칸 전수</option>
       <option value="1">바로 옆 · 1칸</option>
       <option value="2">1칸 건너 · 2칸</option>
       <option value="3">2칸 건너 · 3칸</option>
     </select></label>
     <label>최소 연결<select data-lneg-min>
       <option value="3">3점 이상</option>
       <option value="4">4점 이상</option>
       <option value="5">5점 이상</option>
     </select></label>
     <label>출현·미출현<select data-lneg-type>
       <option value="both">O·X 모두</option>
       <option value="O">O 연속</option>
       <option value="X">X 연속</option>
     </select></label>
     <label>확인 회차<input type="number" data-lneg-round inputmode="numeric" min="4" placeholder="최신 다음 회차"></label>
   </div>
   <div class="lneg-actions">
     <button type="button" data-lneg-run>🔍 끝수 패턴 전체 검색·복기</button>
     <button type="button" data-lneg-current>최신 회차로</button>
   </div>
   <div class="lneg-status" data-lneg-status>실제 회차 기록을 확인하고 있습니다.</div>
   <div class="lneg-title" data-lneg-outlook-title>다음 회차의 연결 대기 끝수</div>
   <div class="lneg-predictions" data-lneg-outlook></div>
   <p data-lneg-explanation>O/X 연속 조건이 실제로 이어질지는 추첨 전에는 알 수 없습니다. 연결 패턴은 연구 대상이며 당첨 보장이 아닙니다.</p>
   <div class="lneg-title">확인 회차의 연결 경로 · 눌러서 선행 회차와 실제 숫자 보기</div>
   <div data-lneg-lines></div>
   <div class="lneg-title">과거 전체 동일 검색조건 복기</div>
   <div data-lneg-summary class="lneg-summary"></div>
   <div class="lneg-title">방향별·끝수별 실제 연장 · 무작위 기준 비교</div>
   <div data-lneg-breakdown class="lneg-breakdown"></div>
   <div class="lneg-title">최근 과거 일치 사례 (출현·미출현 정답 대조)</div>
   <div data-lneg-examples></div>
   <div class="lneg-caution"><b>가로:</b> 같은 회차 내 끝수 사이의 배열로, 이 자체만으로 다음 회차 끝수를 예측할 수 없습니다. 가로 검색은 직전 회차에서 그 도형을 보았을 때 다음 회차의 <b>같은 끝수들</b>이 얼마나 출현했는지를 별도로 비교합니다. 세로·대각은 선행 3점 이상으로 다음 끝수의 동일 O/X 연장을 가정해 과거를 복기합니다. 과거에 우연히 연결된 것을 많이 찾아도 미래 성능은 별도 실전 확인이 필요합니다.</div>
  `;
  // Place immediately after the 0..9 O/X matrix and before exclusion controls.
  const oldTimeline=root.querySelector('[data-lned-table-more]');
  if(oldTimeline)oldTimeline.after(panel);else root.querySelector('[data-lned-digits]')?.after(panel);
  const $=q=>panel.querySelector(q);
  let model=null,last=0,byDraw=null,matrix=[],selectedRound=0,serial=0,busy=false,retry=false;
  const baseP=d=>{
    const count=d>=1&&d<=5?5:4;let p=1;
    for(let i=0;i<6;i++)p*=(45-count-i)/(45-i);
    return 1-p;
  };
  const digitNumbers=d=>Array.from({length:45},(_,i)=>i+1).filter(n=>n%10===d);
  const outcome=(r,d)=>matrix[r]&&matrix[r][d]!==null&&matrix[r][d]!==undefined?matrix[r][d]:null;
  function rebuild(){
    model=window.LNConnectionSchedule?.getModel();
    if(!model?.last||!model.byDraw)return false;
    last=model.last;byDraw=model.byDraw;
    matrix=Array.from({length:last+2},(_,r)=>{
      const draw=byDraw[r];
      if(!(draw instanceof Set)||draw.size!==6)return null;
      const row=Array(10).fill(0);
      for(const n of draw)row[n%10]=1;
      return row;
    });
    selectedRound=last+1;
    $('[data-lneg-round]').max=last+1;
    $('[data-lneg-round]').value=String(selectedRound);
    return true;
  }
  const settings=()=>{
    const dir=$('[data-lneg-dir]').value,gap=$('[data-lneg-gap]').value,
      sh=$('[data-lneg-shift]').value;
    const gaps=gap==='any80'?Array.from({length:80},(_,i)=>i+1):
      gap==='any20'?Array.from({length:20},(_,i)=>i+1):[Number(gap)];
    const hops=sh==='any'?[1,2,3]:[Number(sh)];
    const dirs=dir==='all'?['V','P','N','H']:[dir];
    return {gaps,hops,dirs,min:Number($('[data-lneg-min]').value),type:$('[data-lneg-type]').value};
  };
  const nameDir=d=>({V:'세로',P:'↗ 대각 (끝수 증가)',N:'↖ 대각 (끝수 감소)',H:'가로'})[d]||d;
  // Every source point is strictly earlier than the target draw, including
  // skipped-round paths. This is reusable for true historical walk-forward.
  function candidatesAt(round,cfg){
    const best=new Map(),all=[],steps=[];
    for(const direction of cfg.dirs){
      if(direction==='H')continue;
      const ds=direction==='V'?[0]:direction==='P'?cfg.hops:cfg.hops.map(x=>-x);
      for(const gap of cfg.gaps)for(const delta of ds)for(let digit=0;digit<10;digit++){
        let rr=round-gap,dd=digit-delta;
        if(rr<1||dd<0||dd>9)continue;
        const original=outcome(rr,dd);
        if(original===null)continue;
        const state=original?'O':'X';
        if(cfg.type!=='both'&&state!==cfg.type)continue;
        let length=0;
        while(rr>=1&&dd>=0&&dd<=9&&outcome(rr,dd)===original){
          length++;rr-=gap;dd-=delta;
        }
        if(length<cfg.min)continue;
        const path={kind:direction,round,digit,gap,delta,length,state,
          source:round-gap,sourceDigit:digit-delta};
        all.push(path);
        const previous=best.get(digit);
        if(!previous||length>previous.length||
          (length===previous.length&&(gap<previous.gap||
           (gap===previous.gap&&Math.abs(delta)<Math.abs(previous.delta)))))
          best.set(digit,path);
      }
    }
    return {all,best:[...best.values()].sort((a,b)=>b.length-a.length||a.gap-b.gap||a.digit-b.digit)};
  }
  // Horizontal patterns are fully observed *within one historical draw*.
  // Distinct maximal same-state chains avoid counting every short substring
  // as a separate independent example.
  function horizontalAt(round,cfg){
    if(!cfg.dirs.includes('H'))return [];
    const out=[];
    for(const step of cfg.hops)for(let digit=0;digit<10;digit++){
      const st=outcome(round,digit);
      if(st===null)continue;
      const type=st?'O':'X';
      if(cfg.type!=='both'&&cfg.type!==type)continue;
      if(digit-step>=0&&outcome(round,digit-step)===st)continue;
      const path=[],positions=[];
      for(let d=digit;d<10&&outcome(round,d)===st;d+=step)positions.push(d);
      if(positions.length<cfg.min)continue;
      out.push({kind:'H',round:round+1,sourceRound:round,digit:digit,
        gap:0,delta:step,length:positions.length,state:type,digits:positions});
    }
    return out.sort((a,b)=>b.length-a.length||a.digit-b.digit);
  }
  const actualDigits=(r,d)=>{
    const draw=byDraw[r];return draw instanceof Set?[...draw].filter(n=>n%10===d).sort((a,b)=>a-b):[];
  };
  const stat=(label,value,small)=>{
    const div=document.createElement('div');div.className='lneg-stat';
    const title=document.createElement('small');title.textContent=label;
    const bold=document.createElement('b');bold.textContent=value;
    const text=document.createElement('p');text.textContent=small||'';
    div.append(title,bold,text);return div;
  };
  function cross(digit,round){
    const r=Math.max(6,Math.min(last+1,Number(round)||last+1));
    const roundControl=root.querySelector('[data-lned-round]');
    if(roundControl){
      roundControl.value=String(r);
      roundControl.dispatchEvent(new Event('change',{bubbles:true}));
    }
    const buttons=root.querySelectorAll('[data-lned-digits] button');
    const button=buttons[digit];
    if(button){
      button.click();
      root.querySelector('[data-lned-current]')?.scrollIntoView({behavior:'smooth',block:'nearest'});
    }
  }
  function stepsFor(sig){
    const points=[];
    if(sig.kind==='H'){
      for(const d of sig.digits)points.push({r:sig.sourceRound,d});
      for(const d of sig.digits)points.push({r:sig.round,d,target:true});
    }else{
      for(let k=sig.length;k>=1;k--){
        points.push({r:sig.round-k*sig.gap,d:sig.digit-k*sig.delta});
      }
      points.push({r:sig.round,d:sig.digit,target:true});
    }
    return points;
  }
  function detailFor(sig,place){
    place.replaceChildren();
    const outer=document.createElement('div');outer.className='lneg-detail';
    const header=document.createElement('p');
    header.textContent=sig.kind==='H'?
      sig.sourceRound+'회 가로 '+sig.state+' '+sig.length+'점 · '+sig.delta+'칸씩 이동 · 바로 다음 '+sig.round+'회 같은 끝수 확인':
      sig.round+'회 '+sig.digit+'끝 · '+nameDir(sig.kind)+' '+sig.state+' '+sig.length+'점 · 회차 간격 '+sig.gap+'회 / 끝수 이동 '+sig.delta;
    outer.append(header);
    for(const step of stepsFor(sig)){
      const actual=outcome(step.r,step.d);
      const code=actual===null?'?':actual?'O':'X';
      const row=document.createElement('div');row.className='lneg-step';
      const mark=document.createElement('span');mark.className='lneg-dot '+(code==='O'?'hit':code==='X'?'miss':'pending');mark.textContent=code;
      const desc=document.createElement('span');desc.className='lneg-step-description';
      const suffix=step.target?' · 다음 비교 칸':' · 이전 연결 칸';
      desc.textContent=step.r+'회 '+step.d+'끝수'+suffix;
      const micro=document.createElement('small');
      micro.textContent=code==='?'?'아직 추첨 전':code==='X'?'해당 끝수 미출현':'실제 '+(actualDigits(step.r,step.d).join('·')||'')+'번 출현';
      desc.append(micro);row.append(mark,desc);outer.append(row);
    }
    const note=document.createElement('p');
    note.textContent=sig.kind==='H'?'가로 O/X 배열은 해당 회차에서만 관찰한 결과입니다. 다른 회차의 같은 끝수 출현은 별도의 비교이며 예측 확정이 아닙니다.':
      '선행 '+sig.length+'점은 실제 과거 관찰, 대상 회차 '+sig.digit+'끝수의 O/X는 이어지거나 끊어질 수 있습니다.';
    outer.append(note);
    const btn=document.createElement('button');btn.type='button';btn.textContent='이 끝수 × 제외라인 교차 보기';
    btn.addEventListener('click',()=>cross(sig.digit,sig.round));outer.append(btn);
    place.append(outer);
    if(place.scrollIntoView)place.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function renderPreview(pre,round,cfg){
    const title=$('[data-lneg-outlook-title]'),out=$('[data-lneg-outlook]'),
      lines=$('[data-lneg-lines]');out.replaceChildren();lines.replaceChildren();
    title.textContent=round+'회 · 끝수 O/X 연결 대상 (예상 확정 아님)';
    const byDigit=new Map(pre.best.map(p=>[p.digit,p]));
    const allIn=new Map();
    for(const path of pre.all){
      const set=allIn.get(path.digit)||new Set();set.add(path.state);
      allIn.set(path.digit,set);
    }
    const horizontal=horizontalAt(round-1,cfg);
    const horizontalDig=new Set(horizontal.flatMap(x=>x.digits));
    for(let digit=0;digit<10;digit++){
      const signal=byDigit.get(digit),button=document.createElement('button');
      button.type='button';
      const conflict=allIn.get(digit)?.size>1;
      button.className='lneg-digit'+(conflict?' conflict':signal?(signal.state==='O'?' possible':' absence'):'');
      const head=document.createElement('b');head.textContent=digit+'끝';
      const text=document.createElement('small');
      text.textContent=conflict?'O/X 충돌':signal?signal.state+'연장 '+signal.length+'점':
        horizontalDig.has(digit)?'가로 관찰':'연결 없음';
      button.append(head,text);
      if(signal){button.addEventListener('click',()=>detailFor(signal,lines));}
      else{button.addEventListener('click',()=>cross(digit,round));}
      out.append(button);
    }
    const group=pre.all.slice().sort((a,b)=>b.length-a.length||a.gap-b.gap||a.digit-b.digit);
    const selectedPaths=group.slice(0,24);
    for(const signal of selectedPaths){
      const row=document.createElement('div');row.className='lneg-row';
      const label=document.createElement('div');label.className='lneg-row-label';
      const title=document.createElement('b');
      title.textContent=signal.digit+'끝 '+signal.state+' '+signal.length+'점 · '+nameDir(signal.kind);
      const detail=document.createElement('div');
      detail.textContent='회차 '+signal.gap+'회 간격 · 끝수 '+(signal.delta===0?'동일':(signal.delta>0?'+':'')+signal.delta+'칸 이동')+
        ' · 대상 '+signal.round+'회 '+(outcome(signal.round,signal.digit)===null?'?':outcome(signal.round,signal.digit)?'O':'X');
      label.append(title,detail);
      const button=document.createElement('button');button.type='button';button.textContent='경로 보기';
      button.addEventListener('click',()=>detailFor(signal,lines));
      row.append(label,button);lines.append(row);
    }
    if(group.length>24){
      const p=document.createElement('p');
      p.textContent='연결 경로 '+group.length+'개 중 긴 순서 24개를 표시했습니다. 동일 끝수의 겹치는 경로는 과거 검증에서 중복 적중으로 세지 않습니다.';
      lines.append(p);
    }
    if(horizontal.length){
      const heading=document.createElement('div');heading.className='lneg-title';heading.textContent=(round-1)+'회 · 가로(같은 회차) O/X 연결 '+horizontal.length+'개';lines.append(heading);
      for(const sig of horizontal.slice(0,12)){
        const row=document.createElement('div');row.className='lneg-row';
        const label=document.createElement('div');label.className='lneg-row-label';
        label.textContent=sig.sourceRound+'회 '+sig.state+' '+sig.length+'점 · 끝수 '+sig.digits.map(x=>x+'끝').join(' → ');
        const btn=document.createElement('button');btn.type='button';btn.textContent='가로 복기';
        btn.addEventListener('click',()=>detailFor(sig,lines));
        row.append(label,btn);lines.append(row);
      }
    }
    if(!group.length&&!horizontal.length){
      const info=document.createElement('p');info.textContent='선택한 연속 점·간격 조건에 맞는 이전 끝수 연결이 없습니다.';lines.append(info);
    }
  }
  const fmt=n=>n===0?'0':Number(n).toFixed(1);
  function renderStats(stats,hori,cfg){
    const host=$('[data-lneg-summary]');host.replaceChildren();
    if(cfg.dirs.every(d=>d==='H')){
      host.append(
        stat('가로 도형 · 이전 회차 조건',hori.cases+'건','같은 회차 가로 O/X '+cfg.min+'점 이상 배열'),
        stat('다음 회차 실제 같은 끝수 출현',hori.wins+' / '+hori.total+'수','전체 가로 도형 내 끝수를 모아 중복 제거 후 대조'),
        stat('무작위 동일 끝수 기대',fmt(hori.expected)+'수','끝수별 4~5개 번호의 기본 출현율 합계')
      );
      return;
    }
    const n=stats.total,ratio=n?stats.correct/n:0;
    host.append(
      stat('세로·대각 대상',n+'건','회차×끝수 중 같은 칸의 경로가 여러 개면 1건으로 집계'),
      stat('동일 O/X 실제 연장',stats.correct+'/'+n,'성공률 '+(n?(100*ratio).toFixed(1)+'%':'—')),
      stat('무작위 동일 상태 기대',fmt(stats.expected)+'건','각 끝수의 전체 번호 수를 반영'),
      stat('O 연장 / X 연장',stats.oWin+'/'+stats.oN+' · '+stats.xWin+'/'+stats.xN,'성공=이전 O/X와 대상 O/X가 같음'),
      stat('최근 160회 실제 연장',stats.holdWin+'/'+stats.holdN,'이전 구간 '+stats.trainWin+'/'+stats.trainN+'건과 분리'),
      stat('대기 중인 다음 대상 끝수',stats.pending+'개','연결이 실제로 이어질지는 미확정')
    );
    if(cfg.dirs.includes('H'))host.append(
      stat('가로 도형 다음 회차 참고',hori.wins+'/'+hori.total+'수','가로 배열에 있던 끝수들이 다음 회차에 출현한 번호군')
    );
  }
  function breakdown(rows,byDigit,cfg,hori){
    const out=$('[data-lneg-breakdown]');out.replaceChildren();
    if(cfg.dirs.length===1&&cfg.dirs[0]==='H'){
      const p=document.createElement('p');
      p.textContent='가로는 과거 같은 회차 내 끝수 배열입니다. 다음 회차 동일 끝수 관찰은 위의 가로 별도 통계로 표시합니다.';
      out.append(p);return;
    }
    const list=[['V','세로'],['P','↗ 대각'],['N','↖ 대각']];
    const make=(name,r)=>{
      if(!r.n)return;
      const row=document.createElement('div');row.className='lneg-break-row';
      const label=document.createElement('span');label.textContent=name;
      const value=document.createElement('span');const head=document.createElement('b');
      head.textContent=r.win+'/'+r.n+' ('+(100*r.win/r.n).toFixed(1)+'%)';
      const base=document.createElement('small');base.textContent=' / 무작위 기대 '+r.expected.toFixed(1)+'건';
      value.append(head,base);row.append(label,value);out.append(row);
    };
    for(const [kind,label] of list)if(cfg.dirs.includes(kind))make(label+' 대표 경로',rows[kind]);
    const note=document.createElement('p');note.textContent='대표 경로는 같은 회차·끝수에서 가장 긴 선행 연결을 선택합니다. 아래는 끝수별 동일 O/X 실제 연장 횟수이며, 단순히 많이 검색됐다는 뜻이 아닙니다.';out.append(note);
    for(let d=0;d<10;d++)make(d+'끝수',byDigit[d]);
  }
  function exampleCard(item,horiz=false){
    const d=document.createElement('details'),summary=document.createElement('summary');
    const result=horiz?item.follow+'수 출현':item.correct?'실제 같은 O/X 연장':'실제 연결 중단';
    summary.textContent=horiz?item.sig.sourceRound+'회 '+item.sig.state+' 가로 '+item.sig.length+'점 → '+item.sig.round+'회 '+result:
      item.sig.round+'회 '+item.sig.digit+'끝 '+item.sig.state+' '+item.sig.length+'점 '+nameDir(item.sig.kind)+' → '+result;
    d.append(summary);
    d.addEventListener('toggle',()=>{if(!d.open||d.dataset.filled)return;d.dataset.filled='1';const content=document.createElement('div');detailFor(item.sig,content);d.append(content);});
    return d;
  }
  function renderSamples(samples,hori,cfg){
    const out=$('[data-lneg-examples]');out.replaceChildren();
    const horizontalOnly=cfg.dirs.length===1&&cfg.dirs[0]==='H';
    const source=horizontalOnly?hori.examples:samples;
    for(const row of source.slice(-12).reverse())out.append(exampleCard(row,horizontalOnly));
    if(!source.length){const p=document.createElement('p');p.textContent='선택 조건에 맞는 과거 사례 없음';out.append(p);}
  }
  async function compute(){
    if(busy){serial++;retry=true;return;}
    if(!model&&!rebuild())return;
    const id=++serial,cfg=settings(),button=$('[data-lneg-run]'),
      status=$('[data-lneg-status]'),chosen=Number($('[data-lneg-round]').value);
    if(!Number.isInteger(chosen)||chosen<4||chosen>last+1){
      status.textContent='확인 회차는 4~'+(last+1)+'회 중 선택하세요.';return;
    }
    selectedRound=chosen;busy=true;button.disabled=true;
    const stats={total:0,correct:0,expected:0,oN:0,oWin:0,xN:0,xWin:0,trainN:0,trainWin:0,holdN:0,holdWin:0,pending:0},
      hori={cases:0,total:0,wins:0,expected:0,examples:[]},
      statsByDir=Object.fromEntries(['V','P','N'].map(x=>[x,{n:0,win:0,expected:0}])),
      statsByDigit=Array.from({length:10},()=>({n:0,win:0,expected:0})),
      samples=[];let preview=null,scanCount=0;
    try{
      const start=4,holdStart=Math.max(4,last-159);
      for(let round=start;round<=last+1;round++){
        if(serial!==id)return;
        const valid=matrix[round]!==null||round===last+1;
        if(!valid)continue;
        const look=candidatesAt(round,cfg);
        if(round===chosen)preview=look;
        for(const sig of look.best){
          const y=outcome(round,sig.digit);
          if(y===null){if(round===last+1)stats.pending++;continue;}
          const correct=(y===1)===(sig.state==='O');
          stats.total++;stats.correct+=+correct;
          const expected=sig.state==='O'?baseP(sig.digit):1-baseP(sig.digit);
          stats.expected+=expected;
          statsByDir[sig.kind].n++;statsByDir[sig.kind].win+=+correct;statsByDir[sig.kind].expected+=expected;
          statsByDigit[sig.digit].n++;statsByDigit[sig.digit].win+=+correct;statsByDigit[sig.digit].expected+=expected;
          if(sig.state==='O'){stats.oN++;stats.oWin+=+correct;}
          else{stats.xN++;stats.xWin+=+correct;}
          if(round>=holdStart){stats.holdN++;stats.holdWin+=+correct;}
          else{stats.trainN++;stats.trainWin+=+correct;}
          if(samples.length>=80)samples.shift();
          samples.push({sig,correct});
        }
        if(cfg.dirs.includes('H')&&round>=2){
          const horizontal=horizontalAt(round-1,cfg);
          if(horizontal.length){
            // Each digit in the same target draw is evaluated only once, even if
            // several horizontal arrangements include it.
            const unique=new Set(horizontal.flatMap(x=>x.digits));
            for(const digit of unique){
              const actual=outcome(round,digit);
              if(actual===null)continue;
              hori.total++;hori.wins+=actual;hori.expected+=baseP(digit);
            }
            for(const sig of horizontal){
              if(round<=last){
                hori.cases++;
                const nextHits=sig.digits.filter(x=>outcome(round,x)===1).length;
                if(hori.examples.length>=60)hori.examples.shift();
                hori.examples.push({sig,follow:nextHits});
              }
            }
          }
        }
        scanCount++;
        if(round%20===0){
          status.textContent='과거 '+round+'/'+last+'회 · 끝수 0~9 모든 경로 검색 중…';
          await new Promise(resolve=>requestAnimationFrame(resolve));
        }
      }
      if(serial!==id)return;
      if(!preview)preview=candidatesAt(chosen,cfg);
      renderPreview(preview,chosen,cfg);
      renderStats(stats,hori,cfg);
      breakdown(statsByDir,statsByDigit,cfg,hori);
      renderSamples(samples,hori,cfg);
      status.textContent='검색 완료 · '+scanCount+'회 확인 · 회차 간격 '+(cfg.gaps.length===1?cfg.gaps[0]:cfg.gaps[0]+'~'+cfg.gaps.at(-1))+
        '회, 끝수 간격 '+cfg.hops.join('·')+'칸, '+cfg.min+'점 이상 / '+
        (cfg.type==='both'?'O·X':cfg.type)+' · 대상 '+chosen+'회';
      $('[data-lneg-explanation]').textContent='끝수 0~9 각각에 대해 선행 '+cfg.min+
        '점 이상의 O/X 연결만으로 신호를 만들었습니다. 대상 회차의 실제 출현 여부를 예측 전에 확인한 기록처럼 표시하지 않습니다. 같은 회차·끝수에 여러 경로가 겹쳐도 성적은 1건만 셉니다.';
    }catch(e){status.textContent='끝수 패턴 검색 오류: '+e.message;}
    finally{
      busy=false;button.disabled=false;
      if(retry){
        retry=false;
        requestAnimationFrame(()=>{
          if(window.LNConnectionSchedule?.getModel()!==model)rebuild();
          compute();
        });
      }
    }
  }
  $('[data-lneg-run]').addEventListener('click',compute);
  $('[data-lneg-current]').addEventListener('click',()=>{
    if(!model&&!rebuild())return;
    $('[data-lneg-round]').value=String(last+1);
    compute();
  });
  for(const sel of panel.querySelectorAll('.lneg-tools select'))sel.addEventListener('change',compute);
  $('[data-lneg-round]').addEventListener('change',compute);
  window.addEventListener('lncs:schedule-ready',()=>{
    serial++;
    if(busy){
      retry=true;
      return;
    }
    if(rebuild())compute();
  });
  if(rebuild())compute();
})();
