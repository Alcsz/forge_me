const V='forge-v5';const PRE=["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "icons/badge-96.png", "img/auto-1-s.jpg", "img/auto-1.jpg", "img/auto-2-s.jpg", "img/auto-2.jpg", "img/auto-3-s.jpg", "img/auto-3.jpg", "img/auto-4-s.jpg", "img/auto-4.jpg", "img/auto-5-s.jpg", "img/auto-5.jpg", "img/auto-6-s.jpg", "img/auto-6.jpg", "img/auto-7-s.jpg", "img/auto-7.jpg", "img/auto-8-s.jpg", "img/auto-8.jpg", "img/auto-hero-s.jpg", "img/auto-hero.jpg", "img/moteur-1-s.jpg", "img/moteur-1.jpg", "img/moteur-2-s.jpg", "img/moteur-2.jpg", "img/moteur-3-s.jpg", "img/moteur-3.jpg", "img/moteur-4-s.jpg", "img/moteur-4.jpg", "img/moteur-5-s.jpg", "img/moteur-5.jpg", "img/moteur-6-s.jpg", "img/moteur-6.jpg", "img/moteur-7-s.jpg", "img/moteur-7.jpg", "img/moteur-hero-s.jpg", "img/moteur-hero.jpg", "img/voile-1-s.jpg", "img/voile-1.jpg", "img/voile-2-s.jpg", "img/voile-2.jpg", "img/voile-3-s.jpg", "img/voile-3.jpg", "img/voile-4-s.jpg", "img/voile-4.jpg", "img/voile-5-s.jpg", "img/voile-5.jpg", "img/voile-6-s.jpg", "img/voile-6.jpg", "img/voile-7-s.jpg", "img/voile-7.jpg", "img/voile-hero-s.jpg", "img/voile-hero.jpg"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(PRE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==V+'-fonts'&&k!=='forge-state').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.origin===location.origin){ if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{caches.open(V).then(c=>c.put('index.html',res.clone()));return res}).catch(()=>caches.match('index.html')));return}
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res})));return}
 if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){e.respondWith(caches.open(V+'-fonts').then(c=>c.match(r).then(m=>{const f=fetch(r).then(res=>{c.put(r,res.clone());return res}).catch(()=>m);return m||f})))}});

/* rappel du matin */
const ST='forge-state';
async function state(){try{const r=await(await caches.open(ST)).match('state');return r?await r.json():{}}catch(e){return{}}}
async function mark(k,v){const s=await state();s[k]=v;await(await caches.open(ST)).put('state',new Response(JSON.stringify(s),{headers:{'content-type':'application/json'}}))}
const parisDay=()=>new Intl.DateTimeFormat('fr-CA',{timeZone:'Europe/Paris'}).format(new Date());
const parisHour=()=>+new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Paris',hour:'2-digit',hourCycle:'h23'}).format(new Date());
async function remind(force){const s=await state(),d=parisDay();if(!force&&(s.notified===d||s.readDay===d))return;
 await self.registration.showNotification(s.title||'Ton chapitre du jour',{body:s.body||'Un chapitre de Forge, une quinzaine de minutes.',icon:'icons/icon-192.png',badge:'icons/badge-96.png',tag:'forge-daily',renotify:true,data:{url:s.url||'./'}});
 await mark('notified',d)}
self.addEventListener('push',e=>e.waitUntil(remind(true)));
self.addEventListener('periodicsync',e=>{if(e.tag==='forge-daily')e.waitUntil(parisHour()>=8?remind(false):Promise.resolve())});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus' in c){c.navigate(url).catch(()=>{});return c.focus()}}return clients.openWindow(url)}))});
