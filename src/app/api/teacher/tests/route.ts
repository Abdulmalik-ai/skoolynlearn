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

    const tests = await prisma.test.findMany({
      where: { course: { teacherId: profile.id } },
      include: { course: { select: { title: true } }, _count: { select: { questions: true, results: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ success: true, data: tests.map((t) => ({ ...t, questions: t._count.questions, results: t._count.results })) })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load tests" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["TEACHER", "ADMIN"])
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json()
    const { title, description, timeLimit, maxScore, courseId, questions } = body

    const test = await prisma.test.create({
      data: {
        title,
        description: description || null,
        timeLimit: Number(timeLimit) || 30,
        maxScore: Number(maxScore) || 100,
        courseId,
        questions: {
          create: questions?.map((q: any, index: number) => ({
            text: q.text,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            optionE: q.optionE,
            correctAnswer: q.correctAnswer,
            points: Number(q.points) || 1,
            order: index,
          })) || [],
        },
      },
    })
    return NextResponse.json({ success: true, data: test })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Failed to create test" }, { status: 500 })
  }
}
