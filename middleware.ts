// middleware.ts - VERSIÓN CORREGIDA
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Redireccionar a login si no está autenticado
    if (!req.nextauth.token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', req.url)
      return NextResponse.redirect(loginUrl)
    }

    // Redireccionar si no tiene permisos de admin
    if (req.nextUrl.pathname.startsWith('/admin') && req.nextauth.token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Rutas que requieren autenticación
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN'
        }
        
        // Solo proteger rutas específicas de cursos, no el catálogo público
        if (req.nextUrl.pathname.startsWith('/courses/watch')) {
          return !!token
        }
        
        return true // Permitir acceso a otras rutas
      }
    }
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/courses/watch/:path*',
    '/profile/:path*'
  ]
}