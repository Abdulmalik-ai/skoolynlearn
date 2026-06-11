"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { FileText, Plus } from "lucide-react"

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  maxScore: number
  course: { title: string }
  submissions: number
}

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/teacher/assignments")
      .then((r) => r.json())
      .then((res) => { if (res.success) setAssignments(res.data) })
      .catch(() => toast.error("Failed to load assignments"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
          <p className="text-slate-500">Create and manage assignments for your courses.</p>
        </div>
        <Button asChild><Link href="/teacher/assignments/new"><Plus className="w-4 h-4 mr-2" /> New Assignment</Link></Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="grid gap-3">
          {assignments.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-slate-500">{a.course.title} · Due {new Date(a.dueDate).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-400">Max score: {a.maxScore} · {a.submissions} submissions</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">View</Button>
              </CardContent>
            </Card>
          ))}
          {assignments.length === 0 && <p className="text-center text-slate-500 py-8">No assignments created yet.</p>}
        </div>
      )}
    </div>
  )
}
