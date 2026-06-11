import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createToken, setAuthCookie } from "@/lib/auth"

interface GoogleUserData {
  email: string
  name: string
  picture?: string
  sub: string
}

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json()

    if (!credential) {
      return NextResponse.json(
        { success: false, message: "Google credential required" },
        { status: 400 }
      )
    }

    // Decode Google ID token (simplified; in production verify with Google API)
    const base64Url = credential.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    const googleUser: GoogleUserData = JSON.parse(jsonPayload)

    let user = await prisma.user.findUnique({
      where: { googleId: googleUser.sub },
      include: { teacherProfile: true },
    })

    if (!user) {
      // Check if email exists
      const existingByEmail = await prisma.user.findUnique({
        where: { email: googleUser.email },
        include: { teacherProfile: true },
      })

      if (existingByEmail) {
        // Link Google account
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { googleId: googleUser.sub, avatar: googleUser.picture || existingByEmail.avatar },
          include: { teacherProfile: true },
        })
      } else {
        user = await prisma.user.create({
          data: {
            email: googleUser.email,
            name: googleUser.name,
            googleId: googleUser.sub,
            avatar: googleUser.picture || null,
            role: "STUDENT",
            isVerified: true,
          },
          include: { teacherProfile: true },
        })

        await prisma.studentProfile.create({
          data: { userId: user.id },
        })
      }
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { success: false, message: "Account suspended" },
        { status: 403 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "STUDENT" | "TEACHER" | "ADMIN",
      avatar: user.avatar,
      isVerified: user.isVerified,
    })

    await setAuthCookie(token)

    let redirect = "/student/courses"
    if (user.role === "ADMIN") redirect = "/admin/dashboard"
    if (user.role === "TEACHER") {
      redirect =
        user.teacherProfile?.status === "APPROVED" ? "/teacher/courses" : "/teacher/apply"
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as "STUDENT" | "TEACHER" | "ADMIN",
          avatar: user.avatar,
        },
        redirect,
      },
    })
  } catch (error) {
    console.error("Google auth error:", error)
    return NextResponse.json(
      { success: false, message: "Google authentication failed" },
      { status: 500 }
    )
  }
}
