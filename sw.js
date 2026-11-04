const CACHE_NAME="lotto-note-shell-20261104-v1";
const SHELL=["./","./index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png"];
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
  event.respondWith(caches.match(req,{ignoreSearch:true}).then(cached=>cached||fetch(req).then(res=>{
    if(res.ok&&res.type==="basic"){const copy=res.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));}
    return res;
  })));
});
