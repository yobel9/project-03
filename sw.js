// Service Worker for GerejaKu Admin PWA
const CACHE_NAME = 'gerejaku-v10';
const BASE_PATH = '/project-02';

const urlsToCache = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/manifest.json',
  BASE_PATH + '/css/styles.min.css',
  BASE_PATH + '/js/app.min.js',
  BASE_PATH + '/js/data.min.js',
  BASE_PATH + '/js/auth-simple.min.js',
  BASE_PATH + '/js/components.min.js',
  BASE_PATH + '/js/storage.min.js',
  BASE_PATH + '/assets/images/icon-192.png',
  BASE_PATH + '/assets/images/icon-512.png',
  BASE_PATH + '/js/pages/dashboard.js',
  BASE_PATH + '/js/pages/members.js',
  BASE_PATH + '/js/pages/attendance.js',
  BASE_PATH + '/js/pages/finance.js',
  BASE_PATH + '/js/pages/inventory.js',
  BASE_PATH + '/js/pages/users.js',
  BASE_PATH + '/js/pages/settings.js',
  BASE_PATH + '/js/pages/worship-schedule.js',
  BASE_PATH + '/js/pages/events.js',
  BASE_PATH + '/js/pages/church-announcements.js',
  BASE_PATH + '/js/pages/commissions.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch((err) => {
          console.log('Cache addAll error:', err);
        });
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
