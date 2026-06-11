import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword, generateCode, createToken, setAuthCookie } from "@/lib/auth"
import { sendConfirmationEmail } from "@/lib/email"
import { saveUploadFile } from "@/lib/upload"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["STUDENT", "TEACHER"]),
  phone: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as "STUDENT" | "TEACHER"
    const phone = formData.get("phone") as string | null

    const data = registerSchema.parse({ name, email, password, role, phone })

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json({ success: false, message: "Email already registered. Please login." }, { status: 409 })
    }

    const hashedPassword = await hashPassword(data.password)
    const code = generateCode()

    let avatarUrl = null
    const avatarFile = formData.get("avatar") as File | null
    if (avatarFile && avatarFile.size > 0) {
      const result = await saveUploadFile(avatarFile, "avatars")
      avatarUrl = result.url
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone || null,
        role: data.role,
        avatar: avatarUrl,
        confirmationCode: code,
        isVerified: false,
      },
    })

    if (data.role === "TEACHER") {
      await prisma.teacherProfile.create({
        data: { userId: user.id, status: "PENDING", bio: null, subjects: "", resumeUrl: null },
      })
    } else {
      await prisma.studentProfile.create({
        data: { userId: user.id },
      })
    }

    await sendConfirmationEmail(data.email, data.name, code).catch((err) => {
      console.error("Failed to send confirmation email:", err)
    })

    return NextResponse.json({
      success: true,
      message: "Registration successful. Check your email for verification code.",
      data: { email: user.email, requiresVerification: true },
    }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Invalid input", error: error.flatten().fieldErrors }, { status: 400 })
    }
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again." }, { status: 500 })
  }
}
