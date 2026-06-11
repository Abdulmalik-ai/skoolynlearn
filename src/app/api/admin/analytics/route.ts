import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN", req)

    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalCourses,
      totalEnrollments,
      totalPayments,
      totalRevenueAgg,
      activeClasses,
      pendingTeachers,
      completionAgg,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.payment.count({ where: { status: "SUCCESS" } }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
      }),
      prisma.liveClass.count({ where: { status: "LIVE" } }),
      prisma.teacherProfile.count({ where: { status: "PENDING" } }),
      prisma.enrollment.count({
        where: { completedAt: { not: null } },
      }),
    ])

    const completionRate =
      totalEnrollments > 0 ? Math.round((completionAgg / totalEnrollments) * 100) : 0

    // Recent signups (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentSignups = await prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } })

    // Monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
    const payments = await prisma.payment.findMany({
      where: { status: "SUCCESS", createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, createdAt: true },
    })

    const monthlyRevenue: Record<string, number> = {}
    payments.forEach((p) => {
      const key = p.createdAt.toISOString().slice(0, 7) // YYYY-MM
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + Number(p.amount)
    })

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalCourses,
        totalEnrollments,
        totalPayments,
        totalRevenue: Number(totalRevenueAgg._sum.amount || 0),
        activeClasses,
        pendingTeachers,
        completionRate,
        recentSignups,
        monthlyRevenue,
      },
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message?.includes("Forbidden")) {
      return NextResponse.json({ success: false, message: error.message }, { status: 403 })
    }
    console.error("Admin analytics error:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch analytics" }, { status: 500 })
  }
}
