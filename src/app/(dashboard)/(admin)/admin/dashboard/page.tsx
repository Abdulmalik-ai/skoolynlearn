"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, BookOpen, CreditCard, Activity, TrendingUp, UserCheck, Clock } from "lucide-react"

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

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: "Total Users", value: data?.totalUsers, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Students", value: data?.totalStudents, icon: UserCheck, color: "text-emerald-600 bg-emerald-50" },
    { label: "Teachers", value: data?.totalTeachers, icon: TrendingUp, color: "text-orange-600 bg-orange-50" },
    { label: "Courses", value: data?.totalCourses, icon: BookOpen, color: "text-purple-600 bg-purple-50" },
    { label: "Enrollments", value: data?.totalEnrollments, icon: Activity, color: "text-cyan-600 bg-cyan-50" },
    { label: "Revenue", value: data ? `₦${data.totalRevenue.toLocaleString()}` : undefined, icon: CreditCard, color: "text-green-600 bg-green-50" },
    { label: "Active Classes", value: data?.activeClasses, icon: Clock, color: "text-red-600 bg-red-50" },
    { label: "Pending Teachers", value: data?.pendingTeachers, icon: Users, color: "text-yellow-600 bg-yellow-50" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500">Overview of platform activity and metrics.</p>
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
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stat.value ?? 0}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : data?.monthlyRevenue && Object.keys(data.monthlyRevenue).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(data.monthlyRevenue)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([month, amount]) => (
                    <div key={month} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{month}</span>
                      <div className="flex items-center gap-4 flex-1 mx-4">
                        <div className="h-2 bg-primary rounded-full" style={{ width: `${Math.min((amount / (data.totalRevenue || 1)) * 500, 100)}%` }} />
                      </div>
                      <span className="text-sm font-semibold">₦{amount.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No revenue data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-40 w-40 rounded-full mx-auto" />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="8"
                      strokeDasharray={`${(data?.completionRate || 0) * 2.51} 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{data?.completionRate}%</span>
                  </div>
                </div>
                <p className="text-sm text-slate-500">Of enrolled students complete courses</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
