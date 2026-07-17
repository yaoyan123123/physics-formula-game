const CACHE = "physics-day-v2";
const CORE = ["./", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("physics-day-") && key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (response.ok) { const cache = await caches.open(CACHE); await cache.put(event.request, response.clone()); }
      return response;
    } catch {
      const direct = await caches.match(event.request, { ignoreSearch: true });
      if (direct) return direct;
      const index = await caches.match("./index.html");
      if (index) return index;
      const bundle = await caches.match("./physics-scene-game.html");
      if (bundle) return bundle;
      return caches.match("./");
    }
  })());
});
