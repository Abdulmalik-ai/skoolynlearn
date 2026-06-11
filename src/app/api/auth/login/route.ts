import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { comparePassword, createToken, setAuthCookie } from "@/lib/auth"
import { loginSchema } from "@/lib/validations"
import { ZodError } from "zod"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { teacherProfile: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { success: false, message: "Account suspended. Contact support." },
        { status: 403 }
      )
    }

    if (user.googleId && !user.password) {
      return NextResponse.json(
        { success: false, message: "Please use Google to sign in." },
        { status: 400 }
      )
    }

    const valid = await comparePassword(data.password, user.password || "")
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { success: false, message: "Please verify your email first. Check your inbox." },
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
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", error: error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    )
  }
}
