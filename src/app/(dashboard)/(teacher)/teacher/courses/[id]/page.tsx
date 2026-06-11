"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ArrowLeft, BookOpen, Video, Plus } from "lucide-react"

interface CourseDetail {
  id: string
  title: string
  description: string
  category: string
  price: number
  isFree: boolean
  isPublished: boolean
  modules: { id: string; title: string; order: number; lessons: { id: string; title: string; type: string; duration: number | null }[] }[]
}

export default function TeacherCourseDetailPage() {
  const { id } = useParams() as { id: string }
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/teacher/courses/${id}`)
      .then((r) => r.json())
      .then((res) => { if (res.success) setCourse(res.data) })
      .catch(() => toast.error("Failed to load course"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Skeleton className="h-96 w-full" />
  if (!course) return <p className="text-center py-12 text-slate-500">Course not found.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild><Link href="/teacher/courses"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <h1 className="text-2xl font-bold">{course.title}</h1>
      </div>
      <p className="text-slate-500">{course.description}</p>

      <div className="flex gap-2">
        <Button asChild><Link href={`/teacher/courses/${id}/modules/new`}><Plus className="w-4 h-4 mr-2" /> Module</Link></Button>
        <Button variant="outline" asChild><Link href={`/teacher/courses/${id}/lessons/new`}><Video className="w-4 h-4 mr-2" /> Lesson</Link></Button>
      </div>

      <div className="space-y-4">
        {course.modules.map((m) => (
          <Card key={m.id}>
            <CardHeader>
              <CardTitle className="text-base">{m.order}. {m.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {m.lessons.length === 0 ? <p className="text-sm text-slate-500">No lessons yet.</p> : (
                m.lessons.map((l) => (
                  <div key={l.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{l.title}</span>
                    <span className="text-xs text-slate-400 ml-auto">{l.type} {l.duration ? `(${l.duration}s)` : ""}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
