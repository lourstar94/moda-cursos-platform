// components/VideoForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Video } from '@prisma/client';
import { createVideo } from '@/app/actions/video';
import { VideoInput } from '@/lib/validations';


interface VideoFormProps {
  courseId: string;
  video?: Video | null;
  onCancel: () => void;
   onSubmit: (data: VideoInput) => Promise<void>; 
  onSuccess?: () => void;
  onUrlChange?: (url: string) => void;
}

export default function VideoForm({ courseId, video, onCancel, onSuccess, onUrlChange }: VideoFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    title: video?.title || '',
    description: video?.description || '',
    url: video?.url || '',
    duration: video?.duration || 0,
    order: video?.order || 0,
  });

  // Notificar cambio de URL cuando el formulario se carga o la URL cambia
  useEffect(() => {
    if (onUrlChange && formData.url) {
      onUrlChange(formData.url);
    }
  }, [formData.url, onUrlChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: name === 'duration' || name === 'order' ? Number(value) : value,
    };
    
    setFormData(newFormData);

    // Notificar cambio de URL en tiempo real para vista previa
    if (name === 'url' && onUrlChange) {
      onUrlChange(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Convertir a FormData para la Server Action
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('url', formData.url);
      formDataToSend.append('duration', formData.duration.toString());
      // Nota: El order se calcula automáticamente en la Server Action

      const result = await createVideo(courseId, formDataToSend);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message! });
        // Reset form
        setFormData({
          title: '',
          description: '',
          url: '',
          duration: 0,
          order: 0,
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setMessage({ type: 'error', text: result.error! });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al procesar la solicitud' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900">
        {video ? 'Editar Video' : 'Agregar Nuevo Video'}
      </h3>
      
      {message && (
        <div className={`p-3 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Título *
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={formData.title}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          name="description"
          id="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          disabled={isLoading}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
          URL de YouTube *
        </label>
        <input
          type="url"
          name="url"
          id="url"
          value={formData.url}
          onChange={handleChange}
          required
          disabled={isLoading}
          placeholder="https://www.youtube.com/watch?v=..."
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        />
        {formData.url && !formData.url.includes('youtube.com') && !formData.url.includes('youtu.be') && (
          <p className="mt-1 text-sm text-red-600">
            Por favor ingresa una URL válida de YouTube
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Duración (minutos) *
          </label>
          <input
            type="number"
            name="duration"
            id="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            required
            disabled={isLoading}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label htmlFor="order" className="block text-sm font-medium text-gray-700">
            Orden
          </label>
          <input
            type="number"
            name="order"
            id="order"
            value={formData.order}
            onChange={handleChange}
            min="0"
            disabled={true} // Deshabilitado porque se calcula automáticamente
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 text-gray-500"
            title="El orden se calcula automáticamente"
          />
          <p className="text-xs text-gray-500 mt-1">Se calcula automáticamente</p>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Procesando...' : (video ? 'Actualizar' : 'Crear')} Video
        </button>
      </div>
    </form>
  );
}