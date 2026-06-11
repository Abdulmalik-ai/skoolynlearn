import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { teacherApplicationSchema } from "@/lib/validations"
import { ZodError } from "zod"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)

    if (user.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "Only teachers can apply" }, { status: 403 })
    }

    const formData = await req.formData()
    const body: Record<string, any> = {}
    formData.forEach((value, key) => {
      if (key === "subjects") {
        body[key] = value.toString().split(",").map((s) => s.trim())
      } else {
        body[key] = value.toString()
      }
    })

    const resumeFile = formData.get("resume") as File | null
    let resumeUrl = body.resumeUrl || null

    if (resumeFile && resumeFile.size > 0) {
      const bytes = await resumeFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const { uploadToCloudinary } = await import("@/lib/cloudinary")
      const result = await uploadToCloudinary(buffer, "resumes", { resourceType: "raw" })
      resumeUrl = result.url
    }

    const data = teacherApplicationSchema.parse({
      bio: body.bio,
      subjects: body.subjects,
      yearsExperience: Number(body.yearsExperience),
      education: body.education,
    })

    const profile = await prisma.teacherProfile.update({
      where: { userId: user.id },
      data: {
        bio: data.bio,
        subjects: Array.isArray(data.subjects) ? data.subjects.join(", ") : data.subjects,
        yearsExperience: data.yearsExperience,
        education: data.education || null,
        status: "PENDING",
        resumeUrl: resumeUrl,
      },
    })

    return NextResponse.json({ success: true, message: "Application submitted", data: profile })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, message: "Invalid input", error: error.flatten() }, { status: 400 })
    }
    console.error("Apply error:", error)
    return NextResponse.json({ success: false, message: "Failed to submit application" }, { status: 500 })
  }
}
