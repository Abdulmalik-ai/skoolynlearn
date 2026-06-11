import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["STUDENT", "TEACHER"]),
  phone: z.string().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
})

export const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
})

export const teacherApplicationSchema = z.object({
  bio: z.string().min(10),
  subjects: z.string().min(2),
  education: z.string().optional(),
  yearsExperience: z.number().min(0).optional(),
  resumeUrl: z.string().optional(),
})

export const courseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  price: z.number().min(0).optional(),
  isFree: z.boolean(),
  freeUntil: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
})

export const lessonSchema = z.object({
  title: z.string().min(2),
  type: z.enum(["VIDEO", "PDF", "IMAGE"]),
  url: z.string().optional().nullable(),
  filePath: z.string().optional().nullable(),
  duration: z.number().optional(),
  moduleId: z.string().uuid(),
})

export const moduleSchema = z.object({
  title: z.string().min(2),
  order: z.number().optional(),
  courseId: z.string().uuid(),
})
