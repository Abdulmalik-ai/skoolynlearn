import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const admin = await requireRole(["ADMIN"])
  if (admin instanceof NextResponse) return admin

  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    })
    return NextResponse.json({ success: true, data: payments })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load payments" }, { status: 500 })
  }
}
