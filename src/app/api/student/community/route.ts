import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

const COMMUNITY_GROUP_NAME = "Platform Community"

async function getOrCreateCommunityGroup() {
  let group = await prisma.group.findFirst({ where: { name: COMMUNITY_GROUP_NAME } })
  if (!group) {
    group = await prisma.group.create({
      data: { name: COMMUNITY_GROUP_NAME, description: "Global community for all users", isPublic: true },
    })
  }
  return group
}

export async function GET(req: NextRequest) {
  const user = await requireAuth()
  if (user instanceof NextResponse) return user

  try {
    const group = await getOrCreateCommunityGroup()
    const posts = await prisma.groupPost.findMany({
      where: { groupId: group.id },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return NextResponse.json({ success: true, data: posts })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Failed to load posts" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json()
    const { content } = body
    if (!content) return NextResponse.json({ success: false, message: "Content required" }, { status: 400 })

    const group = await getOrCreateCommunityGroup()
    const post = await prisma.groupPost.create({
      data: { content, authorId: user.id, groupId: group.id },
    })
    return NextResponse.json({ success: true, data: post })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Failed to create post" }, { status: 500 })
  }
}
