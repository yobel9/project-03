// Service Worker for GerejaKu Admin PWA
const CACHE_NAME = 'gerejaku-v7';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css?v=20260315',
  '/js/app.js?v=20260315',
  '/js/data.js?v=20260315',
  '/js/auth-simple.js?v=20260315',
  '/js/components.js?v=20260315',
  '/js/storage.js?v=20260315',
  '/js/pages/dashboard.js?v=20260315',
  '/js/pages/members.js?v=20260315',
  '/js/pages/attendance.js?v=20260315',
  '/js/pages/finance.js?v=20260315',
  '/js/pages/inventory.js?v=20260315',
  '/js/pages/users.js?v=20260315',
  '/js/pages/settings.js?v=20260315',
  '/js/pages/worship-schedule.js?v=20260315',
  '/js/pages/events.js?v=20260315',
  '/js/pages/church-announcements.js?v=20260315',
  '/js/pages/commissions.js?v=20260315',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response and cache it
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
