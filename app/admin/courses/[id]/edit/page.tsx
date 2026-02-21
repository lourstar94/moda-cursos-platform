import EditCourseClient from './EditCourseClient';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

// ✅ CORREGIDO: params como Promise
interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

// Función que obtiene el curso directamente con "params" pasado correctamente
async function fetchCourse(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: { videos: true, accessList: true },
  });
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  // ✅ CORREGIDO: await params antes de usarlo
  const { id } = await params;
  const course = await fetchCourse(id);

  if (!course) return notFound();

  return <EditCourseClient course={course} />;
}