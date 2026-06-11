"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ClipboardList, Clock } from "lucide-react"

interface TestItem {
  id: string
  title: string
  description: string | null
  timeLimit: number
  maxScore: number
  course: { title: string }
  result: { score: number; percentage: number } | null
}

export default function StudentTestsPage() {
  const [tests, setTests] = useState<TestItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/student/tests")
      .then((r) => r.json())
      .then((res) => { if (res.success) setTests(res.data) })
      .catch(() => toast.error("Failed to load tests"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tests</h1>
        <p className="text-slate-500">Course tests and your results.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="grid gap-3">
          {tests.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-sm text-slate-500">{t.course.title} · {t.timeLimit} mins</p>
                    <p className="text-xs text-slate-400">Max score: {t.maxScore}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {t.result ? (
                    <Badge className="bg-emerald-100 text-emerald-700">{t.result.score}/{t.maxScore} ({t.result.percentage}%)</Badge>
                  ) : (
                    <Badge variant="outline">Not taken</Badge>
                  )}
                  <Button size="sm" asChild><Link href={`/student/tests/${t.id}`}>{t.result ? "Retake" : "Start"}</Link></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {tests.length === 0 && <p className="text-center text-slate-500 py-8">No tests available.</p>}
        </div>
      )}
    </div>
  )
}
