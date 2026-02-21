// app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { courseSchema } from '@/lib/validations'

// Obtener un curso específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params // ✅ Esperar params aquí

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const course = await prisma.course.findUnique({
      where: {
        id: id // ✅ Usar el id desestructurado
      },
      include: {
        videos: {
          select: {
            id: true
          }
        },
        accessList: {
          where: {
            isActive: true
          },
          select: {
            id: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(course)

  } catch (error) {
    console.error('Error obteniendo curso:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Actualizar un curso
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params // ✅ Esperar params aquí

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = courseSchema.parse(body)

    // Verificar que el curso existe
    const existingCourse = await prisma.course.findUnique({
      where: { id: id } // ✅ Usar el id desestructurado
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      )
    }

    const course = await prisma.course.update({
      where: {
        id: id // ✅ Usar el id desestructurado
      },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        image: validatedData.image || null
      }
    })

    return NextResponse.json(course)

  } catch (error) {
    console.error('Error actualizando curso:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Eliminar un curso
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params // ✅ Esperar params aquí

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que el curso existe
    const existingCourse = await prisma.course.findUnique({
      where: { id: id }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      )
    }

    await prisma.course.delete({
      where: {
        id: id // ✅ Usar el id desestructurado
      }
    })

    return NextResponse.json({ message: 'Curso eliminado correctamente' })

  } catch (error) {
    console.error('Error eliminando curso:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}