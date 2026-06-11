import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)

    const [enrollments, upcomingClasses, pendingAssignments, recentTests] = await Promise.all([
      prisma.enrollment.findMany({
        where: { studentId: user.id },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
              teacher: { select: { user: { select: { name: true } } } },
            },
          },
        },
        orderBy: { enrolledAt: "desc" },
        take: 5,
      }),
      prisma.liveClass.findMany({
        where: { scheduledAt: { gte: new Date() }, status: { in: ["SCHEDULED", "LIVE"] } },
        include: { course: { select: { title: true } } },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      }),
      prisma.assignment.findMany({
        where: { dueDate: { gte: new Date() }, course: { enrollments: { some: { studentId: user.id } } } },
        include: { course: { select: { title: true } } },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      prisma.testResult.findMany({
        where: { studentId: user.id },
        include: { test: { select: { title: true } } },
        orderBy: { completedAt: "desc" },
        take: 5,
      }),
    ])

    return NextResponse.json({
      success: true,
      data: { enrollments, upcomingClasses, pendingAssignments, recentTests },
    })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: error.message }, { status: 401 })
    }
    console.error("Student dashboard error:", error)
    return NextResponse.json({ success: false, message: "Failed to load dashboard" }, { status: 500 })
  }
}
