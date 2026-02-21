// components/admin/AccessManagement.tsx
'use client'

import { useState } from 'react'
import SearchableUserSelect from '@/components/SearchableUserSelect'
import SearchableCourseSelect from '@/components/SearchableCourseSelect'

interface User {
  id: string
  name: string | null
  email: string
  coursesAccessed: {
    id: string
    isActive: boolean
    expiresAt: string | null
    course: {
      id: string
      title: string
      price: number
    }
  }[]
}

interface AccessManagementProps {
  users: User[]
}

export default function AccessManagement({ users }: AccessManagementProps) {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedDuration, setSelectedDuration] = useState('unlimited')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // ✅ NUEVO ESTADO: Controla la pestaña activa
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  const handleGrantAccess = async () => {
    if (!selectedUserId || !selectedCourseId) {
      setMessage({ type: 'error', text: 'Selecciona un usuario y un curso' })
      return
    }

    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      let expiresAt = null;
      if (selectedDuration !== 'unlimited') {
        const date = new Date();
        const monthsToAdd = parseInt(selectedDuration);
        date.setMonth(date.getMonth() + monthsToAdd);
        expiresAt = date.toISOString();
      }

      const response = await fetch('/api/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserId,
          courseId: selectedCourseId,
          expiresAt
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al habilitar acceso')
      }

      setMessage({ type: 'success', text: 'Acceso habilitado correctamente' })
      setSelectedCourseId('')
      setSelectedDuration('unlimited')
      
      setTimeout(() => window.location.reload(), 1500)
      
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error al habilitar acceso' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeAccess = async (accessId: string) => {
    if (!confirm('¿Estás segura de que quieres revocar el acceso a este curso?')) {
      return
    }

    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch('/api/access', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessId
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al revocar acceso')
      }

      setMessage({ type: 'success', text: 'Acceso revocado correctamente' })
      
      setTimeout(() => window.location.reload(), 1500)
      
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error al revocar acceso' })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Acceso de por vida';
    const date = new Date(dateString);
    return `Expira: ${date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  }

  // ✅ NUEVA FUNCIÓN: Verifica si la fecha ya pasó
  const isCourseExpired = (dateString: string | null) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  }

  // ✅ LÓGICA DE FILTRADO
  const filteredUsers = users.map(user => {
    // Primero filtramos los cursos dentro de cada usuario
    const filteredCourses = user.coursesAccessed.filter(access => {
      const isExpired = isCourseExpired(access.expiresAt);
      const isEffectivelyActive = access.isActive && !isExpired;

      if (filterStatus === 'all') return true;
      if (filterStatus === 'active') return isEffectivelyActive;
      if (filterStatus === 'inactive') return !isEffectivelyActive;
      return true;
    });

    return { ...user, coursesAccessed: filteredCourses };
  }).filter(user => {
    // Luego decidimos si mostramos al usuario en la lista
    if (filterStatus === 'all') return true; // En "Todos" mostramos a todos
    return user.coursesAccessed.length > 0; // En las otras pestañas, solo a los que tienen cursos que coincidan
  });

  return (
    <div className="space-y-8">
      {/* Mensajes */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' : 
          'bg-green-100 border border-green-400 text-green-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Sección: Habilitar nuevo acceso */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Habilitar Nuevo Acceso
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Cliente</label>
            <SearchableUserSelect value={selectedUserId} onChange={setSelectedUserId} placeholder="Buscar cliente por nombre o email..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Curso</label>
            <SearchableCourseSelect value={selectedCourseId} onChange={setSelectedCourseId} placeholder="Buscar curso por título..." disabled={!selectedUserId} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duración del Acceso</label>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              disabled={!selectedCourseId}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="unlimited">Ilimitado (De por vida)</option>
              <option value="1">1 Mes</option>
              <option value="3">3 Meses</option>
              <option value="6">6 Meses</option>
              <option value="12">1 Año</option>
              <option value="24">2 Años</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGrantAccess}
          disabled={isLoading || !selectedUserId || !selectedCourseId}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
        >
          {isLoading ? 'Habilitando acceso...' : 'Habilitar Acceso'}
        </button>
      </div>

      {/* Sección: Gestión de accesos existentes */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 border-b border-gray-200 pb-4 gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Accesos Actuales
          </h2>
          
          {/* ✅ NUEVO: Pestañas de Filtrado */}
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filterStatus === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filterStatus === 'active' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-green-700'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filterStatus === 'inactive' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-red-700'
              }`}
            >
              Inactivos / Expirados
            </button>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            No hay clientes que coincidan con este filtro.
          </p>
        ) : (
          <div className="space-y-6">
            {filteredUsers.map(user => (
              <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {user.coursesAccessed.filter(access => access.isActive && !isCourseExpired(access.expiresAt)).length} activos
                  </span>
                </div>

                {user.coursesAccessed.length === 0 ? (
                  <p className="text-gray-500 text-sm">Sin acceso a cursos en esta categoría</p>
                ) : (
                  <div className="space-y-2">
                    {user.coursesAccessed.map(access => {
                      // Evaluamos el estado real del curso para pintar las etiquetas
                      const isExpired = isCourseExpired(access.expiresAt);
                      const isEffectivelyActive = access.isActive && !isExpired;

                      return (
                        <div key={access.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">{access.course.title}</span>
                            <span className="text-sm text-gray-600 ml-2">(${access.course.price})</span>
                            {/* Mostramos la fecha solo si tiene acceso o si expiró */}
                            {(access.isActive || isExpired) && (
                               <p className={`text-xs mt-1 ${isExpired ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                                 {formatDate(access.expiresAt)}
                               </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-3">
                            {/* ✅ ETIQUETAS DINÁMICAS (Activo, Expirado, Inactivo) */}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              isEffectivelyActive ? 'bg-green-100 text-green-800' : 
                              isExpired && access.isActive ? 'bg-orange-100 text-orange-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {isEffectivelyActive ? 'Activo' : isExpired && access.isActive ? 'Expirado' : 'Revocado'}
                            </span>
                            
                            {/* El botón de revocar solo aparece si está activo y no ha expirado */}
                            {isEffectivelyActive && (
                              <button
                                onClick={() => handleRevokeAccess(access.id)}
                                disabled={isLoading}
                                className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                              >
                                Revocar
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}