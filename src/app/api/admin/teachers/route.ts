import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { sendTeacherApprovalEmail, sendTeacherRejectionEmail } from "@/lib/email"
import { revalidatePath } from "next/cache"

// GET: List all teacher applications
export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN", req)

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || undefined
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 20
    const skip = (page - 1) * limit

    const where = status ? { status: status as any } : {}

    const [teachers, total] = await Promise.all([
      prisma.teacherProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatar: true, createdAt: true },
          },
          courses: { select: { id: true }, take: 1 },
        },
      }),
      prisma.teacherProfile.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: teachers,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message?.includes("Forbidden")) {
      return NextResponse.json({ success: false, message: error.message }, { status: 403 })
    }
    console.error("Admin teachers error:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch teachers" }, { status: 500 })
  }
}

// PATCH: Approve or reject teacher
export async function PATCH(req: NextRequest) {
  try {
    await requireRole("ADMIN", req)
    const { teacherId, status, rejectionReason } = await req.json()

    if (!teacherId || !status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 })
    }

    const teacher = await prisma.teacherProfile.update({
      where: { id: teacherId },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason || null : null,
      },
      include: { user: true },
    })

    // Send email notification
    if (status === "APPROVED") {
      await sendTeacherApprovalEmail(teacher.user.email, teacher.user.name).catch(console.error)
    } else {
      await sendTeacherRejectionEmail(
        teacher.user.email,
        teacher.user.name,
        rejectionReason || ""
      ).catch(console.error)
    }

    // Create admin action log
    await prisma.adminAction.create({
      data: {
        adminId: req.headers.get("x-user-id") || "",
        action: status === "APPROVED" ? "approve_teacher" : "reject_teacher",
        targetId: teacherId,
        details: JSON.stringify({ reason: rejectionReason }),
      },
    })

    revalidatePath("/admin/teachers")

    return NextResponse.json({
      success: true,
      message: `Teacher ${status.toLowerCase()} successfully`,
      data: teacher,
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message?.includes("Forbidden")) {
      return NextResponse.json({ success: false, message: error.message }, { status: 403 })
    }
    console.error("Admin teacher update error:", error)
    return NextResponse.json({ success: false, message: "Failed to update teacher" }, { status: 500 })
  }
}
