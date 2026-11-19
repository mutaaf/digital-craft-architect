/* DigitalCraft AI: the installable app's service worker (v3, after mutaafaziz.com's /sw.js).
 *
 * - Pages: network first, so online is always fresh; the last good copy (or the app shell, or
 *   /offline.html) when the network is gone.
 * - Hashed build assets (/assets/*), icons and vendored libraries: cache first (their names change
 *   when their content does).
 * - Never: /api/* (the demos talk to live AI), cross-origin requests, non-GET requests, Vercel's own
 *   paths (/_vercel, /.well-known), or any response marked no-store / private.
 * Bump VERSION when this file's caching logic changes; installed visitors then see "A new version
 * is ready". To retire the worker, ship a version whose install handler unregisters itself.
 */
var VERSION = 'dc-v3-1';
var SHELL = 'dc-shell-' + VERSION;
var PAGES = 'dc-pages-' + VERSION;
var STATIC = 'dc-static-' + VERSION;
var PRECACHE = ['/', '/offline.html', '/app.webmanifest', '/icons/icon-192.png', '/icons/icon.svg'];
var MAX_PAGES = 40;

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(SHELL).then(function (c) { return c.addAll(PRECACHE); }).then(function () {
      // first install takes over at once; an update waits for the page's "Refresh"
      return self.registration.active ? null : self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k.indexOf('dc-') === 0 && k !== SHELL && k !== PAGES && k !== STATIC;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function cacheable(res) {
  if (!res || res.status !== 200 || res.type !== 'basic') return false;
  var cc = (res.headers.get('Cache-Control') || '').toLowerCase();
  return cc.indexOf('no-store') === -1 && cc.indexOf('private') === -1;
}

function trim(name, max) {
  caches.open(name).then(function (c) {
    c.keys().then(function (keys) {
      if (keys.length > max) c.delete(keys[0]).then(function () { trim(name, max); });
    });
  });
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  var p = url.pathname;
  if (p.indexOf('/api/') === 0 || p.indexOf('/_vercel') === 0 || p.indexOf('/.well-known') === 0 || p === '/sw.js') return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(function (res) {
        if (cacheable(res)) {
          var copy = res.clone();
          caches.open(PAGES).then(function (c) { c.put(req, copy); trim(PAGES, MAX_PAGES); });
        }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match('/').then(function (shell) {
            return shell || caches.match('/offline.html');
          });
        });
      })
    );
    return;
  }

  if (p.indexOf('/assets/') === 0 || p.indexOf('/icons/') === 0 || p.indexOf('/vendor/') === 0) {
    event.respondWith(
      caches.match(req).then(function (hit) {
        return hit || fetch(req).then(function (res) {
          if (cacheable(res)) { var copy = res.clone(); caches.open(STATIC).then(function (c) { c.put(req, copy); }); }
          return res;
        });
      })
    );
  }
});
