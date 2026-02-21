// app/admin/courses/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { DeleteCourseButton } from '@/components/DeleteCourseButton'

// Función para obtener los cursos con información básica
async function getCourses() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        videos: {
          select: { id: true }
        },
        accessList: {
          where: { isActive: true },
          select: { id: true }
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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        
        {/* Header Superior */}
        <div className="flex justify-between items-center mb-8 px-4 sm:px-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Cursos</h1>
            <p className="text-sm text-gray-500 mt-1">Administra tu catálogo de contenido y métricas.</p>
          </div>
          <Link
            href="/admin/courses/new"
            className="bg-[#9810FA] hover:bg-[#7e0ccf] text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Curso
          </Link>
        </div>

        {/* Estadísticas rápidas - Estilo más moderno */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 px-4 sm:px-0">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Cursos</h3>
            <p className="text-4xl font-black text-gray-900">{courses.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Videos Totales</h3>
            <p className="text-4xl font-black text-gray-900">
              {courses.reduce((acc, course) => acc + course.videos.length, 0)}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Accesos Activos</h3>
            <p className="text-4xl font-black text-[#9810FA]">
              {courses.reduce((acc, course) => acc + course.accessList.length, 0)}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Ingresos Totales</h3>
            <p className="text-4xl font-black text-emerald-600">
              ${courses.reduce((acc, course) => acc + (course.price * course.accessList.length), 0)}
            </p>
          </div>
        </div>

        {/* Lista de cursos */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-gray-300 text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aún no tienes cursos</h2>
            <p className="text-gray-500 mb-6">Comienza tu catálogo creando tu primer contenido.</p>
            <Link
              href="/admin/courses/new"
              className="inline-block bg-[#9810FA] hover:bg-[#7e0ccf] text-white font-medium py-3 px-8 rounded-xl transition-colors duration-200"
            >
              Crear mi primer curso
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-2/5">
                      Detalles del Curso
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Métricas
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Creado el
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Gestión
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50/80 transition-colors">
                      
                      {/* Columna 1: Info del curso */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-gray-900 line-clamp-1" title={course.title}>
                            {course.title}
                          </span>
                          <span className="text-sm text-gray-500 line-clamp-1 mt-0.5" title={course.description || ''}>
                            {course.description || 'Sin descripción'}
                          </span>
                        </div>
                      </td>

                      {/* Columna 2: Métricas Agrupadas (Evita que la tabla se ensanche) */}
                      <td className="px-6 py-5">
                        <div className="flex justify-center gap-4 text-sm">
                          <div className="flex flex-col items-center" title="Videos">
                            <span className="font-semibold text-gray-900">{course.videos.length}</span>
                            <span className="text-[10px] text-gray-400 uppercase">Vid</span>
                          </div>
                          <div className="w-px bg-gray-200 h-8"></div>
                          <div className="flex flex-col items-center" title="Precio">
                            <span className="font-semibold text-emerald-600">${course.price}</span>
                            <span className="text-[10px] text-gray-400 uppercase">Precio</span>
                          </div>
                          <div className="w-px bg-gray-200 h-8"></div>
                          <div className="flex flex-col items-center" title="Accesos">
                            <span className="font-semibold text-[#9810FA]">{course.accessList.length}</span>
                            <span className="text-[10px] text-gray-400 uppercase">Acc</span>
                          </div>
                        </div>
                      </td>

                      {/* Columna 3: Fecha */}
                      <td className="px-6 py-5 text-center whitespace-nowrap">
                        <span className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full">
                          {new Date(course.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>

                      {/* Columna 4: Botones de Acción */}
                      <td className="px-6 py-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/courses/${course.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 shadow-sm transition-all"
                          >
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </Link>

                          <Link
                            href={`/admin/courses/${course.id}/videos`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 shadow-sm transition-all"
                          >
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Videos
                          </Link>

                          {/* Ojo: Si el botón eliminar rompe el diseño por ser muy ancho, tendrías que ajustar ese componente también */}
                          <div className="scale-90 origin-right">
                            <DeleteCourseButton courseId={course.id} />
                          </div>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}