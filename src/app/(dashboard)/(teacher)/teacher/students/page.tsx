"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Users } from "lucide-react"

interface Student {
  id: string
  name: string
  email: string
  progress: number
  courseTitle: string
  enrolledAt: string
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/teacher/students")
      .then((r) => r.json())
      .then((res) => { if (res.success) setStudents(res.data) })
      .catch(() => toast.error("Failed to load students"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-slate-500">Students enrolled in your courses.</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-medium">{students.length} total</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : (
        <div className="grid gap-3">
          {students.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-slate-500">{s.email} · {s.courseTitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{s.progress}%</p>
                  <p className="text-xs text-slate-400">Enrolled {new Date(s.enrolledAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          {students.length === 0 && <p className="text-center text-slate-500 py-8">No students enrolled yet.</p>}
        </div>
      )}
    </div>
  )
}
