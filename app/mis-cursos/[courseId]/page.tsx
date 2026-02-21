// app/mis-cursos/[courseId]/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'

async function getCourseWithVideos(courseId: string, userId: string) {
  try {
    // Verificar que el usuario tiene acceso al curso
    const access = await prisma.userCourseAccess.findFirst({
      where: {
        userId: userId,
        courseId: courseId,
        isActive: true
      }
    })

    if (!access) {
      return null
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
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

// Función para extraer ID de YouTube
function extractYouTubeId(url: string): string {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : ''
}

export default async function CourseVideosPage({ 
  params 
}: { 
  params: Promise<{ courseId: string }> 
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // ✅ CORRECCIÓN: Await params antes de usarlo
  const { courseId } = await params
  const course = await getCourseWithVideos(courseId, session.user.id)

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Curso no encontrado o sin acceso</h1>
          <Link 
            href="/mis-cursos"
            className="text-[#9810FA] hover:text-[#7e0ccf]"
          >
            Volver a Mis Cursos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
  <div className="flex-1 min-w-0 mr-4"> {/* AGREGAR ESTAS CLASES */}
    <h1 className="text-2xl font-bold text-gray-900 truncate"> {/* AGREGAR truncate */}
      {course.title}
    </h1>
    <p className="text-gray-600 truncate"> {/* AGREGAR truncate */}
      {course.description}
    </p>
  </div>
  <Link 
    href="/mis-cursos"
    className="text-[#9810FA] hover:text-[#7e0ccf]"
  >
    ← Volver a Mis Cursos
  </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Columna de videos */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Videos del Curso
              </h2>
              
              {course.videos.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">🎬</div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Este curso aún no tiene videos
                  </h3>
                  <p className="text-gray-500">
                    La diseñadora está preparando el contenido. Vuelve pronto.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {course.videos.map((video, index) => (
                    <div key={video.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex flex-col gap-6">
                        {/* Reproductor de YouTube embebido */}
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            {index + 1}. {video.title}
                          </h3>
                          
                          <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-black">
                            <iframe
                              src={`https://www.youtube.com/embed/${extractYouTubeId(video.url)}`}
                              title={video.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-64 md:h-96 border-0"
                            ></iframe>
                          </div>
                        </div>
                        
                        {/* Información del video */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            {video.description && (
                              <p className="text-gray-600">
                                {video.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-gray-500">
                                {video.duration ? `${video.duration} minutos` : 'Duración no especificada'}
                              </span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-500">
                                Video {index + 1} de {course.videos.length}
                              </span>
                            </div>
                          </div>
                          
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 whitespace-nowrap"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                            </svg>
                            Ver en YouTube
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar con información del curso */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información del Curso
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Total de videos</h4>
                  <p className="text-lg font-semibold text-gray-900">{course.videos.length}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Duración total</h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {course.videos.reduce((acc, video) => acc + (video.duration || 0), 0)} minutos
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">¿Necesitas ayuda?</h4>
                  <p className="text-sm text-gray-600">
                    Si tienes problemas para ver los videos, contacta a la diseñadora.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}