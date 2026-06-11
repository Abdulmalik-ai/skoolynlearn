import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import axios from "axios"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get("reference")
    if (!reference) return NextResponse.json({ success: false, message: "No reference" }, { status: 400 })

    const paystackSecretSetting = await prisma.settings.findUnique({ where: { key: "paystack_secret_key" } })
    const paystackSecret = paystackSecretSetting?.value || process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecret) {
      return NextResponse.json({ success: false, message: "Payment gateway not configured" }, { status: 500 })
    }

    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${paystackSecret}` },
    })

    const data = response.data?.data
    if (!data || !data.status) {
      return NextResponse.json({ success: false, message: "Verification failed" }, { status: 400 })
    }

    await prisma.payment.updateMany({
      where: { reference },
      data: { status: data.status === "success" ? "SUCCESS" : "FAILED", paystackData: JSON.stringify(data), paidAt: data.status === "success" ? new Date() : undefined },
    })

    if (data.status === "success" && data.metadata?.courseId) {
      await prisma.enrollment.upsert({
        where: { courseId_studentId: { courseId: data.metadata.courseId, studentId: data.metadata.userId } },
        update: { isPaid: true, amountPaid: data.amount / 100 },
        create: { courseId: data.metadata.courseId, studentId: data.metadata.userId, isPaid: true, amountPaid: data.amount / 100 },
      })
    }

    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    console.error(e?.response?.data || e?.message)
    return NextResponse.json({ success: false, message: e?.response?.data?.message || "Verification failed" }, { status: 500 })
  }
}
