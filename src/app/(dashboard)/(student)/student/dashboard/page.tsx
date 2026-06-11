"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, Clock, FileText, ClipboardCheck, Video, ArrowRight } from "lucide-react"
import { toast } from "sonner"

interface DashboardData {
  enrollments: {
    id: string
    progress: number
    course: { id: string; title: string; thumbnail: string | null; teacher: { user: { name: string } } }
  }[]
  upcomingClasses: { id: string; title: string; scheduledAt: string; course: { title: string } }[]
  pendingAssignments: { id: string; title: string; dueDate: string; course: { title: string } }[]
  recentTests: { id: string; test: { title: string }; score: number; percentage: number }[]
}

export default function StudentDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/student/dashboard")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data)
      })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-slate-500">Welcome back! Here is your learning overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "My Courses", value: data?.enrollments.length, icon: BookOpen, color: "text-blue-600 bg-blue-50" },
          { label: "Upcoming Classes", value: data?.upcomingClasses.length, icon: Video, color: "text-purple-600 bg-purple-50" },
          { label: "Assignments Due", value: data?.pendingAssignments.length, icon: FileText, color: "text-orange-600 bg-orange-50" },
          { label: "Tests Taken", value: data?.recentTests.length, icon: ClipboardCheck, color: "text-emerald-600 bg-emerald-50" },
        ].map((stat, i) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Continue Learning</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/student/courses">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : data?.enrollments.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No enrolled courses yet.</p>
                <Button className="mt-3" size="sm" asChild>
                  <Link href="/student/courses">Browse Courses</Link>
                </Button>
              </div>
            ) : (
              data?.enrollments.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{e.course.title}</p>
                    <p className="text-xs text-slate-500">{e.course.teacher.user.name}</p>
                    <Progress value={Number(e.progress)} className="h-1.5 mt-1.5" />
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/student/courses/${e.course.id}`}>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Live Classes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/student/classes">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : data?.upcomingClasses.length === 0 ? (
              <div className="text-center py-8">
                <Video className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No upcoming classes scheduled.</p>
              </div>
            ) : (
              data?.upcomingClasses.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{c.title}</p>
                    <p className="text-xs text-slate-500">{c.course.title}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(c.scheduledAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
