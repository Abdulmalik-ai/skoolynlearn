import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import axios from "axios"
import { generatePaystackReference, koboFromNaira } from "@/lib/paystack"

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json()
    const { courseId } = body

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 })

    const isCurrentlyFree = course.isFree || (course.freeUntil && new Date(course.freeUntil) > new Date())

    if (isCurrentlyFree) {
      const enrollment = await prisma.enrollment.upsert({
        where: { courseId_studentId: { courseId, studentId: user.id } },
        update: { isPaid: true, amountPaid: 0 },
        create: { courseId, studentId: user.id, isPaid: true, amountPaid: 0 },
      })
      return NextResponse.json({ success: true, data: enrollment, isFree: true })
    }

    const paystackSecretSetting = await prisma.settings.findUnique({ where: { key: "paystack_secret_key" } })
    const paystackSecret = paystackSecretSetting?.value || process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecret) {
      return NextResponse.json({ success: false, message: "Payment gateway not configured" }, { status: 500 })
    }

    const reference = generatePaystackReference()
    const amount = koboFromNaira(course.price)

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount,
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/student/payments/verify`,
        metadata: { courseId, userId: user.id },
      },
      { headers: { Authorization: `Bearer ${paystackSecret}`, "Content-Type": "application/json" } }
    )

    if (response.data?.status) {
      await prisma.payment.create({
        data: {
          reference,
          amount: Number(course.price),
          status: "PENDING",
          metadata: JSON.stringify({ courseId, userId: user.id }),
        },
      })
    }

    return NextResponse.json({ success: true, data: response.data?.data })
  } catch (e: any) {
    console.error(e?.response?.data || e?.message)
    return NextResponse.json({ success: false, message: e?.response?.data?.message || "Payment initialization failed" }, { status: 500 })
  }
}
