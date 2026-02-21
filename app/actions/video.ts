// app/actions/video.ts - VERSIÓN ACTUALIZADA
'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Extraer ID de YouTube desde URL
function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

// Crear nuevo video
export async function createVideo(courseId: string, formData: FormData) {
  try {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const url = formData.get('url') as string
    const duration = formData.get('duration') as string

    if (!title || !url) {
      return { success: false, error: 'Título y URL son requeridos' }
    }

    const youtubeId = extractYouTubeId(url)
    if (!youtubeId) {
      return { success: false, error: 'URL de YouTube no válida' }
    }

    // Obtener el último orden para poner el nuevo video al final
    const lastVideo = await prisma.video.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' }
    })

    const newOrder = lastVideo ? lastVideo.order + 1 : 1

    await prisma.video.create({
      data: {
        title,
        description: description || '',
        url,
        duration: duration ? parseInt(duration) : null,
        order: newOrder,
        courseId
      }
    })

    revalidatePath(`/admin/courses/${courseId}/videos`)
    return { success: true, message: 'Video agregado correctamente' }
  } catch (error) {
    console.error('Error creating video:', error)
    return { success: false, error: 'Error al crear el video' }
  }
}

// Eliminar video
export async function deleteVideo(videoId: string, courseId: string) {
  try {
    await prisma.video.delete({
      where: { id: videoId }
    })

    revalidatePath(`/admin/courses/${courseId}/videos`)
    return { success: true, message: 'Video eliminado correctamente' }
  } catch (error) {
    console.error('Error deleting video:', error)
    return { success: false, error: 'Error al eliminar el video' }
  }
}