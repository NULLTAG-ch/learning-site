// NULLTAG Learn – Service Worker: App-Shell vorab, Assets zur Laufzeit.
// Version bei jedem Release hochzaehlen, sonst bleibt der alte Cache aktiv.
const CACHE = 'nulltag-learn-v13';
// Das Design-System liegt seit v4 in eigenen Dateien statt inline im HTML —
// sie gehoeren darum in die Shell, sonst startet die App offline ohne Stil.
// Die Query-Strings muessen exakt denen im HTML entsprechen: caches.match
// vergleicht die volle URL, und genau das macht den Versions-Bump wirksam.
const SHELL = ['./', 'index.html', 'manifest.json',
  'tokens.css?v=1', 'web.css?v=4', 'web.js?v=1', 'fonts/fonts.css',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/icon-maskable-512.png'];

// GitHub Pages liefert alles mit max-age=600. Ohne Gegenmassnahme zeigt der
// Browser nach einem Deploy bis zu zehn Minuten die alte Shell aus seinem
// HTTP-Cache - die Pages-Pipeline selbst braucht nur rund 30 Sekunden.
// Darum: Shell beim Installieren frisch holen (cache: 'reload') und die
// Navigation immer beim Server rueckfragen (cache: 'no-cache' -> ETag/304,
// ein kleiner Roundtrip; offline greift weiter der Cache).
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
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
    // fetch(e.request, init) ist bei mode 'navigate' nicht erlaubt - darum ueber die URL
    e.respondWith(fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' })
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
