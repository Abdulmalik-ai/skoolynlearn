"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Megaphone, Send } from "lucide-react"

interface AnnouncementItem {
  id: string
  title: string
  body: string
  target: string
  isBroadcast: boolean
  createdAt: string
  createdBy: { name: string }
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [target, setTarget] = useState("ALL")
  const [sending, setSending] = useState(false)

  const fetchData = () => {
    fetch("/api/admin/announcements")
      .then((r) => r.json())
      .then((res) => { if (res.success) setAnnouncements(res.data) })
      .catch(() => toast.error("Failed to load announcements"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !body) return toast.error("Title and body are required")
    setSending(true)
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, target }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Announcement sent")
        setTitle("")
        setBody("")
        fetchData()
      } else toast.error(data.message)
    } catch { toast.error("Failed to send") }
    finally { setSending(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
        <p className="text-slate-500">Send platform-wide announcements to users.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Megaphone className="w-5 h-5" /> New Announcement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Body" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
            <div className="flex items-center gap-3">
              <select className="border rounded-md px-3 py-2 text-sm" value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="ALL">All Users</option>
                <option value="STUDENT">Students Only</option>
                <option value="TEACHER">Teachers Only</option>
                <option value="ADMIN">Admins Only</option>
              </select>
              <Button type="submit" disabled={sending}><Send className="w-4 h-4 mr-2" /> {sending ? "Sending..." : "Send"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="grid gap-3">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{a.title}</h3>
                  <Badge>{a.target}</Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{a.body}</p>
                <p className="text-xs text-slate-400">By {a.createdBy?.name || "Admin"} on {new Date(a.createdAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
          {announcements.length === 0 && <p className="text-center text-slate-500 py-8">No announcements yet.</p>}
        </div>
      )}
    </div>
  )
}
