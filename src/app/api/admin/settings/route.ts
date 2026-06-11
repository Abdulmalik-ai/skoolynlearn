import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const admin = await requireRole(["ADMIN"])
  if (admin instanceof NextResponse) return admin

  try {
    const settings = await prisma.settings.findMany()
    const map: Record<string, string> = {}
    settings.forEach((s) => { map[s.key] = s.value })
    return NextResponse.json({ success: true, data: map })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load settings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireRole(["ADMIN"])
  if (admin instanceof NextResponse) return admin

  try {
    const body = await req.json()
    const keys = Object.keys(body)
    for (const key of keys) {
      await prisma.settings.upsert({
        where: { key },
        update: { value: String(body[key]), updatedAt: new Date() },
        create: { key, value: String(body[key]), description: key },
      })
    }
    const settings = await prisma.settings.findMany()
    const map: Record<string, string> = {}
    settings.forEach((s) => { map[s.key] = s.value })
    return NextResponse.json({ success: true, data: map })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to save settings" }, { status: 500 })
  }
}
