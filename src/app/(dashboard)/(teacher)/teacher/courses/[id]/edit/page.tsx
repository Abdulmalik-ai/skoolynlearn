"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

interface CourseDetail {
  id: string
  title: string
  description: string
  category: string
  price: number
  isFree: boolean
  freeUntil: string | null
  isPublished: boolean
  duration: number | null
  thumbnail: string | null
}

export default function EditCoursePage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/teacher/courses/${id}`)
      .then((r) => r.json())
      .then((res) => { if (res.success) setCourse(res.data) })
      .catch(() => toast.error("Failed to load course"))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!course) return
    setSaving(true)
    try {
      const res = await fetch(`/api/teacher/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(course),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Course updated")
        router.push("/teacher/courses")
      } else toast.error(data.message || "Failed")
    } catch { toast.error("Failed to update") }
    finally { setSaving(false) }
  }

  if (loading) return <Skeleton className="h-96 w-full" />
  if (!course) return <p className="text-center py-12 text-slate-500">Course not found.</p>

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild><Link href="/teacher/courses"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <h1 className="text-2xl font-bold">Edit Course</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Title" value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} required />
            <Textarea placeholder="Description" rows={3} value={course.description} onChange={(e) => setCourse({ ...course, description: e.target.value })} />
            <Input placeholder="Category" value={course.category} onChange={(e) => setCourse({ ...course, category: e.target.value })} />
            <div className="flex items-center gap-3">
              <Switch checked={course.isFree} onCheckedChange={(v) => setCourse({ ...course, isFree: v, price: v ? 0 : course.price })} />
              <Label>Free Course</Label>
            </div>
            {!course.isFree && (
              <>
                <Input type="number" placeholder="Price (NGN)" value={course.price} onChange={(e) => setCourse({ ...course, price: Number(e.target.value) })} />
                <div className="space-y-1">
                  <Label>Free Until (optional)</Label>
                  <Input type="date" value={course.freeUntil ? new Date(course.freeUntil).toISOString().split("T")[0] : ""} onChange={(e) => setCourse({ ...course, freeUntil: e.target.value || null })} />
                </div>
              </>
            )}
            <Input type="number" placeholder="Duration (hours)" value={course.duration || ""} onChange={(e) => setCourse({ ...course, duration: Number(e.target.value) || null })} />
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
