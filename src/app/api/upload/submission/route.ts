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
    const assignmentId = formData.get("assignmentId") as string | null
    const textContent = formData.get("textContent") as string | null

    let fileUrl = null
    let filePath = null
    if (file && file.size > 0) {
      const result = await saveUploadFile(file, "submissions")
      fileUrl = result.url
      filePath = result.filePath
    }

    const submission = await prisma.submission.create({
      data: {
        assignmentId: assignmentId || "",
        studentId: user.id,
        fileUrl,
        filePath,
        textContent: textContent || null,
      },
    })

    return NextResponse.json({ success: true, data: submission })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 })
  }
}
