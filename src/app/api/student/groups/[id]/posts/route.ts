import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth()
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json()
    const { content } = body
    if (!content) return NextResponse.json({ success: false, message: "Content required" }, { status: 400 })

    const post = await prisma.groupPost.create({
      data: { content, authorId: user.id, groupId: params.id },
    })
    return NextResponse.json({ success: true, data: post })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create post" }, { status: 500 })
  }
}
