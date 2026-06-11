"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { MessageCircle, Send } from "lucide-react"

interface Post {
  id: string
  content: string
  createdAt: string
  author: { name: string }
}

export default function StudentCommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState("")
  const [posting, setPosting] = useState(false)

  const fetchPosts = () => {
    fetch("/api/student/community")
      .then((r) => r.json())
      .then((res) => { if (res.success) setPosts(res.data) })
      .catch(() => toast.error("Failed to load community"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPosts() }, [])

  const handlePost = async () => {
    if (!content.trim()) return
    setPosting(true)
    try {
      const res = await fetch("/api/student/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (data.success) { toast.success("Posted"); setContent(""); fetchPosts() }
      else toast.error(data.message)
    } catch { toast.error("Failed to post") }
    finally { setPosting(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Community</h1>
        <p className="text-slate-500">Connect with all students and teachers on the platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageCircle className="w-5 h-5" /> New Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea placeholder="What's on your mind?" rows={3} value={content} onChange={(e) => setContent(e.target.value)} />
          <Button onClick={handlePost} disabled={posting}><Send className="w-4 h-4 mr-2" /> {posting ? "Posting..." : "Post"}</Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.length === 0 ? <p className="text-center text-slate-500 py-8">No posts yet. Be the first!</p> : (
            posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{post.author.name.charAt(0)}</div>
                    <p className="font-medium text-sm">{post.author.name}</p>
                    <p className="text-xs text-slate-400 ml-auto">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{post.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
