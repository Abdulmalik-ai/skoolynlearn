import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const user = await requireRole(["TEACHER", "ADMIN"])
  if (user instanceof NextResponse) return user

  try {
    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
    })
    if (!profile) return NextResponse.json({ success: false, message: "Teacher profile not found" }, { status: 404 })

    const courses = await prisma.course.findMany({
      where: { teacherId: profile.id },
      include: {
        _count: { select: { modules: true, enrollments: true } },
        modules: { include: { lessons: { select: { id: true } } } },
      },
    })

    const liveClasses = await prisma.liveClass.findMany({
      where: { teacherId: profile.id },
      orderBy: { scheduledAt: "desc" },
      select: { id: true, title: true, scheduledAt: true, status: true, duration: true },
    })

    const assignments = await prisma.assignment.findMany({
      where: { course: { teacherId: profile.id } },
      include: { course: { select: { title: true } }, _count: { select: { submissions: true } } },
      orderBy: { createdAt: "desc" },
    })

    const tests = await prisma.test.findMany({
      where: { course: { teacherId: profile.id } },
      include: { course: { select: { title: true } }, _count: { select: { questions: true, results: true } } },
      orderBy: { createdAt: "desc" },
    })

    const enrollments = await prisma.enrollment.findMany({
      where: { course: { teacherId: profile.id } },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { enrolledAt: "desc" },
    })

    const students = enrollments.map((e) => e.student).filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i)

    return NextResponse.json({
      success: true,
      data: {
        courses: courses.map((c) => ({ id: c.id, title: c.title, enrollments: c._count.enrollments, modules: c._count.modules })),
        liveClasses,
        assignments: assignments.map((a) => ({ ...a, submissions: a._count.submissions })),
        tests: tests.map((t) => ({ ...t, questions: t._count.questions, results: t._count.results })),
        students,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Failed to load teacher profile" }, { status: 500 })
  }
}
