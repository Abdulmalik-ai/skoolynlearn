import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireRole(["TEACHER", "ADMIN"])
  if (user instanceof NextResponse) return user

  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        modules: { include: { lessons: true }, orderBy: { order: "asc" } },
        _count: { select: { enrollments: true } },
      },
    })
    if (!course) return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 })
    return NextResponse.json({ success: true, data: course })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load course" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireRole(["TEACHER", "ADMIN"])
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json()
    const { title, description, category, price, isFree, duration, thumbnail, isPublished } = body
    const course = await prisma.course.update({
      where: { id: params.id },
      data: { title, description, category, price, isFree, duration, thumbnail, isPublished },
    })
    return NextResponse.json({ success: true, data: course })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Failed to update course" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireRole(["TEACHER", "ADMIN"])
  if (user instanceof NextResponse) return user

  try {
    await prisma.course.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true, message: "Course deleted" })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete course" }, { status: 500 })
  }
}
