// Plant Tracker PWA Service Worker
// Version 1.0.0 - Optimized for performance

const CACHE_NAME = 'plant-tracker-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';
const IMAGE_CACHE = 'images-v1.0.0';

// Critical assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/list',
  '/add-plant',
  '/settings',
  '/_next/static/css/app.css',
  '/manifest.json',
  '/assets/tamagotchi.png',
  '/assets/happy.png',
  '/assets/thirsty.png',
  '/assets/mad.png',
  '/favicon.svg',
  '/apple-touch-icon.png'
];

// Assets to cache on first request
const RUNTIME_CACHE = [
  '/_next/static/js/',
  '/_next/static/chunks/',
  '/api/',
  'https://fonts.googleapis.com/',
  'https://fonts.gstatic.com/'
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  console.log('SW: Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('SW: Precaching critical assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('SW: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('SW: Installation failed:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        const deletePromises = cacheNames
          .filter((cacheName) => {
            return cacheName !== STATIC_CACHE && 
                   cacheName !== DYNAMIC_CACHE && 
                   cacheName !== IMAGE_CACHE;
          })
          .map((cacheName) => {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          });
        
        return Promise.all(deletePromises);
      })
      .then(() => {
        console.log('SW: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;
  
  // Only handle GET requests
  if (method !== 'GET') return;
  
  // Skip non-HTTP(S) requests
  if (!url.startsWith('http')) return;
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Static assets (CSS, JS, fonts) - Cache First
    if (isStaticAsset(url)) {
      return cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 2: Images - Cache with fallback
    if (isImage(url)) {
      return cacheFirst(request, IMAGE_CACHE);
    }
    
    // Strategy 3: API calls - Network First with 2s timeout
    if (isAPI(url)) {
      return networkFirst(request, DYNAMIC_CACHE, 2000);
    }
    
    // Strategy 4: Pages - Stale While Revalidate
    if (isPage(url)) {
      return staleWhileRevalidate(request, DYNAMIC_CACHE);
    }
    
    // Strategy 5: External resources - Network First
    if (isExternal(url)) {
      return networkFirst(request, DYNAMIC_CACHE, 5000);
    }
    
    // Default: Network with cache fallback
    return networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('SW: Request failed:', error);
    return caches.match('/offline.html') || new Response('Offline');
  }
}

// Cache strategies
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  const cache = await caches.open(cacheName);
  const response = await fetch(request);
  
  if (response.status === 200) {
    cache.put(request, response.clone());
  }
  
  return response;
}

async function networkFirst(request, cacheName, timeout = 3000) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
    
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('SW: Network failed, trying cache:', error.message);
    const cached = await cache.match(request);
    return cached || new Response('Network unavailable', { status: 408 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  return cached || fetchPromise;
}

// URL pattern helpers
function isStaticAsset(url) {
  return url.pathname.includes('/_next/static/') ||
         url.pathname.includes('/assets/') ||
         url.pathname.match(/\.(css|js|woff|woff2|eot|ttf|otf)$/);
}

function isImage(url) {
  return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/);
}

function isAPI(url) {
  return url.pathname.startsWith('/api/') ||
         url.hostname.includes('supabase.co');
}

function isPage(url) {
  return url.origin === self.location.origin &&
         !url.pathname.includes('.') &&
         !url.pathname.startsWith('/api/');
}

function isExternal(url) {
  return url.origin !== self.location.origin;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('SW: Background sync triggered');
  // Implement offline plant data sync here
}

// Push notifications (future feature)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const options = {
    body: event.data.text(),
    icon: '/apple-touch-icon.png',
    badge: '/favicon.svg',
    tag: 'plant-notification'
  };
  
  event.waitUntil(
    self.registration.showNotification('Plant Tracker', options)
  );
});

console.log('SW: Service Worker loaded successfully'); 