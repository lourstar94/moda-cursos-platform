// hooks/useSearch.ts
import { useState, useEffect } from 'react'
import { useDebounce } from './useDebounce'

interface UseSearchOptions<T> {
  searchFunction: (query: string, page?: number) => Promise<{
    data: T[]
    total: number
    page: number
    hasMore: boolean
  }>
  debounceDelay?: number
}

export function useSearch<T>({ 
  searchFunction, 
  debounceDelay = 300 
}: UseSearchOptions<T>) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  const debouncedQuery = useDebounce(query, debounceDelay)

  useEffect(() => {
    setPage(1)
    setResults([])
  }, [debouncedQuery])

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([])
        setHasMore(false)
        setTotal(0)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await searchFunction(debouncedQuery, page)
        setResults(prev => page === 1 ? response.data : [...prev, ...response.data])
        setHasMore(response.hasMore)
        setTotal(response.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error en la búsqueda')
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery, page, searchFunction])

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1)
    }
  }

  const reset = () => {
    setQuery('')
    setResults([])
    setPage(1)
    setHasMore(false)
    setTotal(0)
    setError(null)
  }

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    hasMore,
    total,
    loadMore,
    reset
  }
}