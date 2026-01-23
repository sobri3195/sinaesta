const STATIC_CACHE = 'sinaesta-static-v1';
const RUNTIME_CACHE = 'sinaesta-runtime-v1';
const QUEUE_DB = 'sinaesta-sync-queue';
const QUEUE_STORE = 'requests';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

const openQueue = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(QUEUE_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const queueRequest = async (request) => {
  const db = await openQueue();
  const tx = db.transaction(QUEUE_STORE, 'readwrite');
  const store = tx.objectStore(QUEUE_STORE);
  const body = await request.clone().text();
  store.add({
    url: request.url,
    method: request.method,
    headers: Array.from(request.headers.entries()),
    body,
    timestamp: Date.now()
  });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
};

const replayQueue = async () => {
  const db = await openQueue();
  const tx = db.transaction(QUEUE_STORE, 'readwrite');
  const store = tx.objectStore(QUEUE_STORE);
  const all = store.getAll();

  return new Promise((resolve) => {
    all.onsuccess = async () => {
      const entries = all.result;
      for (const entry of entries) {
        try {
          await fetch(entry.url, {
            method: entry.method,
            headers: entry.headers,
            body: entry.body
          });
          store.delete(entry.id);
        } catch (error) {
          console.error('Replay failed', error);
        }
      }
      resolve();
    };
  });
};

self.addEventListener('sync', (event) => {
  if (event.tag === 'sinaesta-sync') {
    event.waitUntil(replayQueue());
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    event.respondWith(
      fetch(request).catch(async () => {
        await queueRequest(request);
        if (self.registration.sync) {
          await self.registration.sync.register('sinaesta-sync');
        }
        return new Response(
          JSON.stringify({ queued: true }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 202
          }
        );
      })
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(RUNTIME_CACHE);
          return (await cache.match(request)) || (await caches.match('/offline.html'));
        })
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
      )
    );
    return;
  }

  event.respondWith(fetch(request));
});
