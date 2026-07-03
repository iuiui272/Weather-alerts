const CACHE_NAME = 'weather-app-v3';
const ASSETS = ['/', '/index.html'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => {
        if(event.request.url.includes('api.weather.gc.ca')) {
          // Graceful offline fallback for the Canada Weather API
          return new Response(JSON.stringify({ offline: true }), { headers: { 'Content-Type': 'application/json' }});
        }
      });
    })
  );
});

// Handles incoming real push alerts while the app is closed
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Emergency Alert', body: 'New alert for your saved locations.' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      vibrate: [300, 100, 400],
      data: { url: '/' }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
