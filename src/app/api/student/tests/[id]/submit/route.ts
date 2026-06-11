import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth()
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json()
    const { answers, timeTaken } = body
    const testId = params.id

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true },
    })
    if (!test) return NextResponse.json({ success: false, message: "Test not found" }, { status: 404 })

    let score = 0
    let maxScore = 0
    test.questions.forEach((q) => {
      maxScore += q.points
      if (answers[q.id] === q.correctAnswer) score += q.points
    })

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

    const result = await prisma.testResult.upsert({
      where: { testId_studentId: { testId, studentId: user.id } },
      update: { answers: JSON.stringify(answers), score, percentage, timeTaken: timeTaken || 0 },
      create: { testId, studentId: user.id, answers: JSON.stringify(answers), score, percentage, timeTaken: timeTaken || 0 },
    })

    return NextResponse.json({ success: true, data: { score, percentage, maxScore, result } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Failed to submit test" }, { status: 500 })
  }
}
