// RBAB Room Guide — service worker
// Precaches the app shell; caches room photos/thumbnails at runtime as they're
// viewed, so anything already opened once works offline afterward.

const CACHE_VERSION = "v1";
const SHELL_CACHE = `rbab-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `rbab-runtime-${CACHE_VERSION}`;

const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./style.css",
  "./data.js",
  "./manifest.json",
  "./assets/rixos-logo.png",
  "./assets/favicon-32.png",
  "./assets/favicon-16.png",
  "./assets/apple-touch-icon.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-192.png",
  "./assets/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  // Room photos and thumbnails: cache-first, and cache whatever gets fetched
  // for next time (so a room viewed once is available offline afterward).
  if (url.pathname.includes("/images/") || url.pathname.includes("/thumbs/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // App shell (HTML/CSS/JS/data): network-first so updates are picked up
  // quickly when online, falling back to cache when offline.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
