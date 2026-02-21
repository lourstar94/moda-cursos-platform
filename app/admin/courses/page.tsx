// app/admin/courses/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { deleteCourse } from '@/app/actions/course'
import { DeleteCourseButton } from '@/components/DeleteCourseButton'



// Función para obtener los cursos con información básica
async function getCourses() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        videos: {
          select: {
            id: true
          }
        },
        accessList: {
          where: {
            isActive: true
          },
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return courses
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

export default async function AdminCoursesPage() {
  const session = await getServerSession(authOptions)

  // Verificar autenticación y rol
  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const courses = await getCourses()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-4 sm:px-0">
          
            <Link
              href="/admin/courses/new"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Crear Nuevo Curso
            </Link>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Cursos</h3>
              <p className="text-3xl font-bold text-blue-600">{courses.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-900">Videos Totales</h3>
              <p className="text-3xl font-bold text-green-600">
                {courses.reduce((acc, course) => acc + course.videos.length, 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-900">Accesos Activos</h3>
              <p className="text-3xl font-bold text-purple-600">
                {courses.reduce((acc, course) => acc + course.accessList.length, 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-900">Ingresos Totales</h3>
              <p className="text-3xl font-bold text-yellow-600">
                ${courses.reduce((acc, course) => acc + (course.price * course.accessList.length), 0)}
              </p>
            </div>
          </div>

          {/* Lista de cursos */}
          {courses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-600 mb-4">
                Aún no tienes cursos creados
              </h2>
              <p className="text-gray-500 mb-6">
                Comienza creando tu primer curso para compartir tu conocimiento.
              </p>
              <Link
                href="/admin/courses/new"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Crear Mi Primer Curso
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Curso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Videos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accesos Activos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Creación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>

<tbody className="bg-white divide-y divide-gray-200">
  {courses.map((course) => (
    <tr key={course.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {course.title}
          </div>
          <div className="text-sm text-gray-500 line-clamp-2">
            {course.description || 'Sin descripción'}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {course.videos.length}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        ${course.price}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {course.accessList.length}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(course.createdAt).toLocaleDateString('es-ES')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          {/* Botón Editar */}
          <Link
            href={`/admin/courses/${course.id}/edit`}
            className="inline-flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-200 border border-blue-200 hover:border-blue-300"
            title="Editar curso"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </Link>

          {/* Botón Videos */}
          <Link
            href={`/admin/courses/${course.id}/videos`}
            className="inline-flex items-center px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors duration-200 border border-green-200 hover:border-green-300"
            title="Gestionar videos"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Videos
          </Link>

          {/* Botón Eliminar (deshabilitado por ahora) */}
    <DeleteCourseButton courseId={course.id} />

        </div>
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
   
    
  )
}