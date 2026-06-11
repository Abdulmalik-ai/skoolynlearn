import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { saveUploadFile } from "@/lib/upload"

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB for videos

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  if (user instanceof NextResponse) return user

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const type = (formData.get("type") as string) || "VIDEO"

    if (!file) return NextResponse.json({ success: false, message: "No file" }, { status: 400 })
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ success: false, message: "File too large" }, { status: 400 })

    const result = await saveUploadFile(file, "lessons")
    return NextResponse.json({ success: true, data: { url: result.url, filePath: result.filePath, type, duration: 0 } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 })
  }
}
