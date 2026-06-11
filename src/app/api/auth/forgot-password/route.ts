import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"
import { forgotPasswordSchema } from "@/lib/validations"
import { ZodError } from "zod"
import { SignJWT } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = forgotPasswordSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      // Don't reveal if email exists
      return NextResponse.json(
        { success: true, message: "If an account exists, a reset link has been sent." },
        { status: 200 }
      )
    }

    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(JWT_SECRET)

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

    await sendPasswordResetEmail(user.email, user.name, resetUrl).catch((err) => {
      console.error("Failed to send reset email:", err)
    })

    return NextResponse.json({
      success: true,
      message: "If an account exists, a reset link has been sent.",
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid email", error: error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    )
  }
}
