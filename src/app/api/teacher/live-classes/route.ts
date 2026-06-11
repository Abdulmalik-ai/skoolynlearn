import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const user = await requireRole(["TEACHER", "ADMIN"])
  if (user instanceof NextResponse) return user

  try {
    const profile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } })
    if (!profile) return NextResponse.json({ success: false, message: "Not a teacher" }, { status: 403 })

    const classes = await prisma.liveClass.findMany({
      where: { teacherId: profile.id },
      include: { course: { select: { title: true } } },
      orderBy: { scheduledAt: "desc" },
    })
    return NextResponse.json({ success: true, data: classes })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load live classes" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["TEACHER", "ADMIN"])
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json()
    const { title, description, scheduledAt, duration, courseId, meetingUrl } = body

    const profile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } })
    if (!profile) return NextResponse.json({ success: false, message: "Not a teacher" }, { status: 403 })

    const liveClass = await prisma.liveClass.create({
      data: {
        title,
        description: description || null,
        scheduledAt: new Date(scheduledAt),
        duration: Number(duration) || 60,
        courseId,
        teacherId: profile.id,
        meetingUrl: meetingUrl || `https://meet.jit.si/skoolyn-${Date.now()}`,
      },
    })
    return NextResponse.json({ success: true, data: liveClass })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Failed to create live class" }, { status: 500 })
  }
}
