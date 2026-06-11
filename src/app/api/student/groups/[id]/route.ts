import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req)
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        posts: {
          include: { author: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!group) return NextResponse.json({ success: false, message: "Group not found" }, { status: 404 })

    const isMember = group.members.some((m: any) => m.userId === user.id)
    return NextResponse.json({ success: true, data: { ...group, isMember } })
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ success: false, message: error.message }, { status: 401 })
    return NextResponse.json({ success: false, message: "Failed to load group" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req)
    const { content } = await req.json()

    const post = await prisma.groupPost.create({
      data: {
        groupId: params.id,
        authorId: user.id,
        content,
      },
    })

    return NextResponse.json({ success: true, data: post }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ success: false, message: error.message }, { status: 401 })
    return NextResponse.json({ success: false, message: "Failed to post" }, { status: 500 })
  }
}
