import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const user = await requireAuth()
  if (user instanceof NextResponse) return user

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: user.id },
      select: { courseId: true },
    })
    const courseIds = enrollments.map((e) => e.courseId)

    const assignments = await prisma.assignment.findMany({
      where: { courseId: { in: courseIds } },
      include: { course: { select: { title: true } }, submissions: { where: { studentId: user.id } } },
      orderBy: { dueDate: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: assignments.map((a) => ({
        ...a,
        submission: a.submissions[0] || null,
        submissions: undefined,
      })),
    })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load assignments" }, { status: 500 })
  }
}
