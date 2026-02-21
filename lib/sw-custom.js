// lib/sw-custom.js - Extensiones para el service worker existente

console.log('[SW Custom] Custom service worker extensions loaded');

// Agregar esta función al service worker existente
self.addEventListener('fetch', (event) => {
  // Solo para solicitudes de navegación (páginas HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Primero intentar cargar desde la red
          const networkResponse = await fetch(event.request);
          
          // Si la respuesta es exitosa, devolverla
          if (networkResponse && networkResponse.status === 200) {
            return networkResponse;
          }
          throw new Error('Network response not ok');
        } catch (error) {
          console.log('[SW Custom] Network failed, trying cache...');
          
          // Si falla la red, buscar en cache primero
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            console.log('[SW Custom] Serving from cache');
            return cachedResponse;
          }
          
          // Si no está en cache, mostrar página offline personalizada
          console.log('[SW Custom] Showing offline page');
          const offlineResponse = await caches.match('/offline');
          if (offlineResponse) {
            return offlineResponse;
          }
          
          // Fallback por si no existe la página offline
          return new Response(
            '<h1>Estás sin conexión</h1><p>Intenta más tarde</p>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
      })()
    );
  }
});

// Manejar mensajes personalizados
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CUSTOM_PING') {
    console.log('[SW Custom] Received ping from app');
    event.ports[0]?.postMessage({ type: 'CUSTOM_PONG' });
  }
});