"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, Users, TrendingUp, Star } from "lucide-react"

interface AnalyticsData {
  totalCourses: number
  totalStudents: number
  totalClasses: number
  averageRating: number
  totalRevenue: number
  topCourse: { title: string; enrollments: number } | null
}

export default function TeacherAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/teacher/analytics")
      .then((r) => r.json())
      .then((res) => { if (res.success) setData(res.data) })
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: "Courses", value: data?.totalCourses, icon: BookOpen, color: "text-blue-600 bg-blue-50" },
    { label: "Students", value: data?.totalStudents, icon: Users, color: "text-emerald-600 bg-emerald-50" },
    { label: "Live Classes", value: data?.totalClasses, icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
    { label: "Avg Rating", value: data?.averageRating, icon: Star, color: "text-yellow-600 bg-yellow-50" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-slate-500">Performance overview of your teaching.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{stat.value ?? 0}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-32" /> : (
            <p className="text-3xl font-bold">₦{(data?.totalRevenue || 0).toLocaleString()}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Course</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-48" /> : (
            data?.topCourse ? (
              <div>
                <p className="text-xl font-bold">{data.topCourse.title}</p>
                <p className="text-sm text-slate-500">{data.topCourse.enrollments} enrollments</p>
              </div>
            ) : <p className="text-slate-500">No data yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
