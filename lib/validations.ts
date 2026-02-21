// lib/validations.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});
export const courseSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  price: z.number().min(0, "El precio no puede ser negativo"),
  image: z.string().url("URL inválida").optional().or(z.literal("")),
});

export const videoSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  url: z.string().url("URL inválida").refine((url) => {
    // Validar que sea una URL de YouTube
    return url.includes('youtube.com') || url.includes('youtu.be');
  }, "Debe ser una URL de YouTube"),
  duration: z.number().min(1, "La duración debe ser al menos 1 minuto"),
  order: z.number().min(0, "El orden no puede ser negativo"),
});

export type VideoInput = z.infer<typeof videoSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CourseInput = z.infer<typeof courseSchema>;