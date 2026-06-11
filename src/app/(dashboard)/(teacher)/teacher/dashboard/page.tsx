"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { BookOpen, Users, Video, ClipboardList, ArrowRight } from "lucide-react"

interface TeacherDashboardData {
  courses: { id: string; title: string; enrollments: number; _count: { modules: number } }[]
  liveClasses: { id: string; title: string; scheduledAt: string; status: string }[]
  assignments: { id: string; title: string; dueDate: string; submissions: number }[]
  tests: { id: string; title: string; results: number }[]
  students: { id: string; name: string; email: string }[]
}

export default function TeacherDashboardPage() {
  const [data, setData] = useState<TeacherDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/teacher/profile")
      .then((r) => r.json())
      .then((res) => { if (res.success) setData(res.data) })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: "My Courses", value: data?.courses.length, icon: BookOpen, color: "text-blue-600 bg-blue-50", href: "/teacher/courses" },
    { label: "Live Classes", value: data?.liveClasses.length, icon: Video, color: "text-purple-600 bg-purple-50", href: "/teacher/classes" },
    { label: "Assignments", value: data?.assignments.length, icon: ClipboardList, color: "text-orange-600 bg-orange-50", href: "/teacher/assignments" },
    { label: "Students", value: data?.students.length, icon: Users, color: "text-emerald-600 bg-emerald-50", href: "/teacher/students" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Teacher Dashboard</h1>
        <p className="text-slate-500">Manage your courses, classes, and students.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{stat.value ?? 0}</div>}
              <Link href={stat.href} className="text-xs text-primary flex items-center gap-1 mt-2 hover:underline">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Live Classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />) : (
              data?.liveClasses.length ? data.liveClasses.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{c.title}</p>
                    <p className="text-xs text-slate-500">{new Date(c.scheduledAt).toLocaleString()}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">{c.status}</span>
                </div>
              )) : <p className="text-sm text-slate-500">No upcoming classes.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />) : (
              data?.students.length ? data.students.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{s.name.charAt(0)}</div>
                    <p className="text-sm font-medium">{s.name}</p>
                  </div>
                  <p className="text-xs text-slate-500">{s.email}</p>
                </div>
              )) : <p className="text-sm text-slate-500">No students yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
