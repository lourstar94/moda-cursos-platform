// app/admin/courses/[id]/videos/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import VideoList from '@/components/VideoList'
import VideoFormClientWrapper from "@/components/VideoFormClientWrapper"

// Función para obtener el curso y sus videos
async function getCourseWithVideos(courseId: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        videos: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })
    return course
  } catch (error) {
    console.error('Error fetching course:', error)
    return null
  }
}

export default async function CourseVideosPage({
  params
}: {
  params: Promise<{ id: string }> // ← Promise aquí
}) {
  const { id } = await params // ← await aquí
  const session = await getServerSession(authOptions)

  // Verificar autenticación y rol
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const course = await getCourseWithVideos(id)

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Curso no encontrado</h1>
          <Link
            href="/admin/courses"
            className="text-blue-600 hover:text-blue-800"
          >
            Volver a cursos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestionar Videos: {course.title}
              </h1>
              <p className="text-gray-600 mt-2">
                {course.videos.length} video(s) en este curso
              </p>
            </div>
            <Link
              href="/admin/courses"
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              ← Volver a Cursos
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna izquierda - Formulario */}
            <div className="lg:col-span-1">
              <VideoFormClientWrapper courseId={course.id} />
            </div>

            {/* Columna derecha - Lista de videos */}
            <div className="lg:col-span-2">
              <VideoList
                videos={course.videos}
                courseId={course.id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
