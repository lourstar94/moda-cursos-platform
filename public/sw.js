// public/sw.js - Service Worker MEJORADO
const CACHE_NAME = 'moda-cursos-offline-v2';
const OFFLINE_URL = '/offline';

// Instalación - Cachear página offline INMEDIATAMENTE
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching offline page immediately');
        // Cachear la página offline PRIMERO
        return cache.add(OFFLINE_URL);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(self.clients.claim());
});

// Estrategia OFFLINE-FIRST para navegación
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Primero intentar la red
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          console.log('[SW] Network failed, showing offline page');
          
          // MOSTRAR PÁGINA OFFLINE DIRECTAMENTE
          const offlineResponse = await caches.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }
          
          // Fallback extremo
          return new Response(
            '<h1>ModaCursos - Sin conexión</h1><p>La app está en modo offline</p>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
      })()
    );
  }
});