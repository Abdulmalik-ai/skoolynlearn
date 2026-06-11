import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const admin = await requireRole(["ADMIN"])
  if (admin instanceof NextResponse) return admin

  try {
    const announcements = await prisma.announcement.findMany({
      include: { createdBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ success: true, data: announcements })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load announcements" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireRole(["ADMIN"])
  if (admin instanceof NextResponse) return admin

  try {
    const body = await req.json()
    const { title, body: content, target } = body
    if (!title || !content) return NextResponse.json({ success: false, message: "Title and body required" }, { status: 400 })

    const announcement = await prisma.announcement.create({
      data: { title, body: content, target: target || "ALL", createdById: admin.id },
    })

    // Create notifications for all matching users
    const users = await prisma.user.findMany({
      where: target && target !== "ALL" ? { role: target as string } : undefined,
      select: { id: true },
    })

    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title: "New Announcement",
        body: title,
        type: "announcement",
        data: JSON.stringify({ announcementId: announcement.id }),
      })),
    })

    return NextResponse.json({ success: true, data: announcement })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create announcement" }, { status: 500 })
  }
}
