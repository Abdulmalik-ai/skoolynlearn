import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isVerified: true,
        teacherProfile: { select: { status: true } },
      },
    })

    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role as "STUDENT" | "TEACHER" | "ADMIN",
        avatar: dbUser.avatar,
        isVerified: dbUser.isVerified,
        teacherStatus: dbUser.teacherProfile?.status,
      },
    })
  } catch (error) {
    console.error("Auth me error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
