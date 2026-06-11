"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Users, BookOpen, CreditCard, TrendingUp, UserCheck } from "lucide-react"

interface AnalyticsData {
  totalUsers: number
  totalStudents: number
  totalTeachers: number
  totalCourses: number
  totalEnrollments: number
  totalPayments: number
  totalRevenue: number
  activeClasses: number
  pendingTeachers: number
  completionRate: number
  recentSignups: number
  monthlyRevenue: Record<string, number>
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((res) => { if (res.success) setData(res.data) })
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: "Total Users", value: data?.totalUsers, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Students", value: data?.totalStudents, icon: UserCheck, color: "text-emerald-600 bg-emerald-50" },
    { label: "Teachers", value: data?.totalTeachers, icon: TrendingUp, color: "text-orange-600 bg-orange-50" },
    { label: "Courses", value: data?.totalCourses, icon: BookOpen, color: "text-purple-600 bg-purple-50" },
    { label: "Enrollments", value: data?.totalEnrollments, icon: BarChart3, color: "text-cyan-600 bg-cyan-50" },
    { label: "Revenue", value: data ? `₦${data.totalRevenue.toLocaleString()}` : undefined, icon: CreditCard, color: "text-green-600 bg-green-50" },
  ]

  const revenueEntries = data ? Object.entries(data.monthlyRevenue).sort() : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-slate-500">Detailed platform metrics and trends.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : revenueEntries.length === 0 ? (
            <p className="text-slate-500">No revenue data yet.</p>
          ) : (
            <div className="space-y-2">
              {revenueEntries.map(([month, amount]) => (
                <div key={month} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="font-medium">{month}</span>
                  <span className="font-bold">₦{(amount / 100).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
