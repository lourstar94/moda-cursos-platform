'use client'; // AGREGAR ESTO

import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const router = useRouter();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📶</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Estás sin conexión
        </h1>
        
        <p className="text-gray-600 mb-6">
          No podemos cargar el contenido en este momento. 
          Revisa tu conexión a internet y vuelve a intentarlo.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">
            📱 Mientras tanto...
          </h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Revisa los cursos que ya descargaste</li>
            <li>• Tus progresos se guardarán cuando vuelvas online</li>
            <li>• La app seguirá funcionando en modo offline</li>
          </ul>
        </div>

        <button 
          onClick={handleRetry}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors min-h-touch"
        >
          Reintentar conexión
        </button>
      </div>
    </div>
  );
}