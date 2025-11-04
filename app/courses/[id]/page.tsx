// app/courses/[id]/page.tsx
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import PurchaseModal from '@/components/client/PurchaseModal'

// Función para obtener un curso y sus videos
async function getCourse(id: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        videos: {
          orderBy: { order: 'asc' }
        }
      }
    })
    return course
  } catch (error) {
    console.error('Error fetching course:', error)
    return null
  }
}

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ id: string }> // ← Promise aquí
}) {
  const { id } = await params // ← await aquí
  const course = await getCourse(id)
  const session = await getServerSession(authOptions)

  if (!course) {
    notFound()
  }

  // Verificar si el usuario ya tiene acceso al curso
  let hasAccess = false
  if (session?.user?.id) {
    const userAccess = await prisma.userCourseAccess.findFirst({
      where: {
        userId: session.user.id,
        courseId: course.id,
        isActive: true
      }
    })
    hasAccess = !!userAccess
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/courses"
              className="text-[#9810FA] hover:text-[#7e0ccf] font-medium"
            >
              ← Volver al catálogo
            </Link>
          <div className="flex items-center space-x-4">
  <Link
    href="/mis-cursos"
    className="text-[#9810FA] hover:text-[#7e0ccf] font-medium"
  >
    Mis Cursos
  </Link>
</div>

          </div>
        </div>
      </div>

      {/* Contenido del curso */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Imagen */}
          <div className="h-64 bg-gray-200 flex items-center justify-center">
            {course.image ? (
              <img
                src={course.image}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-gray-400 text-center">
                <div className="text-6xl mb-2">🎨</div>
                <p className="text-lg">Imagen del curso</p>
              </div>
            )}
          </div>

          {/* Información del curso */}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {course.title}
            </h1>

            <div className="flex items-center justify-between mb-6">
              <div className="text-3xl font-bold text-[#E12AFB]">
                ${course.price}
              </div>
              <div className="text-gray-600">
                {course.videos.length} {course.videos.length === 1 ? 'video' : 'videos'}
              </div>
            </div>

            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              {course.description || 'Descripción detallada del curso disponible próximamente.'}
            </p>

            {/* Lista de videos */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Contenido del curso
              </h2>
              <div className="space-y-3">
                {course.videos.map((video, index) => (
                  <div
                    key={video.id}
                    className="flex items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-4">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{video.title}</h3>
                      {video.duration && (
                        <p className="text-sm text-gray-500">{video.duration} min</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón de compra o acceso */}
            <div className="border-t pt-6">
              {hasAccess ? (
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    ✅ Ya tienes acceso a este curso
                  </h3>
                  <p className="text-green-700 mb-4">
                    Puedes ver todos los videos en tu área de cursos
                  </p>
                  <Link
                    href="/mis-cursos"
                    className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
                  >
                    Ver Mis Cursos
                  </Link>
                </div>
              ) : session ? (
                <div className="bg-[#f3e5ff] rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-[#7e0ccf] mb-2">
                    ¿Te interesa este curso?
                  </h3>
                  <p className="text-[#9810FA] mb-4">
                    Contacta a la diseñadora para coordinar el pago y obtener acceso
                  </p>
                  <PurchaseModal
                    course={course}
                    user={session.user}
                  />
                </div>
              ) : (
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    ¿Te interesa este curso?
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Inicia sesión para contactar a la diseñadora y coordinar el pago
                  </p>
                  <Link
                    href="/login"
                    className="inline-block bg-[#9810FA] hover:bg-[#7e0ccf] text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
                  >
                    Iniciar Sesión para Comprar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
