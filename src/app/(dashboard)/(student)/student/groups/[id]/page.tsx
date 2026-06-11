"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { MessageSquare, Send } from "lucide-react"

interface GroupDetail {
  id: string
  name: string
  description: string | null
  members: { id: string; userId: string; user: { name: string } }[]
  posts: { id: string; content: string; imageUrl: string | null; createdAt: string; author: { name: string } }[]
}

export default function GroupDetailPage() {
  const { id } = useParams() as { id: string }
  const [group, setGroup] = useState<GroupDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState("")
  const [posting, setPosting] = useState(false)

  const fetchGroup = () => {
    fetch(`/api/student/groups/${id}`)
      .then((r) => r.json())
      .then((res) => { if (res.success) setGroup(res.data) })
      .catch(() => toast.error("Failed to load group"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchGroup() }, [id])

  const handlePost = async () => {
    if (!content.trim()) return
    setPosting(true)
    try {
      const res = await fetch(`/api/student/groups/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Posted")
        setContent("")
        fetchGroup()
      } else toast.error(data.message)
    } catch { toast.error("Failed to post") }
    finally { setPosting(false) }
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : group ? (
        <>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
            <p className="text-slate-500">{group.description || "Study group"} · {group.members.length} members</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" /> New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea placeholder="Share something with the group..." rows={3} value={content} onChange={(e) => setContent(e.target.value)} />
              <Button onClick={handlePost} disabled={posting}><Send className="w-4 h-4 mr-2" /> {posting ? "Posting..." : "Post"}</Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {group.posts.length === 0 ? <p className="text-center text-slate-500 py-8">No posts yet. Start the conversation!</p> : (
              group.posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{post.author.name.charAt(0)}</div>
                      <p className="font-medium text-sm">{post.author.name}</p>
                      <p className="text-xs text-slate-400 ml-auto">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{post.content}</p>
                    {post.imageUrl && <img src={post.imageUrl} alt="Post" className="mt-2 rounded-md max-h-60 object-cover" />}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      ) : <p className="text-center text-slate-500 py-8">Group not found.</p>}
    </div>
  )
}
