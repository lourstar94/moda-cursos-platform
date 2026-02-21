// components/SearchableCourseSelect.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { CourseSearchItem } from '@/types/search'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchableCourseSelectProps {
  value: string
  onChange: (courseId: string) => void
  placeholder?: string
  disabled?: boolean
}

export default function SearchableCourseSelect({
  value,
  onChange,
  placeholder = 'Buscar curso por título...',
  disabled = false
}: SearchableCourseSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<CourseSearchItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<CourseSearchItem | null>(null)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const debouncedQuery = useDebounce(searchQuery, 300)

  // Buscar cursos cuando cambia la query
  useEffect(() => {
    const searchCourses = async () => {
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

        const response = await fetch(`/api/admin/courses/search?${params}`)
        
        if (!response.ok) {
          throw new Error('Error buscando cursos')
        }

        const data = await response.json()
        setResults(data.data)
      } catch (error) {
        console.error('Error searching courses:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    searchCourses()
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

  // Manejar selección de curso
  const handleSelectCourse = (course: CourseSearchItem) => {
    setSelectedCourse(course)
    onChange(course.id)
    setSearchQuery(course.title)
    setIsOpen(false)
  }

  // Manejar cambio en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setIsOpen(true)
    
    // Si se borra el input, limpiar selección
    if (!e.target.value.trim()) {
      setSelectedCourse(null)
      onChange('')
    }
  }

  // Manejar focus en el input
  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true)
    }
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
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
        }`}
      />

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading && (
            <div className="px-3 py-2 text-gray-500 text-sm">Buscando cursos...</div>
          )}

          {!isLoading && debouncedQuery && results.length === 0 && (
            <div className="px-3 py-2 text-gray-500 text-sm">No se encontraron cursos</div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="py-1">
              {results.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  className={`w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                    selectedCourse?.id === course.id ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => handleSelectCourse(course)}
                >
                  <div className="font-medium text-gray-900">{course.title}</div>
                  <div className="text-sm text-gray-600">${course.price}</div>
                </button>
              ))}
            </div>
          )}

          {!isLoading && !debouncedQuery && (
            <div className="px-3 py-2 text-gray-500 text-sm">
              Escribe para buscar cursos...
            </div>
          )}
        </div>
      )}
    </div>
  )
}