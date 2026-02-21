// app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { courseSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = courseSchema.parse(body)

    const course = await prisma.course.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        image: validatedData.image || null
      }
    })

    return NextResponse.json(course, { status: 201 })

  } catch (error) {
    console.error('Error creando curso:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}