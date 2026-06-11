export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 12
    const skip = (page - 1) * limit
    const category = searchParams.get("category")
    const isFree = searchParams.get("isFree")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "createdAt"

    if (id) {
      const course = await prisma.course.findUnique({
        where: { id, isPublished: true },
        include: {
          teacher: { include: { user: { select: { name: true } } } },
          modules: { include: { lessons: { select: { id: true, title: true, type: true, duration: true } } }, orderBy: { order: "asc" } },
          _count: { select: { enrollments: true } },
        },
      })
      if (!course) return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 })
      return NextResponse.json({ success: true, data: course })
    }

    const where: any = { isPublished: true }

    if (category) where.category = category
    if (isFree !== null && isFree !== "") where.isFree = isFree === "true"
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortBy === "rating" ? { rating: "desc" } : { createdAt: "desc" },
        include: {
          teacher: {
            include: { user: { select: { name: true, avatar: true } } },
          },
          _count: { select: { enrollments: true, reviews: true } },
          reviews: { select: { rating: true }, take: 100 },
          ...(user ? { enrollments: { where: { studentId: user.id }, select: { id: true } } } : {}),
        },
      }),
      prisma.course.count({ where }),
    ])

    const mapped = courses.map((c: any) => ({
      ...c,
      isEnrolled: user ? (c.enrollments?.length > 0) : false,
      enrollments: undefined,
    }))

    return NextResponse.json({
      success: true,
      data: mapped,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Student courses error:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch courses" }, { status: 500 })
  }
}
