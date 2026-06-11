"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Video, Plus, Calendar } from "lucide-react"

interface LiveClass {
  id: string
  title: string
  description: string | null
  scheduledAt: string
  duration: number
  status: string
  meetingUrl: string
  course: { title: string }
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/teacher/live-classes")
      .then((r) => r.json())
      .then((res) => { if (res.success) setClasses(res.data) })
      .catch(() => toast.error("Failed to load live classes"))
      .finally(() => setLoading(false))
  }, [])

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: "bg-blue-100 text-blue-700",
      LIVE: "bg-red-100 text-red-700",
      ENDED: "bg-slate-100 text-slate-700",
      CANCELLED: "bg-amber-100 text-amber-700",
    }
    return <Badge className={colors[status] || ""}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Classes</h1>
          <p className="text-slate-500">Manage your scheduled and ongoing live classes.</p>
        </div>
        <Button asChild><Link href="/teacher/classes/new"><Plus className="w-4 h-4 mr-2" /> New Class</Link></Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="grid gap-3">
          {classes.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-sm text-slate-500">{c.course.title} · {c.duration} mins</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(c.scheduledAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(c.status)}
                  <Button size="sm" variant="outline" asChild><Link href={`/teacher/classes/${c.id}`}>Join</Link></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {classes.length === 0 && <p className="text-center text-slate-500 py-8">No live classes scheduled yet.</p>}
        </div>
      )}
    </div>
  )
}
