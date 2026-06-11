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

    const assignments = await prisma.assignment.findMany({
      where: { course: { teacherId: profile.id } },
      include: { course: { select: { title: true } }, _count: { select: { submissions: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ success: true, data: assignments.map((a) => ({ ...a, submissions: a._count.submissions })) })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load assignments" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["TEACHER", "ADMIN"])
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json()
    const { title, description, dueDate, maxScore, courseId } = body

    const assignment = await prisma.assignment.create({
      data: { title, description, dueDate: new Date(dueDate), maxScore: Number(maxScore) || 100, courseId },
    })
    return NextResponse.json({ success: true, data: assignment })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Failed to create assignment" }, { status: 500 })
  }
}
