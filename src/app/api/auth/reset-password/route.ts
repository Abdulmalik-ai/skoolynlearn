import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { resetPasswordSchema } from "@/lib/validations"
import { ZodError } from "zod"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, password } = resetPasswordSchema.parse(body)

    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 })
    const userId = payload.userId as string

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 400 }
      )
    }

    const hashed = await hashPassword(password)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    })

    return NextResponse.json({
      success: true,
      message: "Password reset successful. Please login with your new password.",
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", error: error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    console.error("Reset password error:", error)
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 400 }
    )
  }
}
