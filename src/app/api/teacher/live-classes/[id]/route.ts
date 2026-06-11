import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req)
    const liveClass = await prisma.liveClass.findUnique({
      where: { id: params.id },
      include: {
        teacher: { include: { user: { select: { name: true, avatar: true } } } },
        course: { select: { title: true } },
        chatMessages: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "asc" }, take: 100 },
      },
    })

    if (!liveClass) {
      return NextResponse.json({ success: false, message: "Live class not found" }, { status: 404 })
    }

    const enrollments = await prisma.enrollment.count({ where: { courseId: liveClass.courseId } })

    return NextResponse.json({ success: true, data: { ...liveClass, enrollments } })
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ success: false, message: error.message }, { status: 401 })
    return NextResponse.json({ success: false, message: "Failed to load live class" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req)
    const { content, type } = await req.json()

    if (!content) return NextResponse.json({ success: false, message: "Content required" }, { status: 400 })

    const message = await prisma.chatMessage.create({
      data: { content, type: type || "text", liveClassId: params.id, userId: user.id },
      include: { user: { select: { name: true } } },
    })

    return NextResponse.json({ success: true, data: message })
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ success: false, message: error.message }, { status: 401 })
    return NextResponse.json({ success: false, message: "Failed to send message" }, { status: 500 })
  }
}
