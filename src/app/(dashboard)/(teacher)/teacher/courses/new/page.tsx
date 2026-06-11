"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft, Upload, Video } from "lucide-react"

interface TeacherProfile {
  id: string
  user: { name: string }
}

export default function NewCoursePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [isFree, setIsFree] = useState(false)
  const [freeUntil, setFreeUntil] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [duration, setDuration] = useState("")
  const [teachers, setTeachers] = useState<TeacherProfile[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)

  useEffect(() => {
    fetch("/api/admin/teachers?status=APPROVED")
      .then((r) => r.json())
      .then((res) => { if (res.success) setTeachers(res.data) })
  }, [])

  const handleThumbnailUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("/api/upload/assignment", { method: "POST", body: formData })
      const data = await res.json()
      if (data.success) { setThumbnail(data.data.url); toast.success("Thumbnail uploaded") }
      else toast.error(data.message || "Upload failed")
    } catch { toast.error("Upload failed") }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !category || !selectedTeacher) return toast.error("Fill required fields")
    setLoading(true)

    try {
      let videoUrl = null
      let videoPath = null
      if (videoFile) {
        const formData = new FormData()
        formData.append("file", videoFile)
        formData.append("type", "VIDEO")
        const res = await fetch("/api/upload/lesson", { method: "POST", body: formData })
        const data = await res.json()
        if (data.success) { videoUrl = data.data.url; videoPath = data.data.filePath }
      }

      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, category, price: Number(price) || 0, isFree, freeUntil: freeUntil || null,
          thumbnail, duration: Number(duration) || null, teacherId: selectedTeacher,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Course created")
        router.push("/admin/courses")
      } else toast.error(data.message || "Failed")
    } catch { toast.error("Failed to create") }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild><Link href="/admin/courses"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <h1 className="text-2xl font-bold">Create New Course</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Course Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Textarea placeholder="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
            <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger><SelectValue placeholder="Select Teacher" /></SelectTrigger>
              <SelectContent>
                {teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.user.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-3">
              <Switch checked={isFree} onCheckedChange={setIsFree} />
              <Label>Free Course</Label>
            </div>
            {!isFree && (
              <>
                <Input type="number" placeholder="Price (NGN)" value={price} onChange={(e) => setPrice(e.target.value)} />
                <div className="space-y-1">
                  <Label>Free Until (optional)</Label>
                  <Input type="date" value={freeUntil} onChange={(e) => setFreeUntil(e.target.value)} />
                  <p className="text-xs text-slate-500">Leave empty if always paid. Set date to make free until that date.</p>
                </div>
              </>
            )}
            <Input type="number" placeholder="Duration (hours)" value={duration} onChange={(e) => setDuration(e.target.value)} />
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <div className="flex items-center gap-3">
                {thumbnail && <img src={thumbnail} alt="Thumbnail" className="w-16 h-16 object-cover rounded" />}
                <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> Upload Thumbnail</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Intro Video (optional)</Label>
              <div className="flex items-center gap-3">
                <input type="file" ref={videoRef} accept="video/*" className="hidden" onChange={() => {
                  const file = videoRef.current?.files?.[0]
                  if (file) setVideoFile(file)
                }} />
                <Button type="button" variant="outline" onClick={() => videoRef.current?.click()}><Video className="w-4 h-4 mr-2" /> {videoFile ? videoFile.name : "Select Video"}</Button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating..." : "Create Course"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
