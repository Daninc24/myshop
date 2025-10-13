// Service Worker for caching and performance optimization
const CACHE_NAME = 'myshop-v1.0.0';
const STATIC_CACHE = 'myshop-static-v1.0.0';
const DYNAMIC_CACHE = 'myshop-dynamic-v1.0.0';

// Assets to cache immediately - only cache assets that actually exist
const STATIC_ASSETS = [
  '/',
  '/offline.html'
  // Only cache assets that exist - manifest.json may not be present
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/products/,
  /\/api\/categories/,
  /\/api\/auth\/profile/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        // Cache assets individually to avoid failure if one doesn't exist
        return Promise.allSettled(
          STATIC_ASSETS.map(asset => 
            cache.add(asset).catch(err => {
              // Silently handle expected failures
              if (!err.message.includes('manifest.json') && 
                  !err.message.includes('.woff2')) {
                console.warn(`Failed to cache ${asset}:`, err.message);
              }
              return null;
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE
            )
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (request.destination === 'document') {
    event.respondWith(handlePageRequest(request));
    return;
  }

  // Handle other resources (images, fonts, etc.)
  event.respondWith(handleResourceRequest(request));
});

// Handle API requests with cache-first strategy for GET requests
async function handleApiRequest(request) {
  const shouldCache = API_CACHE_PATTERNS.some(pattern => 
    pattern.test(request.url)
  );

  if (request.method === 'GET' && shouldCache) {
    try {
      const cache = await caches.open(DYNAMIC_CACHE);
      const cachedResponse = await cache.match(request);
      
      // Try network first, fallback to cache
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } else if (cachedResponse) {
          console.log('API request failed, using cache:', request.url);
          return cachedResponse;
        }
        return networkResponse;
      } catch (networkError) {
        console.log('API request failed, trying cache:', networkError);
        if (cachedResponse) {
          return cachedResponse;
        }
        throw networkError;
      }
    } catch (error) {
      console.error('API request failed:', error);
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable', cached: false }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // For non-GET requests, always go to network
  return fetch(request);
}

// Handle page requests with network-first strategy
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return caches.match('/offline.html');
  }
}

// Handle resource requests with cache-first strategy
async function handleResourceRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Only cache successful responses and avoid caching certain types
      const contentType = networkResponse.headers.get('content-type');
      const url = new URL(request.url);
      
      // Skip caching for certain file types that might cause issues
      if (!url.pathname.includes('.woff2') && 
          !url.pathname.includes('manifest.json') &&
          contentType && 
          !contentType.includes('application/octet-stream')) {
        try {
          await cache.put(request, networkResponse.clone());
        } catch (cacheError) {
          console.warn('Failed to cache resource:', request.url, cacheError.message);
          // Continue without caching
        }
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Resource request failed:', error.message);
    return new Response('', { status: 404 });
  }
}

// Background fetch and cache update
async function fetchAndCache(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    console.error('Background fetch failed:', error);
  }
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  // Handle offline actions when connection is restored
  console.log('Background sync triggered');
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon.svg',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'View',
          icon: '/icons/icon.svg'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icons/icon.svg'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});