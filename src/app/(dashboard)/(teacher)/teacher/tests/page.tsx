"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ClipboardList, Plus } from "lucide-react"

interface TestItem {
  id: string
  title: string
  description: string | null
  timeLimit: number
  maxScore: number
  course: { title: string }
  questions: number
  results: number
}

export default function TeacherTestsPage() {
  const [tests, setTests] = useState<TestItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/teacher/tests")
      .then((r) => r.json())
      .then((res) => { if (res.success) setTests(res.data) })
      .catch(() => toast.error("Failed to load tests"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tests</h1>
          <p className="text-slate-500">Create and manage tests with auto-scoring.</p>
        </div>
        <Button asChild><Link href="/teacher/tests/new"><Plus className="w-4 h-4 mr-2" /> New Test</Link></Button>
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
                    <p className="text-sm text-slate-500">{t.course.title} · {t.timeLimit} mins · {t.questions} questions</p>
                    <p className="text-xs text-slate-400">Max score: {t.maxScore} · {t.results} results</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">View</Button>
              </CardContent>
            </Card>
          ))}
          {tests.length === 0 && <p className="text-center text-slate-500 py-8">No tests created yet.</p>}
        </div>
      )}
    </div>
  )
}
