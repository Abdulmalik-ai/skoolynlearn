import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireRole(["ADMIN", "TEACHER"])
  if (admin instanceof NextResponse) return admin

  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        teacher: { include: { user: { select: { name: true } } } },
        modules: { include: { lessons: { orderBy: { createdAt: "asc" } } }, orderBy: { order: "asc" } },
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
  const admin = await requireRole(["ADMIN"])
  if (admin instanceof NextResponse) return admin

  try {
    const body = await req.json()
    const { title, description, category, price, isFree, freeUntil, thumbnail, isPublished, duration, teacherId } = body

    const updated = await prisma.course.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(price !== undefined && { price: Number(price) }),
        ...(isFree !== undefined && { isFree }),
        ...(freeUntil !== undefined && { freeUntil: freeUntil ? new Date(freeUntil) : null }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(isPublished !== undefined && { isPublished }),
        ...(duration !== undefined && { duration: duration ? Number(duration) : null }),
        ...(teacherId !== undefined && { teacherId }),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Failed to update course" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireRole(["ADMIN"])
  if (admin instanceof NextResponse) return admin

  try {
    await prisma.course.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true, message: "Course deleted" })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete course" }, { status: 500 })
  }
}
