"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewModulePage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return toast.error("Title is required")
    setLoading(true)
    try {
      const res = await fetch("/api/teacher/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, courseId: id, order: 1 }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Module created")
        router.push(`/teacher/courses/${id}`)
      } else toast.error(data.message || "Failed")
    } catch { toast.error("Failed") }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild><Link href={`/teacher/courses/${id}`}><ArrowLeft className="w-4 h-4" /></Link></Button>
        <h1 className="text-2xl font-bold">New Module</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <Input placeholder="Module title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Module"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
