import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const user = await requireAuth()
  if (user instanceof NextResponse) return user

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: user.id },
      select: { courseId: true },
    })
    const courseIds = enrollments.map((e) => e.courseId)

    const tests = await prisma.test.findMany({
      where: id ? { id, courseId: { in: courseIds } } : { courseId: { in: courseIds } },
      include: { course: { select: { title: true } }, results: { where: { studentId: user.id } }, questions: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: tests.map((t) => ({
        ...t,
        result: t.results[0] || null,
        results: undefined,
      })),
    })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load tests" }, { status: 500 })
  }
}
