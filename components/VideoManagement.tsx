// components/VideoManagement.tsx
'use client';

import { useState } from 'react';
import { Video } from '@prisma/client';
import { VideoInput } from '@/lib/validations';
import { createVideo, updateVideo, deleteVideo, reorderVideos } from '@/app/actions/videos';
import VideoList from './VideoList';
import VideoForm from './VideoForm';
import VideoPreview from './VideoPreview';
import { Plus } from 'lucide-react';

interface VideoManagementProps {
  courseId: string;
  initialVideos: Video[];
}

export default function VideoManagement({ courseId, initialVideos }: VideoManagementProps) {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleCreateVideo = async (data: VideoInput) => {
    try {
      const newVideo = await createVideo(courseId, data);
      setVideos(prev => [...prev, newVideo]);
      setShowForm(false);
      setPreviewUrl('');
    } catch (error) {
      alert('Error al crear el video');
    }
  };

  const handleUpdateVideo = async (data: VideoInput) => {
    if (!editingVideo) return;
    try {
      const updatedVideo = await updateVideo(editingVideo.id, data);
      setVideos(prev => prev.map(v => v.id === updatedVideo.id ? updatedVideo : v));
      setEditingVideo(null);
      setPreviewUrl('');
    } catch (error) {
      alert('Error al actualizar el video');
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este video?')) return;
    try {
      await deleteVideo(videoId);
      setVideos(prev => prev.filter(v => v.id !== videoId));
    } catch (error) {
      alert('Error al eliminar el video');
    }
  };

  const handleReorder = async (orderedVideoIds: string[]) => {
    try {
      await reorderVideos(courseId, orderedVideoIds);
      // Reordenar localmente
      const reorderedVideos = orderedVideoIds.map(id => videos.find(v => v.id === id)!);
      setVideos(reorderedVideos);
    } catch (error) {
      alert('Error al reordenar los videos');
    }
  };

  const handleUrlChange = (url: string) => {
    setPreviewUrl(url);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Videos del Curso</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingVideo(null);
            setPreviewUrl('');
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Video
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Lista de Videos</h2>
          {videos.length > 0 ? (
            <VideoList
  courseId={courseId}
  videos={videos}
  onEdit={(video) => {
    setEditingVideo(video);
    setShowForm(false);
    setPreviewUrl(video.url);
  }}
  onDelete={handleDeleteVideo}
  onReorder={handleReorder}
/>
          ) : (
            <p className="text-gray-500">No hay videos en este curso.</p>
          )}
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingVideo ? 'Editar Video' : showForm ? 'Nuevo Video' : 'Vista Previa'}
          </h2>

          {showForm && !editingVideo && (
            <VideoForm
              courseId={courseId}
              onSubmit={handleCreateVideo}
              onCancel={() => {
                setShowForm(false);
                setPreviewUrl('');
              }}
              onUrlChange={handleUrlChange}
            />
          )}

          {editingVideo && (
            <VideoForm
              courseId={courseId}
              video={editingVideo}
              onSubmit={handleUpdateVideo}
              onCancel={() => {
                setEditingVideo(null);
                setPreviewUrl('');
              }}
              onUrlChange={handleUrlChange}
            />
          )}

          {/* Vista previa cuando no hay formulario activo pero hay URL seleccionada */}
          {previewUrl && !editingVideo && !showForm && (
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-2">Vista Previa</h3>
              <VideoPreview 
                url={previewUrl} 
                onClose={() => setPreviewUrl('')}
              />
            </div>
          )}

          {/* Vista previa en tiempo real cuando se está editando/creando */}
          {(editingVideo || showForm) && previewUrl && (
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-2">Vista Previa</h3>
              <VideoPreview url={previewUrl} />
            </div>
          )}

          {/* Estado vacío cuando no hay nada seleccionado */}
          {!previewUrl && !editingVideo && !showForm && (
            <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">
                Selecciona un video de la lista o crea uno nuevo para ver la vista previa
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}