import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

export const dynamic = "force-dynamic"

const groupSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  courseId: z.string().optional(),
  courseName: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("courseId")

    const where: any = {}
    if (courseId) where.courseId = courseId

    const groups = await prisma.group.findMany({
      where,
      include: {
        members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        posts: { take: 1, orderBy: { createdAt: "desc" } },
        _count: { select: { members: true, posts: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, data: groups })
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ success: false, message: error.message }, { status: 401 })
    return NextResponse.json({ success: false, message: "Failed to load groups" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    const body = await req.json()
    const data = groupSchema.parse(body)

    const group = await prisma.group.create({
      data: {
        name: data.name,
        description: data.description || null,
        courseId: data.courseId || null,
        courseName: data.courseName || null,
      },
    })

    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: user.id,
        role: "admin",
      },
    })

    return NextResponse.json({ success: true, data: group }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 })
    if (error.message === "Unauthorized") return NextResponse.json({ success: false, message: error.message }, { status: 401 })
    return NextResponse.json({ success: false, message: "Failed to create group" }, { status: 500 })
  }
}
