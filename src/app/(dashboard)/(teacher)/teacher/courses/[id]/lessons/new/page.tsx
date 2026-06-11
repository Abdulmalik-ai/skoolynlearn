"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Module { id: string; title: string }

export default function NewLessonPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [type, setType] = useState("VIDEO")
  const [moduleId, setModuleId] = useState("")
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/teacher/courses/${id}`)
      .then((r) => r.json())
      .then((res) => { if (res.success) setModules(res.data.modules || []) })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !moduleId) return toast.error("Fill required fields")
    setLoading(true)
    try {
      const res = await fetch("/api/teacher/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, moduleId, url: "https://example.com/placeholder" }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Lesson created")
        router.push(`/teacher/courses/${id}`)
      } else toast.error(data.message || "Failed")
    } catch { toast.error("Failed") }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild><Link href={`/teacher/courses/${id}`}><ArrowLeft className="w-4 h-4" /></Link></Button>
        <h1 className="text-2xl font-bold">New Lesson</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <Input placeholder="Lesson title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="VIDEO">Video</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="IMAGE">Image</SelectItem>
              </SelectContent>
            </Select>
            <Select value={moduleId} onValueChange={setModuleId}>
              <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
              <SelectContent>
                {modules.map((m) => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Lesson"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
