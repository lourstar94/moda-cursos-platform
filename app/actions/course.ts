// app/actions/course.ts
'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function deleteCourse(courseId: string) {
  try {
    // Verificar si el curso existe
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        videos: true,
        accessList: true
      }
    })

    if (!course) {
      return { success: false, error: 'Curso no encontrado' }
    }

    // Eliminar en cascada en el orden correcto debido a las relaciones
    // 1. Primero eliminar UserVideoProgress relacionados con los videos del curso
    await prisma.userVideoProgress.deleteMany({
      where: {
        video: {
          courseId: courseId
        }
      }
    })

    // 2. Eliminar los videos del curso
    await prisma.video.deleteMany({
      where: { courseId: courseId }
    })

    // 3. Eliminar los accesos al curso (CORREGIDO: UserCourseAccess)
    await prisma.userCourseAccess.deleteMany({
      where: { courseId: courseId }
    })

    // 4. Finalmente eliminar el curso
    await prisma.course.delete({
      where: { id: courseId }
    })

    // Revalidar el cache para actualizar la UI
    revalidatePath('/admin/courses')
    
    return { 
      success: true, 
      message: 'Curso eliminado correctamente' 
    }
  } catch (error) {
    console.error('Error eliminando curso:', error)
    return { 
      success: false, 
      error: 'Error al eliminar el curso. Inténtalo de nuevo.' 
    }
  }
}