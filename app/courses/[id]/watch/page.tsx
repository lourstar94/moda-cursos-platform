// app/courses/[id]/watch/page.tsx - CORREGIDO
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

// ✅ CORRECCIÓN: params como Promise
export default async function CourseWatchPage({ 
  params 
}: { 
  params: Promise<{ id: string }>  // ← CAMBIO PRINCIPAL
}) {
  // ✅ CORRECCIÓN: await params antes de usarlo
  const { id: courseId } = await params;  // ← AQUÍ TAMBIÉN

  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  try {
    // Verificar acceso al curso y obtener la lista de videos
    const courseAccess = await prisma.userCourseAccess.findFirst({
      where: {
        userId,
        courseId,
        isActive: true,
      },
      include: {
        course: {
          include: {
            videos: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    if (!courseAccess || !courseAccess.course) {
      redirect('/');
    }

    const { course } = courseAccess;
    const videos = course.videos;

    if (videos.length === 0) {
      // No hay videos, redirigir a la página del curso
      redirect(`/courses/${courseId}`);
    }

    // Redirigir al primer video
    const firstVideo = videos[0];
    redirect(`/courses/${courseId}/watch/${firstVideo.id}`);

  } catch (error) {
    console.error('Error loading course videos:', error);
    redirect('/');
  }
}