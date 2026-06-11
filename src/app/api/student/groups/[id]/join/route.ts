import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req)
    const groupId = params.id

    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: user.id } },
    })

    if (existing) {
      return NextResponse.json({ success: false, message: "Already a member" }, { status: 400 })
    }

    const member = await prisma.groupMember.create({
      data: { groupId, userId: user.id, role: "member" },
    })

    return NextResponse.json({ success: true, data: member })
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ success: false, message: error.message }, { status: 401 })
    return NextResponse.json({ success: false, message: "Failed to join group" }, { status: 500 })
  }
}
