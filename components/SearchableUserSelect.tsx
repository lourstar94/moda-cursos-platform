// components/SearchableUserSelect.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { UserSearchItem } from '@/types/search'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchableUserSelectProps {
  value: string
  onChange: (userId: string) => void
  placeholder?: string
}

export default function SearchableUserSelect({
  value,
  onChange,
  placeholder = 'Buscar cliente por nombre o email...'
}: SearchableUserSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<UserSearchItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserSearchItem | null>(null)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const debouncedQuery = useDebounce(searchQuery, 300)

  // Buscar usuarios cuando cambia la query
  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedQuery.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          query: debouncedQuery,
          page: '1',
          limit: '10'
        })

        const response = await fetch(`/api/admin/users/search?${params}`)
        
        if (!response.ok) {
          throw new Error('Error buscando usuarios')
        }

        const data = await response.json()
        setResults(data.data)
      } catch (error) {
        console.error('Error searching users:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    searchUsers()
  }, [debouncedQuery])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Manejar selección de usuario
  const handleSelectUser = (user: UserSearchItem) => {
    setSelectedUser(user)
    onChange(user.id)
    setSearchQuery(user.name || user.email)
    setIsOpen(false)
  }

  // Manejar cambio en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setIsOpen(true)
    
    // Si se borra el input, limpiar selección
    if (!e.target.value.trim()) {
      setSelectedUser(null)
      onChange('')
    }
  }

  // Manejar focus en el input
  const handleInputFocus = () => {
    setIsOpen(true)
  }

  // Manejar tecla Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading && (
            <div className="px-3 py-2 text-gray-500 text-sm">Buscando usuarios...</div>
          )}

          {!isLoading && debouncedQuery && results.length === 0 && (
            <div className="px-3 py-2 text-gray-500 text-sm">No se encontraron usuarios</div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="py-1">
              {results.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className={`w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                    selectedUser?.id === user.id ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </button>
              ))}
            </div>
          )}

          {!isLoading && !debouncedQuery && (
            <div className="px-3 py-2 text-gray-500 text-sm">
              Escribe para buscar usuarios...
            </div>
          )}
        </div>
      )}
    </div>
  )
}