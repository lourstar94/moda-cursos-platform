// app/actions/videos.ts - ARCHIVO NUEVO
'use server';

import { prisma } from '@/lib/db';
import { videoSchema, VideoInput } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function getVideosByCourse(courseId: string) {
  try {
    const videos = await prisma.video.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });
    return videos;
  } catch (error) {
    throw new Error('Error al obtener los videos');
  }
}

export async function createVideo(courseId: string, data: VideoInput) {
  try {
    const validatedData = videoSchema.parse(data);
    
    const video = await prisma.video.create({
      data: {
        ...validatedData,
        courseId,
      },
    });

    revalidatePath(`/admin/courses/${courseId}/videos`);
    return video;
  } catch (error) {
    throw new Error('Error al crear el video');
  }
}

export async function updateVideo(videoId: string, data: VideoInput) {
  try {
    const validatedData = videoSchema.parse(data);
    
    const video = await prisma.video.update({
      where: { id: videoId },
      data: validatedData,
    });

    revalidatePath(`/admin/courses/${video.courseId}/videos`);
    return video;
  } catch (error) {
    throw new Error('Error al actualizar el video');
  }
}

export async function deleteVideo(videoId: string) {
  try {
    const video = await prisma.video.delete({
      where: { id: videoId },
    });

    revalidatePath(`/admin/courses/${video.courseId}/videos`);
    return video;
  } catch (error) {
    throw new Error('Error al eliminar el video');
  }
}

export async function reorderVideos(courseId: string, orderedVideoIds: string[]) {
  try {
    // Actualizar el orden de cada video
    const updateOperations = orderedVideoIds.map((id, index) => 
      prisma.video.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updateOperations);
    revalidatePath(`/admin/courses/${courseId}/videos`);
  } catch (error) {
    throw new Error('Error al reordenar los videos');
  }
}