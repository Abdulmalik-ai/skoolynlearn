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

    const classes = await prisma.liveClass.findMany({
      where: { courseId: { in: courseIds } },
      include: { course: { select: { title: true } }, teacher: { include: { user: { select: { name: true } } } } },
      orderBy: { scheduledAt: "desc" },
    })
    return NextResponse.json({ success: true, data: classes })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load live classes" }, { status: 500 })
  }
}
