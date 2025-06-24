// Plant Tracker Service Worker - Optimized for Performance
// Version: 2.0.0

const CACHE_NAME = 'plant-tracker-v2.0.0';
const RUNTIME_CACHE = 'plant-tracker-runtime-v2.0.0';

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/apple-touch-icon.png',
  '/favicon.svg',
  '/favicon.ico',
  // Static pages
  '/list',
  '/add-plant',
  '/settings',
  '/notes',
  // Essential CSS and JS will be cached automatically by Next.js
];

// Routes and their cache strategies
const CACHE_ROUTES = [
  {
    pattern: /^https:\/\/fonts\.googleapis\.com/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cacheName: 'google-fonts-stylesheets',
  },
  {
    pattern: /^https:\/\/fonts\.gstatic\.com/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: 'google-fonts-webfonts',
    expiration: {
      maxEntries: 30,
      maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
    },
  },
  {
    pattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: 'images',
    expiration: {
      maxEntries: 60,
      maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
    },
  },
  {
    pattern: /\/_next\/static\/.*/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: 'next-static',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
    },
  },
  {
    pattern: /\/api\/.*/,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: 'api-calls',
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 5 * 60, // 5 minutes
    },
  },
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('SW: Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Force activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        // Take control of all pages
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other protocols
  if (!event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);

  // Handle navigation requests (pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      handleNavigationRequest(event.request)
    );
    return;
  }

  // Find matching cache strategy
  const matchedRoute = CACHE_ROUTES.find(route => 
    route.pattern.test(event.request.url)
  );

  if (matchedRoute) {
    event.respondWith(
      handleRequest(event.request, matchedRoute)
    );
  }
});

// Handle navigation requests with network-first strategy
async function handleNavigationRequest(request) {
  try {
    // Try network first for pages
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Fallback to cache
    console.log('SW: Network failed, trying cache:', request.url);
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Ultimate fallback - return offline page or basic response
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Plant Tracker</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
                   text-align: center; padding: 2rem; background: #f9fafb; }
            .container { max-width: 400px; margin: 0 auto; }
            .icon { font-size: 4rem; margin-bottom: 1rem; }
            h1 { color: #1f2937; margin-bottom: 0.5rem; }
            p { color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🌱</div>
            <h1>You're Offline</h1>
            <p>Please check your connection and try again.</p>
            <button onclick="window.location.reload()" 
                    style="background: #10b981; color: white; border: none; 
                           padding: 0.75rem 1.5rem; border-radius: 0.5rem; 
                           font-size: 1rem; cursor: pointer; margin-top: 1rem;">
              Try Again
            </button>
          </div>
        </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Handle requests based on cache strategy
async function handleRequest(request, route) {
  const cache = await caches.open(route.cacheName || RUNTIME_CACHE);

  switch (route.strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cache, route);
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cache, route);
    
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cache, route);
    
    default:
      return fetch(request);
  }
}

// Cache-first strategy
async function cacheFirst(request, cache, route) {
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      cache.put(request, response.clone());
      await cleanupCache(cache, route.expiration);
    }
    
    return response;
  } catch (error) {
    console.log('SW: Cache-first fetch failed:', request.url);
    throw error;
  }
}

// Network-first strategy
async function networkFirst(request, cache, route) {
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      cache.put(request, response.clone());
      await cleanupCache(cache, route.expiration);
    }
    
    return response;
  } catch (error) {
    console.log('SW: Network-first fetch failed, trying cache:', request.url);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cache, route) {
  const cachedResponse = await cache.match(request);
  
  // Always fetch in background
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.status === 200) {
        cache.put(request, response.clone());
        cleanupCache(cache, route.expiration);
      }
      return response;
    })
    .catch(error => {
      console.log('SW: Background fetch failed:', request.url);
    });
  
  // Return cached response immediately, or wait for network
  return cachedResponse || fetchPromise;
}

// Clean up cache based on expiration rules
async function cleanupCache(cache, expiration) {
  if (!expiration) return;
  
  const keys = await cache.keys();
  
  if (expiration.maxEntries && keys.length > expiration.maxEntries) {
    // Remove oldest entries
    const entriesToDelete = keys.length - expiration.maxEntries;
    for (let i = 0; i < entriesToDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
  
  if (expiration.maxAgeSeconds) {
    const now = Date.now();
    const maxAge = expiration.maxAgeSeconds * 1000;
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const responseDate = new Date(response.headers.get('date')).getTime();
        if (now - responseDate > maxAge) {
          await cache.delete(request);
        }
      }
    }
  }
}

// Background sync for plant data when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'plant-sync') {
    event.waitUntil(
      // Notify main thread that sync is needed
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'BACKGROUND_SYNC' });
        });
      })
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('SW: Service Worker loaded successfully'); 