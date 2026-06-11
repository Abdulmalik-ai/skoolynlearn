import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { z } from "zod"

export const dynamic = "force-dynamic"

const lessonSchema = z.object({
  title: z.string().min(2),
  type: z.enum(["VIDEO", "PDF", "IMAGE"]),
  url: z.string().optional().nullable(),
  filePath: z.string().optional().nullable(),
  duration: z.number().optional().nullable(),
  moduleId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["TEACHER", "ADMIN"])
    if (user instanceof NextResponse) return user

    const body = await req.json()
    const data = lessonSchema.parse(body)

    const module = await prisma.module.findUnique({
      where: { id: data.moduleId },
      include: { course: { include: { teacher: true } } },
    })

    if (!module) return NextResponse.json({ success: false, message: "Module not found" }, { status: 404 })
    if (module.course.teacher?.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Not authorized for this course" }, { status: 403 })
    }

    const lesson = await prisma.lesson.create({
      data: {
        title: data.title,
        type: data.type,
        url: data.url || "",
        filePath: data.filePath || null,
        duration: data.duration || null,
        moduleId: data.moduleId,
      },
    })

    return NextResponse.json({ success: true, data: lesson }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, message: "Invalid input", error: error.flatten() }, { status: 400 })
    if (error.message === "Unauthorized") return NextResponse.json({ success: false, message: error.message }, { status: 401 })
    console.error("Lesson create error:", error)
    return NextResponse.json({ success: false, message: "Failed to create lesson" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const user = await requireRole(["TEACHER", "ADMIN"])
  if (user instanceof NextResponse) return user

  try {
    const { searchParams } = new URL(req.url)
    const moduleId = searchParams.get("moduleId")
    if (!moduleId) return NextResponse.json({ success: false, message: "moduleId required" }, { status: 400 })

    const lessons = await prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ success: true, data: lessons })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load lessons" }, { status: 500 })
  }
}
