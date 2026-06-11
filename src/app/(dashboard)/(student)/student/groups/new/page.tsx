"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewGroupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.error("Name is required")
    setLoading(true)
    try {
      const res = await fetch("/api/student/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Group created")
        router.push(`/student/groups/${data.data.id}`)
      } else toast.error(data.message || "Failed")
    } catch { toast.error("Failed") }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild><Link href="/student/groups"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <h1 className="text-2xl font-bold">Create Group</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <Input placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Textarea placeholder="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Group"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
