// app/admin/page.tsx - ACTUALIZADO
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  UserCheck, 
  BarChart3, 
  Video,
  PlusCircle 
} from 'lucide-react'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const quickActions = [
    {
      name: 'Crear Nuevo Curso',
      href: '/admin/courses/new',
      icon: PlusCircle,
      description: 'Agregar un nuevo curso a la plataforma',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Gestionar Cursos',
      href: '/admin/courses',
      icon: BookOpen,
      description: 'Ver y editar todos los cursos',
      color: 'bg-green-500 hover:bg-green-600'
    },
    
    {
      name: 'Control de Accesos',
      href: '/admin/access',
      icon: UserCheck,
      description: 'Habilitar acceso a cursos',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
  ]

  return (
    <div>
      {/* Header de la página */}
     <div className="mb-8">
  <h1 className="text-3xl font-bold text-gray-900 mb-2">
    Mi Panel😊
  </h1>
  <p className="text-gray-600">
    Resumen y acciones rápidas de tu plataforma
  </p>
</div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${action.color} text-white`}>
                <action.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {action.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {action.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      
    </div>
  )
}