const C="chores-v7";
const FILES=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"})))).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
function fromCache(req){
  return caches.match(req,{ignoreSearch:true}).then(h=>h||caches.match("./index.html"));
}
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  // Update checks from the page go straight to the network.
  if(u.searchParams.has("fresh"))return;

  // Opening the app: network first (skipping the browser cache), saved copy if offline or slow.
  if(e.request.mode==="navigate"){
    const net=fetch(e.request.url,{cache:"no-store"}).then(r=>{
      if(!r||!r.ok)throw new Error("bad response");
      const cp=r.clone();
      caches.open(C).then(c=>c.put(e.request,cp));
      // A redirected response can't answer a navigation; rebuild it.
      return r.redirected?new Response(r.body,{status:r.status,statusText:r.statusText,headers:r.headers}):r;
    });
    const slow=new Promise(res=>setTimeout(res,3000)).then(()=>fromCache(e.request)).then(h=>h||net);
    e.respondWith(Promise.race([net,slow]).catch(()=>fromCache(e.request).then(h=>h||Response.error())));
    e.waitUntil(net.catch(()=>{}));
    return;
  }

  // Everything else (icons, manifest): saved copy now, refresh in the background.
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>{
    const net=fetch(e.request).then(r=>{
      if(r&&r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp))}
      return r;
    }).catch(()=>hit||caches.match("./index.html"));
    return hit||net;
  }));
});
