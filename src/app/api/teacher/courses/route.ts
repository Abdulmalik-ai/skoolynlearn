import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { z } from "zod"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const user = await requireRole(["TEACHER", "ADMIN"])
  if (user instanceof NextResponse) return user

  try {
    const profile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } })
    if (!profile) return NextResponse.json({ success: false, message: "Not a teacher" }, { status: 403 })

    const courses = await prisma.course.findMany({
      where: { teacherId: profile.id },
      include: {
        _count: { select: { enrollments: true, modules: true } },
        modules: {
          include: { lessons: { orderBy: { createdAt: "asc" } } },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ success: true, data: courses })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load courses" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["TEACHER", "ADMIN"])
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json()

    const profile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } })
    if (!profile) return NextResponse.json({ success: false, message: "Not a teacher" }, { status: 403 })

    const course = await prisma.course.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        price: body.isFree ? 0 : body.price || 0,
        isFree: body.isFree,
        freeUntil: body.freeUntil ? new Date(body.freeUntil) : null,
        duration: body.duration || null,
        thumbnail: body.thumbnail || null,
        teacherId: profile.id,
        isPublished: false,
      },
    })

    return NextResponse.json({ success: true, data: course }, { status: 201 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to create course" }, { status: 500 })
  }
}
