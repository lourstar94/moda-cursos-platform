'use client';

import VideoForm from "@/components/VideoForm";
import { createVideo } from "@/app/actions/videos";
import { VideoInput } from "@/lib/validations";

export default function VideoFormClientWrapper({ courseId }: { courseId: string }) {
  const handleSubmit = async (data: VideoInput) => {
    try {
      await createVideo(courseId, data);
      alert('Video creado correctamente');
    } catch (error) {
      alert('Error al crear el video');
    }
  };

  return (
    <VideoForm
      courseId={courseId}
      onCancel={() => window.history.back()}
      onSuccess={() => console.log("Video creado exitosamente")}
      onSubmit={handleSubmit} // ← obligatorio
    />
  );
}
