// app/admin/access/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import AccessManagement from '@/components/admin/AccessManagement'

async function getUsersWithAccess() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'CLIENT'
      },
      include: {
        coursesAccessed: {
          include: {
            course: {
              select: {
                id: true,
                title: true, 
                price: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      take: 50 // ✅ LIMIT para evitar cargar demasiados usuarios
    })
    
    // ✅ Transformamos los objetos Date a string para que Next.js no se queje 
    // al pasarlos al Client Component (AccessManagement)
    const serializedUsers = users.map(user => ({
      ...user,
      coursesAccessed: user.coursesAccessed.map(access => ({
        ...access,
        expiresAt: access.expiresAt ? access.expiresAt.toISOString() : null
      }))
    }))

    return serializedUsers
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export default async function AccessPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const users = await getUsersWithAccess()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Gestión de Accesos a Cursos
          </h1>
          <p className="text-gray-600 mb-8">
            Desde aquí puedes habilitar o deshabilitar el acceso de los clientes a los cursos, y definir su tiempo de expiración.
          </p>
          
          <AccessManagement 
            users={users}
          />
        </div>
      </div>
    </div>
  )
}