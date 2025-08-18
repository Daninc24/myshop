const CACHE_NAME = 'myshop-v1.0.1';
const STATIC_CACHE = 'static-v1.0.1';
const DYNAMIC_CACHE = 'dynamic-v1.0.1';
const API_CACHE = 'api-v1.0.1';

// Files to cache immediately - only essential files that exist
const STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.ico'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/products',
  '/api/categories',
  '/api/events'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        // Cache files individually to handle failures gracefully
        return Promise.allSettled(
          STATIC_FILES.map(url => 
            cache.add(url).catch(error => {
              console.warn(`Failed to cache ${url}:`, error);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error during installation', error);
        // Continue installation even if caching fails
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('Service Worker: Error during activation', error);
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external resources that might cause issues
  if (url.hostname !== location.hostname && 
      !url.hostname.includes('cloudinary.com') &&
      !url.hostname.includes('googleapis.com')) {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network first with cache fallback
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.startsWith('/images/') || 
             url.pathname.startsWith('/static/') ||
             url.hostname.includes('cloudinary.com')) {
    // Static assets and images - Cache first with network fallback
    event.respondWith(handleStaticRequest(request));
  } else {
    // HTML pages - Network first with cache fallback
    event.respondWith(handlePageRequest(request));
  }
});

// Handle API requests
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      try {
        const cache = await caches.open(API_CACHE);
        cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn('Failed to cache API response:', cacheError);
      }
      return networkResponse;
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`);
  } catch (error) {
    console.log('API request failed, trying cache:', error.message);
    
    // Fallback to cache
    try {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    } catch (cacheError) {
      console.warn('Cache lookup failed:', cacheError);
    }
    
    // Return offline response for API requests
    return new Response(
      JSON.stringify({ 
        error: 'You are offline. Please check your connection.',
        offline: true,
        message: 'Service temporarily unavailable'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Return cached version immediately
      return cachedResponse;
    }
  } catch (cacheError) {
    console.warn('Cache lookup failed:', cacheError);
  }
  
  try {
    // Try network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache for future use
      try {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn('Failed to cache static asset:', cacheError);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Static asset request failed:', error.message);
    
    // Return placeholder for images
    if (request.url.includes('/images/') || request.url.includes('cloudinary.com')) {
      try {
        return await caches.match('/images/placeholder-image.svg') || 
               new Response('', { status: 404 });
      } catch (placeholderError) {
        return new Response('', { status: 404 });
      }
    }
    
    throw error;
  }
}

// Handle page requests
async function handlePageRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      try {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn('Failed to cache page:', cacheError);
      }
      return networkResponse;
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`);
  } catch (error) {
    // Only log network errors, not cache fallbacks
    if (error.message.includes('Network response not ok')) {
      console.debug('Network request failed, using cache fallback');
    }
    
    // Fallback to cache
    try {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    } catch (cacheError) {
      // Silent cache lookup failures
    }
    
    // Return offline page
    try {
      return await caches.match('/offline.html') || 
             new Response('Offline - Please check your connection', { status: 503 });
    } catch (offlineError) {
      return new Response('Offline - Please check your connection', { status: 503 });
    }
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await processPendingAction(action);
        await removePendingAction(action.id);
      } catch (error) {
        console.error('Background sync failed for action:', action, error);
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from MyShop',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('MyShop', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions for background sync
async function getPendingActions() {
  // This would typically use IndexedDB
  // For now, return empty array
  return [];
}

async function processPendingAction(action) {
  // Process pending action (e.g., sync cart, orders)
  console.log('Processing pending action:', action);
}

async function removePendingAction(actionId) {
  // Remove processed action from storage
  console.log('Removing action:', actionId);
}

// Cache size management
async function cleanOldCaches() {
  try {
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      if (cacheName.startsWith('dynamic-') || cacheName.startsWith('api-')) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        // Keep only the 50 most recent items
        if (keys.length > 50) {
          const keysToDelete = keys.slice(0, keys.length - 50);
          await Promise.allSettled(
            keysToDelete.map(key => cache.delete(key))
          );
        }
      }
    }
  } catch (error) {
    console.warn('Cache cleanup failed:', error);
  }
}

// Periodic cache cleanup
setInterval(cleanOldCaches, 24 * 60 * 60 * 1000); // Daily

console.log('Service Worker: Loaded');
