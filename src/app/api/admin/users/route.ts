import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const admin = await requireRole(["ADMIN"])
  if (admin instanceof NextResponse) return admin

  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        isSuspended: true,
        createdAt: true,
        updatedAt: true,
        avatar: true,
        phone: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ success: true, data: users })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load users" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const admin = await requireRole(["ADMIN"])
  if (admin instanceof NextResponse) return admin

  try {
    const body = await req.json()
    const { id, name, email, role, isSuspended } = body

    if (!id) return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 })

    const updated = await prisma.user.update({
      where: { id },
      data: { ...(name && { name }), ...(email && { email }), ...(role && { role }), ...(typeof isSuspended !== "undefined" && { isSuspended }) },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await requireRole(["ADMIN"])
  if (admin instanceof NextResponse) return admin

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 })

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true, message: "User deleted" })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete user" }, { status: 500 })
  }
}
