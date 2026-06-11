import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { saveUploadFile } from "@/lib/upload"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  if (user instanceof NextResponse) return user

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ success: false, message: "No file" }, { status: 400 })

    const result = await saveUploadFile(file, "resumes")

    await prisma.teacherProfile.updateMany({
      where: { userId: user.id },
      data: { resumeUrl: result.url, resumeFile: result.filePath },
    })

    return NextResponse.json({ success: true, data: { url: result.url, filePath: result.filePath } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 })
  }
}
