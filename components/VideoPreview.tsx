// components/VideoPreview.tsx - ARCHIVO NUEVO
'use client';

import { useState, useEffect } from 'react';
import { Play, X } from 'lucide-react';

interface VideoPreviewProps {
  url: string;
  onClose?: () => void;
  autoPlay?: boolean;
}

export default function VideoPreview({ url, onClose, autoPlay = false }: VideoPreviewProps) {
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    // Extraer el ID del video de la URL de YouTube
    const extractVideoId = (url: string): string | null => {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/,
        /(?:youtube\.com\/embed\/)([^?]+)/,
        /(?:youtube\.com\/v\/)([^?]+)/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      return null;
    };

    const id = extractVideoId(url);
    setVideoId(id);
  }, [url]);

  if (!videoId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <Play className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-center">
          URL de YouTube no válida o no reconocida
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Asegúrate de que sea un enlace válido de YouTube
        </p>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}${autoPlay ? '?autoplay=1' : ''}`;

  return (
    <div className="relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          title="Vista previa del video"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="mt-2 text-sm text-gray-600">
        <p><strong>Video ID:</strong> {videoId}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 truncate block"
        >
          {url}
        </a>
      </div>
    </div>
  );
}