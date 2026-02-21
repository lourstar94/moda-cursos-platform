// types/search.ts
export interface SearchResult<T> {
  data: T[]
  total: number
  page: number
  hasMore: boolean
}

export interface UserSearchItem {
  id: string
  name: string | null
  email: string
}

export interface CourseSearchItem {
  id: string
  title: string
  price: number
}

export interface SearchParams {
  query: string
  page?: number
  limit?: number
}
