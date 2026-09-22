const CACHE_NAME = "our-days-static-v2";

function unavailableResponse() {
  return new Response(null, {
    status: 503,
    statusText: "Service Unavailable",
    headers: { "Cache-Control": "no-store" },
  });
}

function isCacheableAsset(request) {
  if (request.method !== "GET") {
    return false;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return false;
  }

  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/icon.svg" ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/apple-icon"
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (!isCacheableAsset(event.request)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response.ok) {
          return response;
        }

        const responseToCache = response.clone();
        void caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(event.request, responseToCache))
          .catch(() => {
            // Cache failure must not break the network response.
          });
        return response;
      }).catch(() => unavailableResponse());
    }),
  );
});
