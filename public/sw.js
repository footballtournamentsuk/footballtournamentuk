// Service Worker for caching and performance optimization

const CACHE_NAME = 'footballtournaments-v2';
const STATIC_CACHE = 'static-v2';
const IMAGE_CACHE = 'images-v2';
const API_CACHE = 'api-v2';

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  // Add critical CSS and JS files
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first, then network (for static assets)
  CACHE_FIRST: 'cache-first',
  // Network first, then cache (for API calls)
  NETWORK_FIRST: 'network-first',
  // Stale while revalidate (for images)
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== IMAGE_CACHE && 
              cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip service worker for auth requests - they must go through directly
  if (url.hostname.includes('supabase') && (
    url.pathname.includes('/auth/') || 
    request.method === 'POST' ||
    url.pathname.includes('/signup') ||
    url.pathname.includes('/signin')
  )) {
    // Let auth requests pass through without interference
    return;
  }

  // Handle different types of requests
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (url.pathname.startsWith('/api')) {
    event.respondWith(handleAPIRequest(request));
  } else if (request.destination === 'document') {
    event.respondWith(handlePageRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

// Cache strategies implementation
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Return cached version and fetch new one in background
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    });
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return placeholder image on failure
    return new Response('', { status: 404 });
  }
}

async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Cache successful API responses for 5 minutes
      const responseClone = response.clone();
      setTimeout(() => cache.put(request, responseClone), 0);
    }
    return response;
  } catch (error) {
    // Return cached version if network fails
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function handlePageRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline page or app shell
    return cache.match('/');
  }
}

async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    throw error;
  }
}

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline form submissions, etc.
  console.log('Background sync executed');
}

// Push notifications (if needed)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/favicon-192x192.png',
      badge: '/favicon-192x192.png'
    };

    event.waitUntil(
      self.registration.showNotification('Football Tournaments UK', options)
    );
  }
});