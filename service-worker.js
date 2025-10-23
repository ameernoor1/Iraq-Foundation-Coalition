const CACHE_NAME = 'election-app-v2.0';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './service-worker.js'
  // أي ملفات خارجية سيتم جلبها ديناميكياً عند الطلب فقط
];

// تثبيت Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('✅ فتح الذاكرة المؤقتة');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ حذف الذاكرة المؤقتة القديمة:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// اعتراض طلبات الشبكة
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // إرجاع النسخة المخزنة أو جلب من الشبكة
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          function(response) {
            // التحقق من صحة الاستجابة
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // نسخ الاستجابة
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
      .catch(function() {
  // يمكن إرجاع شاشة ترحيب أو صفحة offline هنا
  return caches.match('./index.html');
      })
  );
});

// رسائل الدفع (Push Notifications)
self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'لديك إشعار جديد من تطبيق أساس العراق',
    icon: 'https://firebasestorage.googleapis.com/v0/b/messageemeapp.appspot.com/o/icon-192.png?alt=media&token=8d29fc43-51ea-45f3-a41a-10b8f2e0d9cf',
    badge: 'https://firebasestorage.googleapis.com/v0/b/messageemeapp.appspot.com/o/icon-512.png?alt=media&token=8d29fc43-51ea-45f3-a41a-10b8f2e0d9cf',
    vibrate: [200, 100, 200],
    tag: 'election-notification',
    requireInteraction: false
  };
  event.waitUntil(
    self.registration.showNotification('🗳️ أساس العراق', options)
  );
});