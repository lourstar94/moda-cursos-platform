// app/courses/page.tsx
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
// Función para obtener los cursos desde la base de datos
async function getCourses() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        videos: {
          orderBy: { order: 'asc' },
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return courses
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

export default async function CoursesPage() {
  const session = await getServerSession(authOptions)
  const courses = await getCourses()

  return (
    <div className="min-h-screen bg-gray-50">
      

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl text-gray-600">
              Próximamente nuevos cursos de diseño de moda
            </h2>
            <p className="text-gray-500 mt-2">
              Estamos preparando contenido exclusivo para ti
            </p>
          </div>
        ) : (
          <>
            {/* Descripción */}
            <div className="text-center mb-12">
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Descubre los cursos exclusivos de diseño de ropa. 
                Aprende técnicas profesionales y desarrolla tu creatividad 
                con lecciones paso a paso.
              </p>
            </div>

            {/* Grid de cursos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  {/* Imagen del curso */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {course.image ? (
                      <img 
                        src={course.image} 
                        alt={course.title}
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
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {course.description || 'Descripción del curso disponible próximamente.'}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-500">
                        {course.videos.length} {course.videos.length === 1 ? 'video' : 'videos'}
                      </div>
                      <div className="text-2xl font-bold text-[#E12AFB]"> 
                        ${course.price}
                      </div>
                    </div>

                    {/* Botón de compra */}
                    <Link
                      href={`/courses/${course.id}`}
                      className="w-full bg-[#9810FA] hover:bg-[#7e0ccf] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-center block"
                    >
                      Ver Detalles del Curso
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}