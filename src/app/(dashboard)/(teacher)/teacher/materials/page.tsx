"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { BookOpen, Video, FileText, Upload, Plus, Play, File } from "lucide-react"

interface Course {
  id: string
  title: string
  modules: { id: string; title: string; order: number; lessons: { id: string; title: string; type: string; url: string; filePath: string | null; duration: number | null }[] }[]
}

export default function TeacherMaterialsPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedModule, setSelectedModule] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadType, setUploadType] = useState<"VIDEO" | "PDF" | "IMAGE">("VIDEO")
  const [lessonTitle, setLessonTitle] = useState("")

  useEffect(() => {
    fetch("/api/teacher/courses")
      .then((r) => r.json())
      .then((res) => { if (res.success) setCourses(res.data) })
      .catch(() => toast.error("Failed to load courses"))
      .finally(() => setLoading(false))
  }, [])

  const selectedCourseData = courses.find((c) => c.id === selectedCourse)

  const handleUpload = async () => {
    if (!selectedCourse || !selectedModule || !lessonTitle || !fileRef.current?.files?.[0]) {
      toast.error("Select course, module, enter title and choose file")
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", fileRef.current.files[0])
      formData.append("type", uploadType)

      const uploadRes = await fetch("/api/upload/lesson", { method: "POST", body: formData })
      const uploadData = await uploadRes.json()
      if (!uploadData.success) { toast.error("Upload failed"); return }

      const res = await fetch("/api/teacher/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lessonTitle,
          type: uploadType,
          url: uploadData.data.url,
          filePath: uploadData.data.filePath,
          moduleId: selectedModule,
          duration: 0,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Material uploaded successfully!")
        setLessonTitle("")
        fileRef.current.value = ""
        // Refresh courses
        fetch("/api/teacher/courses")
          .then((r) => r.json())
          .then((res) => { if (res.success) setCourses(res.data) })
      } else {
        toast.error(data.message || "Failed to save lesson")
      }
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const getIcon = (type: string) => {
    if (type === "VIDEO") return <Video className="w-4 h-4 text-blue-500" />
    if (type === "PDF") return <FileText className="w-4 h-4 text-red-500" />
    return <File className="w-4 h-4 text-green-500" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Videos & Materials</h1>
        <p className="text-slate-500">Upload course content for your students.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" /> Upload New Material</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedCourse} onValueChange={(v) => { setSelectedCourse(v); setSelectedModule("") }}>
            <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
            <SelectContent>
              {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
            </SelectContent>
          </Select>

          {selectedCourseData && (
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
              <SelectContent>
                {selectedCourseData.modules.map((m) => <SelectItem key={m.id} value={m.id}>{m.order}. {m.title}</SelectItem>)}
              </SelectContent>
            </Select>
          )}

          <input type="text" placeholder="Lesson title" className="w-full border rounded-md px-3 py-2 text-sm" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />

          <div className="flex gap-2">
            {(["VIDEO", "PDF", "IMAGE"] as const).map((t) => (
              <Button key={t} type="button" variant={uploadType === t ? "default" : "outline"} size="sm" onClick={() => setUploadType(t)}>
                {t === "VIDEO" ? <Video className="w-4 h-4 mr-1" /> : t === "PDF" ? <FileText className="w-4 h-4 mr-1" /> : <File className="w-4 h-4 mr-1" />}
                {t}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input type="file" ref={fileRef} accept={uploadType === "VIDEO" ? "video/*" : uploadType === "PDF" ? ".pdf" : "image/*"} className="text-sm" />
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? <Upload className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Upload
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {courses.length === 0 && <p className="text-center text-slate-500 py-8">No courses assigned to you yet.</p>}
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> {course.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.modules.length === 0 ? <p className="text-sm text-slate-500">No modules yet.</p> : (
                  course.modules.map((mod) => (
                    <div key={mod.id} className="border rounded-lg p-3">
                      <p className="font-medium text-sm mb-2">{mod.order}. {mod.title}</p>
                      {mod.lessons.length === 0 ? <p className="text-xs text-slate-400">No lessons</p> : (
                        <div className="space-y-2">
                          {mod.lessons.map((lesson) => (
                            <div key={lesson.id} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                              {getIcon(lesson.type)}
                              <span className="text-sm flex-1">{lesson.title}</span>
                              {lesson.type === "VIDEO" && lesson.url && (
                                <Button size="sm" variant="outline" asChild><Link href={lesson.url} target="_blank"><Play className="w-3 h-3 mr-1" /> Play</Link></Button>
                              )}
                              {lesson.type !== "VIDEO" && lesson.url && (
                                <Button size="sm" variant="outline" asChild><Link href={lesson.url} target="_blank">Open</Link></Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
