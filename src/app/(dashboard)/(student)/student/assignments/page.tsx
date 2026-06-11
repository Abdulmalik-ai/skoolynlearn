"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { FileText, Clock } from "lucide-react"

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  maxScore: number
  course: { title: string }
  submission: { status: string; score: number | null } | null
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/student/assignments")
      .then((r) => r.json())
      .then((res) => { if (res.success) setAssignments(res.data) })
      .catch(() => toast.error("Failed to load assignments"))
      .finally(() => setLoading(false))
  }, [])

  const statusBadge = (submission: Assignment["submission"]) => {
    if (!submission) return <Badge variant="outline">Not submitted</Badge>
    if (submission.status === "graded") return <Badge className="bg-emerald-100 text-emerald-700">Graded: {submission.score}</Badge>
    if (submission.status === "submitted") return <Badge className="bg-blue-100 text-blue-700">Submitted</Badge>
    return <Badge variant="outline">{submission.status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
        <p className="text-slate-500">Your course assignments and submissions.</p>
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
                    <p className="text-sm text-slate-500">{a.course.title}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Due {new Date(a.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(a.submission)}
                  <Button size="sm" variant="outline">Submit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {assignments.length === 0 && <p className="text-center text-slate-500 py-8">No assignments at the moment.</p>}
        </div>
      )}
    </div>
  )
}
