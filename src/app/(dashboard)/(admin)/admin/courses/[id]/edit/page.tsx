"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ArrowLeft, Upload } from "lucide-react"

interface TeacherProfile {
  id: string
  user: { name: string }
}

interface CourseData {
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
  teacherId: string
}

export default function EditCoursePage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [course, setCourse] = useState<CourseData | null>(null)
  const [teachers, setTeachers] = useState<TeacherProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [thumbPreview, setThumbPreview] = useState("")

  useEffect(() => {
    fetch(`/api/teacher/courses/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setCourse(res.data)
          setThumbPreview(res.data.thumbnail || "")
        }
      })
      .catch(() => toast.error("Failed to load course"))
      .finally(() => setLoading(false))

    fetch("/api/admin/teachers?status=APPROVED")
      .then((r) => r.json())
      .then((res) => { if (res.success) setTeachers(res.data) })
  }, [id])

  const handleThumbnail = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("/api/upload/assignment", { method: "POST", body: formData })
      const data = await res.json()
      if (data.success) {
        setThumbPreview(data.data.url)
        if (course) setCourse({ ...course, thumbnail: data.data.url })
        toast.success("Thumbnail uploaded")
      } else toast.error("Upload failed")
    } catch { toast.error("Upload failed") }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!course) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...course, thumbnail: thumbPreview }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Course updated")
        router.push("/admin/courses")
      } else toast.error(data.message || "Failed")
    } catch { toast.error("Failed to update") }
    finally { setSaving(false) }
  }

  if (loading) return <Skeleton className="h-96 w-full" />
  if (!course) return <p className="text-center py-12 text-slate-500">Course not found.</p>

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild><Link href="/admin/courses"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <h1 className="text-2xl font-bold">Edit Course</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Title" value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} required />
            <Textarea placeholder="Description" rows={3} value={course.description} onChange={(e) => setCourse({ ...course, description: e.target.value })} required />
            <Input placeholder="Category" value={course.category} onChange={(e) => setCourse({ ...course, category: e.target.value })} required />
            <Select value={course.teacherId} onValueChange={(v) => setCourse({ ...course, teacherId: v })}>
              <SelectTrigger><SelectValue placeholder="Select Teacher" /></SelectTrigger>
              <SelectContent>
                {teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.user.name}</SelectItem>)}
              </SelectContent>
            </Select>
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
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <div className="flex items-center gap-3">
                {thumbPreview && <img src={thumbPreview} alt="Thumbnail" className="w-20 h-20 object-cover rounded border" />}
                <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleThumbnail} />
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> Change Thumbnail</Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={course.isPublished} onCheckedChange={(v) => setCourse({ ...course, isPublished: v })} />
              <Label>Published</Label>
            </div>
            <Button type="submit" disabled={saving} className="w-full">{saving ? "Saving..." : "Save Changes"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
