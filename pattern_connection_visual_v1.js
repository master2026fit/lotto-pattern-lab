/* LOTTO NOTE - SVG continuation diagrams for expanded confirmed-source paths. */
(()=>{
  'use strict';
  const ROOT='#ln-connection-schedule-v1';
  const root=document.querySelector(ROOT);
  if(!root||document.querySelector('[data-lncs-visual-addon]'))return;
  const style=document.createElement('style');
  style.dataset.lncsVisualAddon='1';
  style.textContent=`
    ${ROOT} .lncs-visual{border:1px solid #587792;border-radius:12px;background:#112943;margin:10px 0 4px;overflow:hidden}
    ${ROOT} .lncs-visual-hint{padding:6px 9px;background:#1b3b55;color:#c8e0f0;font-size:11px}
    ${ROOT} .lncs-visual-scroll{overflow-x:auto;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}
    ${ROOT} .lncs-visual svg{display:block;width:100%;min-width:690px;height:auto}
    ${ROOT} .lncs-visual-caption{padding:6px 9px;color:#bfd4e9;font-size:11px;line-height:1.6}
  `;
  root.append(style);
  const NS='http://www.w3.org/2000/svg';
  const el=(tag,attrs={},value)=>{
    const item=document.createElementNS(NS,tag);
    for(const [key,val] of Object.entries(attrs))item.setAttribute(key,String(val));
    if(value!==undefined)item.textContent=value;
    return item;
  };
  function info(row){
    const heading=row.querySelector(':scope > b')?.textContent||'';
    const detail=row.querySelector(':scope > div')?.textContent||'';
    const a=heading.match(/(\d+)회\s+(\d+)번\s+성공\s*→\s*(\d+)회\s+(\d+)번\s+대상/);
    const b=detail.match(/간격\s*\+(\d+)회\s*·\s*번호 이동\s*([+-]?\d+)\s*·\s*(\d+)→/);
    if(!a||!b)return null;
    const [round,num,target,next,gap,shift,count]=[
      Number(a[1]),Number(a[2]),Number(a[3]),Number(a[4]),Number(b[1]),Number(b[2]),Number(b[3])
    ];
    if(gap<1||count<3||target!==round+gap||next!==num+shift)return null;
    return {round,num,target,next,gap,shift,count};
  }
  function makeVisual(p,status){
    const wrap=document.createElement('div');wrap.className='lncs-visual';
    const hint=document.createElement('div');hint.className='lncs-visual-hint';
    hint.textContent='📱 그림은 좌우로 밀어서 보세요 · 선마다 회차 간격 표시';wrap.append(hint);
    const scroll=document.createElement('div');scroll.className='lncs-visual-scroll';
    const shown=Math.min(p.count,4),pts=[];
    for(let i=shown-1;i>=0;i--)pts.push({r:p.round-i*p.gap,n:p.num-i*p.shift});
    pts.push({r:p.target,n:p.next,future:true});
    const svg=el('svg',{viewBox:'0 0 760 312',role:'img','aria-label':`${p.round}회 ${p.num}번 성공 뒤 ${p.target}회 ${p.next}번 연결 검증, 회차 간격 ${p.gap}, 번호 이동 ${p.shift}`});
    svg.append(el('rect',{width:760,height:312,fill:'#112943'}));
    svg.append(el('text',{x:22,y:30,fill:'#ffebc1','font-size':19,'font-weight':850},`실제 ${p.count}점 연결 · 다음 ${p.count+1}점 확인`));
    svg.append(el('rect',{x:22,y:43,width:414,height:32,rx:8,fill:'#634b24',stroke:'#f0ca79','stroke-width':1.4}));
    svg.append(el('text',{x:38,y:65,fill:'#fff5d4','font-size':17,'font-weight':900},`회차마다 +${p.gap}회  ·  번호 이동 ${p.shift>=0?'+':''}${p.shift}`));
    for(const n of [1,15,30,45]){
      const y=251-(n-1)*3.06;
      svg.append(el('line',{x1:47,y1:y,x2:733,y2:y,stroke:'#395470','stroke-dasharray':'4 6'}));
      svg.append(el('text',{x:14,y:y+5,fill:'#9eb6cc','font-size':12},n));
    }
    const xy=pts.map((v,i)=>({x:85+i*590/(pts.length-1),y:251-(v.n-1)*3.06}));
    for(let i=1;i<xy.length;i++){
      const before=xy[i-1],after=xy[i],final=i===xy.length-1;
      svg.append(el('line',{x1:before.x,y1:before.y,x2:after.x,y2:after.y,stroke:final?'#ffd276':'#4ad3a5','stroke-width':4,'stroke-linecap':'round','stroke-dasharray':final?'9 7':'none'}));
      const mid=(before.x+after.x)/2,y=Math.max(113,Math.min(225,(before.y+after.y)/2-29));
      svg.append(el('rect',{x:mid-37,y:y-18,width:74,height:28,rx:8,fill:'#0a2036',stroke:final?'#f5c775':'#8ce9c6','stroke-width':1.5}));
      svg.append(el('text',{x:mid,y,'text-anchor':'middle',fill:final?'#ffe3aa':'#d9ffef','font-size':15,'font-weight':850},`+${p.gap}회`));
    }
    pts.forEach((v,i)=>{
      const {x,y}=xy[i];
      const final=!!v.future;
      const border=final?(status==='성공'?'#b3f4bf':status==='중단'?'#ff969e':'#ffda79'):'#b6ffe8';
      svg.append(el('circle',{cx:x,cy:y,r:13,fill:final?'#112943':'#43cc9e',stroke:border,'stroke-width':final?4:2}));
      svg.append(el('text',{x,y:y-20,'text-anchor':'middle',fill:final?'#ffe5ad':'#f4fff8','font-size':17,'font-weight':900},`${v.n}번${final&&status==='대기'?'?':''}`));
      svg.append(el('rect',{x:x-43,y:271,width:86,height:32,rx:9,fill:final?'#ffe0a2':'#ecf6ff',stroke:final?'#e6b856':'#a2cbe9','stroke-width':1.5}));
      svg.append(el('text',{x,y:294,'text-anchor':'middle',fill:'#0b2743','font-size':17,'font-weight':900},`${v.r}회`));
    });
    scroll.append(svg);wrap.append(scroll);
    const caption=document.createElement('div');caption.className='lncs-visual-caption';
    caption.textContent=`${p.count>shown?'최근 '+shown+'점 표시 / 전체 '+p.count+'점 · ':''}초록 원은 실제 당첨 · 노란 점선은 다음 연결 검증 · ${p.target}회 ${p.next}번 ${status==='대기'?'결과 대기':status==='성공'?'실제 연결 성공':'연결 중단'} · 당첨 보장은 아닙니다.`;
    wrap.append(caption);return wrap;
  }
  function enhance(){
    for(const row of root.querySelectorAll('.lncs-source-entry:not([data-lncs-visualized])')){
      const p=info(row);if(!p)continue;
      row.dataset.lncsVisualized='1';
      const outcome=row.querySelector('.lncs-pass,.lncs-fail,.lncs-pending');
      const status=outcome?.classList.contains('lncs-pass')?'성공':outcome?.classList.contains('lncs-fail')?'중단':'대기';
      row.append(makeVisual(p,status));
    }
  }
  new MutationObserver(enhance).observe(root,{childList:true,subtree:true});
  enhance();
})();
