// app/api/admin/courses/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    // Construir condiciones de búsqueda
    const where = {
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive' as const
          }
        },
        {
          description: {
            contains: query,
            mode: 'insensitive' as const
          }
        }
      ]
    }

    // Obtener cursos y total
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        select: {
          id: true,
          title: true,
          price: true
        },
        orderBy: {
          title: 'asc'
        },
        skip,
        take: limit
      }),
      prisma.course.count({ where })
    ])

    const hasMore = skip + courses.length < total

    return NextResponse.json({
      data: courses,
      total,
      page,
      hasMore
    })

  } catch (error) {
    console.error('Error searching courses:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}