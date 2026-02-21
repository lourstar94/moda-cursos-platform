// lib/register-sw.js
export function registerCustomSW() {
  if ('serviceWorker' in navigator) {
    // Esperar a que el SW principal esté listo
    navigator.serviceWorker.ready.then((registration) => {
      console.log('[SW Custom] Service Worker ready');
      
      // Enviar mensaje al SW para cargar nuestras extensiones
      registration.active?.postMessage({
        type: 'LOAD_CUSTOM_SCRIPT',
        url: '/lib/sw-custom.js'
      });
    });
  }
}