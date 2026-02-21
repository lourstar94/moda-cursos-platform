// components/VideoSidebar.tsx - CORREGIDO
'use client';

import { Video } from '@prisma/client';
import { Play, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface VideoSidebarProps {
  courseId: string;
  videos: Video[];
  currentVideoId: string;
  userId?: string; // Hacer opcional temporalmente
}

export default function VideoSidebar({ courseId, videos, currentVideoId, userId }: VideoSidebarProps) {
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());

  // Función para formatear la duración
  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '--:--';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}`;
    }
    return `${mins} min`;
  };

  // Función para marcar como completado (temporal)
  const markAsCompleted = (videoId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setCompletedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  return (
    <div className="h-full bg-gray-800 overflow-y-auto">
      {/* Header del sidebar */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Contenido del curso</h2>
        <p className="text-sm text-gray-400 mt-1">
          {videos.length} {videos.length === 1 ? 'video' : 'videos'}
        </p>
      </div>

      {/* Lista de videos */}
      <div className="p-2">
        {videos.map((video, index) => {
          const isCurrent = video.id === currentVideoId;
          const isCompleted = completedVideos.has(video.id);

          return (
            <div
              key={video.id}
              className={`mb-1 rounded-lg transition-all duration-200 ${
                isCurrent 
                  ? 'bg-blue-600 border border-blue-500' 
                  : 'bg-gray-700 hover:bg-gray-600 border border-transparent'
              }`}
            >
              <Link
                href={`/courses/${courseId}/watch/${video.id}`}
                className={`block p-3 no-underline ${
                  isCurrent ? 'text-white' : 'text-gray-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Ícono de estado */}
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : isCurrent ? (
                      <Play className="h-4 w-4 text-white" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-400" />
                    )}
                  </div>

                  {/* Información del video */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className={`text-sm font-medium line-clamp-2 ${
                        isCurrent ? 'text-white' : 'text-gray-200'
                      }`}>
                        {video.title}
                      </h3>
                    </div>

                    {/* Metadatos del video */}
                    <div className="flex items-center space-x-3 mt-1">
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(video.duration)}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Acciones rápidas (solo para el video actual) */}
              {isCurrent && (
                <div className="px-3 pb-2 pt-1 border-t border-blue-500">
                  <button
                    onClick={(e) => markAsCompleted(video.id, e)}
                    className={`flex items-center space-x-1 text-xs ${
                      isCompleted 
                        ? 'text-green-400 hover:text-green-300' 
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <CheckCircle className="h-3 w-3" />
                    <span>
                      {isCompleted ? 'Marcar como no visto' : 'Marcar como completado'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer del sidebar */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-center text-sm text-gray-400">
          <p>Progreso general del curso</p>
          <div className="mt-2 w-full bg-gray-600 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${videos.length > 0 ? (completedVideos.size / videos.length) * 100 : 0}%` 
              }}
            />
          </div>
          <p className="mt-1">
            {completedVideos.size} de {videos.length} videos completados
          </p>
        </div>
      </div>
    </div>
  );
}