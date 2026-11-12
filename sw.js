const CACHE_NAME="lotto-note-shell-20261112-v64";
const SHELL=["./","./index.html","./exclusion_lab.js","./exclusion_ui.js","./pattern_watch_explained.js","./diagonal_survival_watch.js","./pattern_survival_visual_v8.js","./pattern_survival_stage_audit_v1.js","./pattern_connection_schedule_v3.js","./pattern_connection_visual_v1.js","./pattern_connection_table_v6.js","./pattern_connection_master_v2.js","./pattern_overlap_audit_v1.js","./pattern_overlap_lines_v1.js","./pattern_walkforward_v1.js","./pattern_connection_ledger_v1.js","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>
    key.startsWith("lotto-note-shell-")&&key!==CACHE_NAME).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  if(req.mode==="navigate"){
    event.respondWith(fetch(req).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(CACHE_NAME).then(cache=>cache.put("./index.html",copy));}
      return res;
    }).catch(()=>caches.match("./index.html")));
    return;
  }
  if(url.pathname.endsWith("/sw.js"))return;
  // 주간 서버 기록은 반드시 네트워크에서 가져온다. 오래된 캐시 재사용 금지.
  if(url.pathname.endsWith("/data/connection_forecasts.json")||url.pathname.endsWith("/data/connection_reviews.json")||url.pathname.endsWith("/data/exclusion_scans.json")||url.pathname.endsWith("/data/exclusion_scorecard.json")||url.pathname.endsWith("/data/exclusion_backtest.json")||url.pathname.endsWith("/data/weekly_scans.json")||url.pathname.endsWith("/data/weekly_reviews.json")||url.pathname.endsWith("/data/pattern_scorecard.json")||url.pathname.endsWith("/data/historical_walkforward.json")||url.pathname.endsWith("/data/historical_cases.json")||url.pathname.includes("/data/recaps/")){
    event.respondWith(fetch(req,{cache:"no-store"}));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
    if(res.ok&&res.type==="basic"){const copy=res.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));}
    return res;
  })));
});
