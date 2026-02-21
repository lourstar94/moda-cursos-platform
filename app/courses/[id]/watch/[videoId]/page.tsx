// app/courses/[id]/watch/[videoId]/page.tsx - CORREGIDO
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import VideoPlayer from '@/components/VideoPlayer';
import VideoSidebar from '@/components/VideoSidebar';

// ✅ CORRECCIÓN: params como Promise
export default async function VideoWatchPage({ 
  params 
}: { 
  params: Promise<{ id: string; videoId: string }>  // ← AQUÍ ESTÁ EL CAMBIO
}) {
  // ✅ CORRECCIÓN: await params antes de usarlo
  const { id: courseId, videoId } = await params;  // ← Y AQUÍ
  
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  try {
    // Verificar acceso al curso y obtener el video actual y la lista de videos
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
    
    const currentVideo = videos.find((v: { id: string }) => v.id === videoId);

    if (!currentVideo) {
      // Si el video no existe, redirigir al primer video
      redirect(`/courses/${courseId}/watch`);
    }

    const currentIndex = videos.findIndex((v: { id: string }) => v.id === videoId);
    const nextVideo = currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null;
    const prevVideo = currentIndex > 0 ? videos[currentIndex - 1] : null;

    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="flex flex-col lg:flex-row">
          {/* Reproductor de Video - Ocupa la mayor parte en pantallas grandes */}
          <div className="lg:w-3/4">
            <VideoPlayer 
              video={currentVideo}
              nextVideo={nextVideo}
              prevVideo={prevVideo}
              courseId={courseId}
              userId={userId}
            />
          </div>
          
          {/* Sidebar con lista de videos - Ocupa 1/4 en pantallas grandes */}
          <div className="lg:w-1/4 border-l border-gray-700">
            <VideoSidebar
              courseId={courseId}
              videos={videos}
              currentVideoId={currentVideo.id}
              userId={userId}
            />
          </div>
        </div>
      </div>
    );

  } catch (error) {
    console.error('Error loading video:', error);
    redirect('/');
  }
}