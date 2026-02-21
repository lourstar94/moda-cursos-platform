// components/VideoPlayer.tsx - CORREGIDO
'use client';

import { useState, useEffect } from 'react';
import { Video } from '@prisma/client';
import { updateVideoProgress, getUserVideoProgress } from '@/app/actions/user-progress';
import Link from 'next/link';
import { Play, Pause, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

// Declaración global para YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoPlayerProps {
  video: Video;
  nextVideo: Video | null;
  prevVideo: Video | null;
  courseId: string;
  userId: string;
}

export default function VideoPlayer({ video, nextVideo, prevVideo, courseId, userId }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [player, setPlayer] = useState<any>(null);

  // Extraer ID de YouTube de la URL
  const getYouTubeId = (url: string): string | null => {
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

  const videoId = getYouTubeId(video.url);

  // Configurar YouTube IFrame API
  useEffect(() => {
    if (!videoId) return;

    // Cargar YouTube IFrame API si no está cargada
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Configurar callback cuando la API esté lista
    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player('youtube-player', {
        videoId: videoId,
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
        playerVars: {
          playsinline: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
        },
      });
      setPlayer(newPlayer);
    };

    // Si la API ya está cargada, crear el player inmediatamente
    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [videoId]);

  const onPlayerReady = (event: any) => {
    console.log('YouTube player ready');
  };

  const onPlayerStateChange = (event: any) => {
    const playerState = event.data;
    
    if (playerState === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (playerState === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    } else if (playerState === window.YT.PlayerState.ENDED) {
      handleVideoEnd();
    }
  };

  const handleVideoEnd = async () => {
    setIsCompleted(true);
    setIsPlaying(false);
    
    // Aquí integrarías la función de progreso cuando esté disponible
    console.log('Video completado:', video.id);
  };

  const togglePlay = () => {
    if (!player) return;

    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  if (!videoId) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-800 rounded-lg">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error: URL de YouTube no válida</p>
          <p className="text-gray-400 text-sm">{video.url}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      {/* Reproductor de YouTube */}
      <div className="relative aspect-video bg-black">
        <div id="youtube-player" className="w-full h-full" />
        
        {/* Overlay de controles personalizados */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <button
            onClick={togglePlay}
            className="bg-black bg-opacity-50 rounded-full p-4 text-white"
          >
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </button>
        </div>
      </div>

      {/* Información del video */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">{video.title}</h1>
            {video.description && (
              <p className="text-gray-300">{video.description}</p>
            )}
          </div>
          {isCompleted && (
            <div className="flex items-center text-green-400 ml-4">
              <CheckCircle className="h-6 w-6 mr-1" />
              <span className="text-sm">Completado</span>
            </div>
          )}
        </div>

        {/* Controles de navegación */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
          <div>
            {prevVideo && (
              <Link
                href={`/courses/${courseId}/watch/${prevVideo.id}`}
                className="flex items-center text-blue-400 hover:text-blue-300"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Anterior
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-gray-300"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
          </div>

          <div>
            {nextVideo && (
              <Link
                href={`/courses/${courseId}/watch/${nextVideo.id}`}
                className="flex items-center text-blue-400 hover:text-blue-300"
              >
                Siguiente
                <ChevronRight className="h-5 w-5 ml-1" />
              </Link>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-4 text-sm text-gray-400">
          <p>Duración: {video.duration} minutos</p>
          <p>Orden en el curso: {video.order + 1}</p>
        </div>
      </div>
    </div>
  );
}