"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ArrowLeft, BookOpen, Play, Video, FileText, Image, CheckCircle, Lock } from "lucide-react"

interface Lesson {
  id: string
  title: string
  type: string
  url: string
  filePath: string | null
  duration: number | null
}

interface Module {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

interface CourseDetail {
  id: string
  title: string
  description: string
  category: string
  price: number
  isFree: boolean
  rating: number
  totalReviews: number
  thumbnail: string | null
  teacher: { user: { name: string } }
  modules: Module[]
  enrollments: number
  isEnrolled?: boolean
}

export default function StudentCourseDetailPage() {
  const { id } = useParams() as { id: string }
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/student/courses?id=${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCourse(res.data)
      })
      .catch(() => toast.error("Failed to load course"))
      .finally(() => setLoading(false))
  }, [id])

  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: id }),
      })
      const data = await res.json()
      if (!data.success) { toast.error(data.message); return }
      if (data.isFree) {
        toast.success("Enrolled successfully!")
        setCourse((prev) => prev ? { ...prev, isEnrolled: true } : prev)
      } else if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url
      }
    } catch { toast.error("Enrollment failed") }
    finally { setEnrolling(false) }
  }

  const getLessonIcon = (type: string) => {
    if (type === "VIDEO") return <Video className="w-4 h-4 text-blue-500" />
    if (type === "PDF") return <FileText className="w-4 h-4 text-red-500" />
    return <Image className="w-4 h-4 text-green-500" />
  }

  if (loading) return <Skeleton className="h-96 w-full" />
  if (!course) return <p className="text-center py-12 text-slate-500">Course not found.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild><Link href="/student/courses"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <h1 className="text-2xl font-bold">{course.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {activeVideo ? (
            <div className="rounded-xl overflow-hidden bg-black aspect-video">
              <video src={activeVideo} controls className="w-full h-full" />
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-video flex items-center justify-center">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-16 h-16 text-slate-300" />
              )}
            </div>
          )}

          <p className="text-slate-600 dark:text-slate-300">{course.description}</p>

          <div className="flex items-center gap-3">
            <Badge>{course.category}</Badge>
            <div className="flex items-center gap-1 text-sm">⭐ {course.rating} ({course.totalReviews})</div>
            <div className="flex items-center gap-1 text-sm">{course.enrollments} students</div>
          </div>

          <div className="space-y-4">
            {course.modules.length === 0 ? <p className="text-slate-500">No modules yet.</p> : (
              course.modules.map((mod) => (
                <Card key={mod.id}>
                  <CardHeader>
                    <CardTitle className="text-base">Module {mod.order}: {mod.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {mod.lessons.length === 0 ? <p className="text-sm text-slate-500">No lessons</p> : (
                      mod.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          {getLessonIcon(lesson.type)}
                          <span className="text-sm flex-1">{lesson.title}</span>
                          {lesson.type === "VIDEO" && lesson.url && (
                            <Button size="sm" variant="outline" onClick={() => setActiveVideo(lesson.url)}>
                              <Play className="w-3 h-3 mr-1" /> Watch
                            </Button>
                          )}
                          {lesson.type !== "VIDEO" && lesson.url && (
                            <Button size="sm" variant="outline" asChild><Link href={lesson.url} target="_blank">Open</Link></Button>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardContent className="p-6 space-y-4">
              <div className="text-3xl font-bold">{course.isFree ? "Free" : `₦${course.price.toLocaleString()}`}</div>
              <p className="text-sm text-slate-500">Instructor: {course.teacher.user.name}</p>
              {course.isEnrolled ? (
                <Button className="w-full" disabled><CheckCircle className="w-4 h-4 mr-2" /> Enrolled</Button>
              ) : (
                <Button className="w-full" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? "Processing..." : course.isFree ? "Enroll Free" : "Enroll Now"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
