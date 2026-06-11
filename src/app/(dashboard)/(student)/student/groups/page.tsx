"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Users, Plus } from "lucide-react"

interface Group {
  id: string
  name: string
  description: string | null
  courseName: string | null
  members: number
  isMember: boolean
}

export default function StudentGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/student/groups")
      .then((r) => r.json())
      .then((res) => { if (res.success) setGroups(res.data) })
      .catch(() => toast.error("Failed to load groups"))
      .finally(() => setLoading(false))
  }, [])

  const joinGroup = async (id: string) => {
    try {
      const res = await fetch(`/api/student/groups/${id}/join`, { method: "POST" })
      const data = await res.json()
      if (data.success) {
        toast.success("Joined group")
        setGroups((prev) => prev.map((g) => g.id === id ? { ...g, isMember: true, members: g.members + 1 } : g))
      } else toast.error(data.message)
    } catch { toast.error("Failed to join") }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Study Groups</h1>
          <p className="text-slate-500">Collaborate with classmates in your courses.</p>
        </div>
        <Button asChild><Link href="/student/groups/new"><Plus className="w-4 h-4 mr-2" /> Create Group</Link></Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="grid gap-3">
          {groups.map((g) => (
            <Card key={g.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{g.name}</p>
                    <p className="text-sm text-slate-500">{g.description || "No description"}</p>
                    <p className="text-xs text-slate-400">{g.courseName || "General"} · {g.members} members</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {g.isMember ? (
                    <Button size="sm" asChild><Link href={`/student/groups/${g.id}`}>Open</Link></Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => joinGroup(g.id)}>Join</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {groups.length === 0 && <p className="text-center text-slate-500 py-8">No study groups yet.</p>}
        </div>
      )}
    </div>
  )
}
