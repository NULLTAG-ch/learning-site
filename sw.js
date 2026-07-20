// NULLTAG Learn – Service Worker: App-Shell vorab, Assets zur Laufzeit.
// Version bei jedem Release hochzaehlen, sonst bleibt der alte Cache aktiv.
const CACHE = 'nulltag-learn-v3';
const SHELL = ['./', 'index.html', 'manifest.json',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // App-Shell (Navigation): Netz zuerst, damit Updates ankommen; offline aus dem Cache
  if (e.request.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    e.respondWith(fetch(e.request)
      .then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('index.html', cp)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  // Assets (Samples, Cover, Videos): Cache zuerst, einmal geladen = offline verfuegbar
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok && !url.pathname.includes('/assets/demo/')) {
      const cp = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, cp));
    }
    return r;
  })));
});
