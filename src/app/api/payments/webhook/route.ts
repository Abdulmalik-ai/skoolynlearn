import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-paystack-signature")

    const paystackSecretSetting = await prisma.settings.findUnique({ where: { key: "paystack_secret_key" } })
    const paystackSecret = paystackSecretSetting?.value || process.env.PAYSTACK_SECRET_KEY

    if (paystackSecret && signature) {
      const hash = crypto.createHmac("sha512", paystackSecret).update(body).digest("hex")
      if (hash !== signature) {
        return NextResponse.json({ success: false }, { status: 400 })
      }
    }

    const event = JSON.parse(body)
    if (event?.data?.reference) {
      await prisma.payment.updateMany({
        where: { reference: event.data.reference },
        data: { status: event.data.status === "success" ? "SUCCESS" : "FAILED", paystackData: JSON.stringify(event.data), paidAt: event.data.status === "success" ? new Date() : undefined },
      })

      if (event.data.status === "success" && event.data.metadata?.courseId) {
        await prisma.enrollment.upsert({
          where: { courseId_studentId: { courseId: event.data.metadata.courseId, studentId: event.data.metadata.userId } },
          update: { isPaid: true, amountPaid: event.data.amount / 100 },
          create: { courseId: event.data.metadata.courseId, studentId: event.data.metadata.userId, isPaid: true, amountPaid: event.data.amount / 100 },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
