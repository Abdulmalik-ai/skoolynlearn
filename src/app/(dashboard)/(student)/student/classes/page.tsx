"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Video, Clock, Calendar, ArrowRight, Radio } from "lucide-react"

interface LiveClass {
  id: string
  title: string
  description: string | null
  scheduledAt: string
  duration: number
  status: string
  meetingUrl: string
  course: { title: string; id: string }
  teacher: { user: { name: string; avatar: string | null } }
}

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/student/live-classes")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setClasses(res.data)
      })
      .catch(() => toast.error("Failed to load classes"))
      .finally(() => setLoading(false))
  }, [])

  const isLive = (status: string) => status === "LIVE"
  const isUpcoming = (scheduledAt: string) => new Date(scheduledAt) > new Date()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Live Classes</h1>
        <p className="text-slate-500">Join your scheduled live video sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-32 w-full" />
              </Card>
            ))
          : classes.map((cls) => (
              <Card key={cls.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={isLive(cls.status) ? "destructive" : "secondary"}
                            className={isLive(cls.status) ? "animate-pulse bg-red-500" : ""}
                          >
                            {isLive(cls.status) ? (
                              <span className="flex items-center gap-1">
                                <Radio className="w-3 h-3" /> LIVE
                              </span>
                            ) : (
                              cls.status
                            )}
                          </Badge>
                          <span className="text-xs text-slate-500">{cls.course.title}</span>
                        </div>
                        <h3 className="font-semibold text-lg">{cls.title}</h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {cls.teacher.user.name.charAt(0)}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {cls.description || "No description provided."}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(cls.scheduledAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(cls.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Video className="w-3.5 h-3.5" />
                        {cls.duration} min
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      asChild
                      disabled={!isLive(cls.status) && !isUpcoming(cls.scheduledAt)}
                      variant={isLive(cls.status) ? "default" : "outline"}
                    >
                      <Link href={`/student/classes/${cls.id}`}>
                        {isLive(cls.status) ? (
                          <>
                            <Radio className="w-4 h-4 mr-1" />
                            Join Live Class
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-4 h-4 mr-1" />
                            View Details
                          </>
                        )}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {!loading && classes.length === 0 && (
        <div className="text-center py-16">
          <Video className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No live classes scheduled for your enrolled courses.</p>
        </div>
      )}
    </div>
  )
}
