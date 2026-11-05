const C="chores-v1";
const FILES=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>{
    const net=fetch(e.request).then(r=>{
      if(r&&r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp))}
      return r;
    }).catch(()=>hit||caches.match("./index.html"));
    return hit||net;
  }));
});
