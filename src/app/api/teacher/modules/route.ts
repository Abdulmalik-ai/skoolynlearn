import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { z } from "zod"

export const dynamic = "force-dynamic"

const moduleSchema = z.object({
  title: z.string().min(2),
  order: z.number().optional().default(0),
  courseId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["TEACHER", "ADMIN"])
    if (user instanceof NextResponse) return user

    const body = await req.json()
    const data = moduleSchema.parse(body)

    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
      include: { teacher: true },
    })

    if (!course) return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 })
    if (course.teacher?.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Not authorized for this course" }, { status: 403 })
    }

    const module = await prisma.module.create({
      data: {
        title: data.title,
        order: data.order,
        courseId: data.courseId,
      },
    })

    return NextResponse.json({ success: true, data: module }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, message: "Invalid input", error: error.flatten() }, { status: 400 })
    if (error.message === "Unauthorized") return NextResponse.json({ success: false, message: error.message }, { status: 401 })
    console.error("Module create error:", error)
    return NextResponse.json({ success: false, message: "Failed to create module" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const user = await requireRole(["TEACHER", "ADMIN"])
  if (user instanceof NextResponse) return user

  try {
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("courseId")
    if (!courseId) return NextResponse.json({ success: false, message: "courseId required" }, { status: 400 })

    const modules = await prisma.module.findMany({
      where: { courseId },
      include: { lessons: { orderBy: { createdAt: "asc" } } },
      orderBy: { order: "asc" },
    })

    return NextResponse.json({ success: true, data: modules })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load modules" }, { status: 500 })
  }
}
