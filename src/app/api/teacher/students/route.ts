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

    const enrollments = await prisma.enrollment.findMany({
      where: { course: { teacherId: profile.id } },
      include: { student: { select: { id: true, name: true, email: true } }, course: { select: { title: true } } },
      orderBy: { enrolledAt: "desc" },
    })

    const students = enrollments.map((e) => ({
      id: e.student.id,
      name: e.student.name,
      email: e.student.email,
      progress: e.progress,
      courseTitle: e.course.title,
      enrolledAt: e.enrolledAt,
    }))

    return NextResponse.json({ success: true, data: students })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load students" }, { status: 500 })
  }
}
