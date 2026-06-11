import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const user = await requireAuth()
  if (user instanceof NextResponse) return user

  try {
    const payments = await prisma.payment.findMany({
      where: { metadata: { contains: user.id } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ success: true, data: payments })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load payments" }, { status: 500 })
  }
}
