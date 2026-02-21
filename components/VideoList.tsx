// components/VideoList.tsx
'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Video } from '@prisma/client';
import { GripVertical, Edit, Trash2 } from 'lucide-react';
import { deleteVideo } from '@/app/actions/video';

interface VideoListProps {
  videos: Video[];
  courseId: string;
  onEdit?: (video: Video) => void;
  onDelete?: (videoId: string) => Promise<void>; // ✅ ← AGREGA ESTA LÍNEA
  onReorder?: (orderedVideoIds: string[]) => void;
}


// Componente para items no sortables (cuando onReorder no está definido)
function VideoItem({ 
  video, 
  courseId, 
  onEdit 
}: { 
  video: Video; 
  courseId: string;
  onEdit?: (video: Video) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este video?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteVideo(video.id, courseId);
    } catch (error) {
      console.error('Error deleting video:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Extraer ID de YouTube para miniatura
  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const youtubeId = extractYouTubeId(video.url);

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {/* Miniatura de YouTube */}
        {youtubeId && (
          <div className="flex-shrink-0">
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
              alt={video.title}
              className="w-20 h-12 object-cover rounded"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {video.order}. {video.title}
          </h4>
          <p className="text-sm text-gray-500">
            {video.duration} min • {youtubeId ? 'YouTube' : 'Video'}
          </p>
          {video.description && (
            <p className="text-xs text-gray-400 mt-1 truncate">
              {video.description}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {onEdit && (
          <button
            onClick={() => onEdit(video)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
            title="Editar video"
          >
            <Edit className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
          title="Eliminar video"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Componente para items sortables (cuando onReorder está definido)
function SortableVideoItem({ video, courseId, onEdit }: { 
  video: Video; 
  courseId: string;
  onEdit?: (video: Video) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este video?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteVideo(video.id, courseId);
    } catch (error) {
      console.error('Error deleting video:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Extraer ID de YouTube para miniatura
  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const youtubeId = extractYouTubeId(video.url);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        
        {/* Miniatura de YouTube */}
        {youtubeId && (
          <div className="flex-shrink-0">
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
              alt={video.title}
              className="w-20 h-12 object-cover rounded"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {video.order}. {video.title}
          </h4>
          <p className="text-sm text-gray-500">
            {video.duration} min • {youtubeId ? 'YouTube' : 'Video'}
          </p>
          {video.description && (
            <p className="text-xs text-gray-400 mt-1 truncate">
              {video.description}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {onEdit && (
          <button
            onClick={() => onEdit(video)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
            title="Editar video"
          >
            <Edit className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
          title="Eliminar video"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function VideoList({ videos, courseId, onEdit, onReorder }: VideoListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id && onReorder) {
      const oldIndex = videos.findIndex((v) => v.id === active.id);
      const newIndex = videos.findIndex((v) => v.id === over?.id);

      const reorderedVideos = arrayMove(videos, oldIndex, newIndex);
      const orderedVideoIds = reorderedVideos.map((v) => v.id);
      onReorder(orderedVideoIds);
    }
  }

  if (videos.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          No hay videos en este curso
        </h3>
        <p className="text-gray-500">
          Agrega el primer video usando el formulario.
        </p>
      </div>
    );
  }

  // Si onReorder no está definido, mostrar lista simple
  if (!onReorder) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Videos del Curso ({videos.length})
          </h2>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {videos.map((video) => (
              <VideoItem
                key={video.id}
                video={video}
                courseId={courseId}
                onEdit={onEdit}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Si onReorder está definido, mostrar lista con drag & drop
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Videos del Curso ({videos.length})
        </h2>
      </div>
      <div className="p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={videos.map(v => v.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {videos.map((video) => (
                <SortableVideoItem
                  key={video.id}
                  video={video}
                  courseId={courseId}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}