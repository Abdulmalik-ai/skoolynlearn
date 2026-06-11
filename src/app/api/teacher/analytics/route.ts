import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const user = await requireRole(["TEACHER", "ADMIN"])
  if (user instanceof NextResponse) return user

  try {
    const profile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } })
    if (!profile) return NextResponse.json({ success: false, message: "Not a teacher" }, { status: 403 })

    const totalCourses = await prisma.course.count({ where: { teacherId: profile.id } })
    const totalClasses = await prisma.liveClass.count({ where: { teacherId: profile.id } })
    const totalStudents = await prisma.enrollment.count({ where: { course: { teacherId: profile.id } } })
    const averageRating = 0
    const totalRevenue = 0

    const topCourse = await prisma.course.findFirst({
      where: { teacherId: profile.id },
      include: { _count: { select: { enrollments: true } } },
      orderBy: { enrollments: { _count: "desc" } },
    })

    return NextResponse.json({
      success: true,
      data: {
        totalCourses,
        totalClasses,
        totalStudents,
        averageRating,
        totalRevenue,
        topCourse: topCourse ? { title: topCourse.title, enrollments: topCourse._count.enrollments } : null,
      },
    })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load analytics" }, { status: 500 })
  }
}
