import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { saveUploadFile } from "@/lib/upload"

export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    const formData = await req.formData()

    const name = formData.get("name") as string | null
    const phone = formData.get("phone") as string | null
    const avatarFile = formData.get("avatar") as File | null

    let avatarUrl = null
    if (avatarFile && avatarFile.size > 0) {
      const result = await saveUploadFile(avatarFile, "avatars")
      avatarUrl = result.url
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        ...(avatarUrl ? { avatar: avatarUrl } : {}),
      },
    })

    return NextResponse.json({ success: true, data: { name: updated.name, phone: updated.phone, avatar: updated.avatar } })
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ success: false, message: error.message }, { status: 401 })
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 })
  }
}
