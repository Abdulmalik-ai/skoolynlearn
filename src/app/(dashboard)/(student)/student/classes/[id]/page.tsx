"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { LiveClassRoom } from "@/components/shared/live-class-room"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface LiveClass {
  id: string
  title: string
  meetingUrl: string
  status: string
  teacher: { user: { name: string; avatar: string | null } }
}

export default function StudentClassRoomPage() {
  const { id } = useParams() as { id: string }
  const [liveClass, setLiveClass] = useState<LiveClass | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/student/live-classes/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setLiveClass(res.data)
        else toast.error(res.message || "Failed to load class")
      })
      .catch(() => toast.error("Failed to load class"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Skeleton className="h-[calc(100vh-5rem)] w-full" />
  if (!liveClass) return <p className="text-center py-12 text-slate-500">Class not found.</p>

  return <LiveClassRoom liveClass={liveClass} userRole="STUDENT" />
}
