// app/admin/courses/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CourseInput, courseSchema } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Link from 'next/link'

export default function NewCoursePage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      price: 0,
      image: ''
    }
  })

  const onSubmit = async (data: CourseInput) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Error al crear el curso')
        return
      }

      // Curso creado exitosamente - redirigir a la lista de cursos
      router.push('/admin/courses')
      router.refresh()
      
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/admin/courses"
              className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
            >
              ← Volver a cursos
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Crear Nuevo Curso
            </h1>
            <p className="text-gray-600 mt-2">
              Completa la información básica del curso. Podrás agregar los videos después.
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Título */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título del curso *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Diseño de Moda Básico"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe el contenido del curso, lo que aprenderán los estudiantes..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Precio */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (USD) *
                </label>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>

              {/* Imagen */}
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  URL de la imagen (opcional)
                </label>
                <input
                  {...register('image')}
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://ejemplo.com/imagen-curso.jpg"
                />
                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                  Puedes usar servicios como Imgur, Cloudinary o subir la imagen a tu propio servidor.
                </p>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-4 pt-6">
                <Link
                  href="/admin/courses"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Creando curso...' : 'Crear Curso'}
                </button>
              </div>
            </form>
          </div>

          {/* Información adicional */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              ¿Qué sigue después de crear el curso?
            </h3>
            <ul className="text-blue-700 list-disc list-inside space-y-1">
              <li>Agregar los videos del curso (máximo 6 videos de 20 minutos)</li>
              <li>Los videos deben ser subidos a YouTube como privados</li>
              <li>Compartir el enlace del curso con tus clientes</li>
              <li>Habilitar el acceso manual cuando reciban el pago</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}