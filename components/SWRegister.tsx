'use client';

import { useEffect } from 'react';

export default function SWRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      // Registrar extensiones personalizadas del SW
      navigator.serviceWorker.ready.then((registration) => {
        console.log('[SW Custom] Service Worker ready');
        
        // Opcional: Enviar mensaje para cargar extensiones personalizadas
        registration.active?.postMessage({
          type: 'LOAD_CUSTOM_SCRIPT', 
          url: '/lib/sw-custom.js'
        });
      }).catch(console.error);
    }
  }, []);
  
  return null; // Componente invisible
}