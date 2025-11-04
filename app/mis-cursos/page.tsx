// app/mis-cursos/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'

async function getUserCourses(userId: string) {
  try {
    const userCourses = await prisma.userCourseAccess.findMany({
      where: {
        userId: userId,
        isActive: true
      },
      include: {
        course: {
          include: {
            videos: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                duration: true,
                order: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return userCourses
  } catch (error) {
    console.error('Error fetching user courses:', error)
    return []
  }
}

export default async function MisCursosPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const userCourses = await getUserCourses(session.user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              Mis Cursos
            </h1>
            <div className="flex items-center space-x-4">
              <Link 
                href="/courses"
                className="text-[#9810FA] hover:text-[#7e0ccf] font-medium"

              >
                Catálogo de Cursos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {userCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              Aún no tienes cursos activos
            </h2>
            <p className="text-gray-500 mb-6">
              Una vez que adquieras un curso y la diseñadora habilite tu acceso, aparecerán aquí.
            </p>
            <Link
              href="/courses"
className="bg-[#9810FA] hover:bg-[#7e0ccf] text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Explorar Cursos Disponibles
            </Link>
          </div>
        ) : (
          <>
            {/* Información del usuario */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Tu progreso de aprendizaje
              </h2>
              <p className="text-gray-600">
                Tienes acceso a {userCourses.length} {userCourses.length === 1 ? 'curso' : 'cursos'}
              </p>
            </div>

            {/* Grid de cursos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCourses.map((userCourse) => (
                <div key={userCourse.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  {/* Imagen del curso */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {userCourse.course.image ? (
                      <img 
                        src={userCourse.course.image} 
                        alt={userCourse.course.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <div className="text-4xl mb-2">🎨</div>
                        <p className="text-sm">Imagen del curso</p>
                      </div>
                    )}
                  </div>

                  {/* Contenido del curso */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {userCourse.course.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {userCourse.course.description || 'Descripción no disponible.'}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-500">
                        {userCourse.course.videos.length} {userCourse.course.videos.length === 1 ? 'video' : 'videos'}
                      </div>
                      <div className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                        Acceso Activo
                      </div>
                    </div>

                    {/* Información de acceso */}
                    <div className="border-t pt-4 mt-4">
                      <div className="text-sm text-gray-500 mb-2">
                        Acceso habilitado el {new Date(userCourse.createdAt).toLocaleDateString('es-ES')}
                      </div>
                      
                      {/* BOTÓN ACTUALIZADO - AHORA FUNCIONAL */}
                      <Link 
                        href={`/mis-cursos/${userCourse.course.id}`}
className="block w-full bg-[#9810FA] hover:bg-[#7e0ccf] text-white font-medium py-2 px-4 rounded-lg text-center transition-colors duration-200"
                      >
                        Ver Videos del Curso
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Información adicional */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                ¿Necesitas ayuda?
              </h3>
              <p className="text-blue-700">
                Si tienes problemas para acceder a algún curso o necesitas asistencia, 
                contacta a la diseñadora por WhatsApp.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}