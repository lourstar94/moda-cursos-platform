'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CourseInput, courseSchema } from '@/lib/validations';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditCourseClient({ course }: { course: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course.title,
      description: course.description || '',
      price: course.price,
      image: course.image || ''
    }
  });

  const onSubmit = async (data: CourseInput) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) setError(result.error || 'Error al actualizar');
      else router.push('/admin/courses');
    } catch {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          <Link
            href="/admin/courses"
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
          >
            ← Volver a cursos
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">Editar Curso</h1>
          <p className="text-gray-600 mt-2">Modifica la información del curso "{course.title}".</p>

          <div className="bg-white rounded-lg shadow p-6 mt-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input {...register('title')} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <textarea {...register('description')} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio (USD) *</label>
                <input {...register('price', { valueAsNumber: true })} type="number" step="0.01" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de la imagen (opcional)</label>
                <input {...register('image')} type="url" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                {course.image && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Imagen actual:</p>
                    <img src={course.image} alt="Imagen actual" className="h-32 object-cover rounded" />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Link href="/admin/courses" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-lg">Cancelar</Link>
                <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50">
                  {isLoading ? 'Actualizando curso...' : 'Actualizar Curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
