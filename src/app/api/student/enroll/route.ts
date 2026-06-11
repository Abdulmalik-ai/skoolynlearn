import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json()
    const { courseId } = body

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 })

    const existing = await prisma.enrollment.findUnique({
      where: { courseId_studentId: { courseId, studentId: user.id } },
    })
    if (existing) return NextResponse.json({ success: false, message: "Already enrolled" }, { status: 400 })

    if (course.isFree) {
      const enrollment = await prisma.enrollment.create({
        data: { courseId, studentId: user.id, isPaid: true, amountPaid: 0 },
      })
      return NextResponse.json({ success: true, data: enrollment })
    }

    return NextResponse.json({ success: false, message: "Payment required", requiresPayment: true, amount: course.price })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Failed to enroll" }, { status: 500 })
  }
}
