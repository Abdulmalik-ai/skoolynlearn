"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Course { id: string; title: string }

export default function NewAssignmentPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [maxScore, setMaxScore] = useState("100")
  const [courseId, setCourseId] = useState("")
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/teacher/courses")
      .then((r) => r.json())
      .then((res) => { if (res.success) setCourses(res.data) })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !dueDate || !courseId) return toast.error("Fill all required fields")
    setLoading(true)
    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, dueDate, maxScore: Number(maxScore), courseId }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Assignment created")
        router.push("/teacher/assignments")
      } else toast.error(data.message || "Failed")
    } catch { toast.error("Failed") }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild><Link href="/teacher/assignments"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <h1 className="text-2xl font-bold">New Assignment</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Textarea placeholder="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            <Input type="number" placeholder="Max score" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Assignment"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
