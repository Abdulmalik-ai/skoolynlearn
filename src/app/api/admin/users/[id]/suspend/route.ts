import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireRole(["ADMIN"])
  if (admin instanceof NextResponse) return admin

  try {
    const user = await prisma.user.findUnique({ where: { id: params.id } })
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { isSuspended: !user.isSuspended },
    })

    return NextResponse.json({ success: true, data: { isSuspended: updated.isSuspended } })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update user" }, { status: 500 })
  }
}
