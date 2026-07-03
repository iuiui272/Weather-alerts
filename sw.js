const CACHE_NAME = 'weather-pristine-v2';
const ASSETS = [
  '/',
  '/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => {
        if(event.request.url.includes('api.weather.gc.ca')) {
          return new Response(JSON.stringify({ offline: true }), { headers: { 'Content-Type': 'application/json' }});
        }
      });
    })
  );
});

self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Emergency Alert', body: 'Weather update available.' };
  
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    data: { url: '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
