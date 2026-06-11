import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get("unread") === "true"

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ success: true, data: notifications })
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ success: false, message: error.message }, { status: 401 })
    return NextResponse.json({ success: false, message: "Failed to load notifications" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    const { id } = await req.json()

    if (id) {
      await prisma.notification.update({ where: { id, userId: user.id }, data: { isRead: true } })
    } else {
      await prisma.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } })
    }

    return NextResponse.json({ success: true, message: "Marked as read" })
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ success: false, message: error.message }, { status: 401 })
    return NextResponse.json({ success: false, message: "Failed to update notification" }, { status: 500 })
  }
}
