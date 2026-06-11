import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createToken, setAuthCookie } from "@/lib/auth"
import { verifyCodeSchema } from "@/lib/validations"
import { ZodError } from "zod"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = verifyCodeSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { teacherProfile: true, studentProfile: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    if (user.isVerified) {
      return NextResponse.json(
        { success: false, message: "Account already verified. Please login." },
        { status: 400 }
      )
    }

    if (user.confirmationCode !== data.code) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code" },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        confirmationCode: null,
        lastLoginAt: new Date(),
      },
      include: { teacherProfile: true, studentProfile: true },
    })

    const token = await createToken({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role as "STUDENT" | "TEACHER" | "ADMIN",
      avatar: updatedUser.avatar,
      isVerified: updatedUser.isVerified,
    })

    await setAuthCookie(token)

    // Determine redirect based on role and status
    let redirect = "/student/courses"
    if (updatedUser.role === "ADMIN") redirect = "/admin/dashboard"
    if (updatedUser.role === "TEACHER") {
      redirect =
        updatedUser.teacherProfile?.status === "APPROVED"
          ? "/teacher/courses"
          : "/teacher/apply"
    }

    return NextResponse.json({
      success: true,
      message: "Account verified successfully",
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role as "STUDENT" | "TEACHER" | "ADMIN",
          avatar: updatedUser.avatar,
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
    console.error("Verify code error:", error)
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    )
  }
}
