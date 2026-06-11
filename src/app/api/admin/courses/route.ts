import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { z } from "zod"

const courseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string(),
  price: z.number().optional(),
  isFree: z.boolean(),
  freeUntil: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  teacherId: z.string().uuid(),
})

export async function GET(req: NextRequest) {
  const admin = await requireRole(["ADMIN", "TEACHER"])
  if (admin instanceof NextResponse) return admin

  try {
    const courses = await prisma.course.findMany({
      include: { teacher: { include: { user: { select: { name: true } } } }, _count: { select: { enrollments: true, modules: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ success: true, data: courses })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load courses" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireRole(["ADMIN"])
  if (admin instanceof NextResponse) return admin

  try {
    const body = await req.json()
    const data = courseSchema.parse(body)

    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.isFree ? 0 : data.price || 0,
        isFree: data.isFree,
        freeUntil: data.freeUntil ? new Date(data.freeUntil) : null,
        duration: body.duration || null,
        thumbnail: data.thumbnail || null,
        teacherId: data.teacherId,
        isPublished: true,
      },
    })

    return NextResponse.json({ success: true, data: course }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 })
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to create course" }, { status: 500 })
  }
}
