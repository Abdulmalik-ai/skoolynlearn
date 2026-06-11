"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Check, X, FileText, Search, Download, GraduationCap } from "lucide-react"
import { TeacherApplication } from "@/types"
import { formatDate } from "@/lib/utils"

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<TeacherApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("PENDING")
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchTeachers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/teachers?status=${statusFilter}`)
      const data = await res.json()
      if (data.success) setTeachers(data.data)
    } catch {
      toast.error("Failed to load teachers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [statusFilter])

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED", reason?: string) => {
    setProcessingId(id)
    try {
      const res = await fetch("/api/admin/teachers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: id, status, rejectionReason: reason }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        fetchTeachers()
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error("Action failed")
    } finally {
      setProcessingId(null)
    }
  }

  const filtered = teachers.filter((t) =>
    `${t.user.name} ${t.user.email} ${t.subjects.join(" ")}`.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teacher Applications</h1>
          <p className="text-slate-500">Review and manage teacher applications.</p>
        </div>
        <div className="flex gap-2">
          {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className={statusFilter === s ? "bg-primary" : ""}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search teachers..."
          className="pl-9"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No {statusFilter.toLowerCase()} teachers found.</p>
          </div>
        ) : (
          filtered.map((teacher) => (
            <Card key={teacher.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {teacher.user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{teacher.user.name}</h3>
                        <Badge
                          variant={
                            teacher.status === "APPROVED"
                              ? "default"
                              : teacher.status === "REJECTED"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {teacher.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">{teacher.user.email}</p>
                      <p className="text-sm text-slate-500 mt-1">{teacher.user.phone || "No phone"}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {teacher.subjects.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                      {teacher.bio && <p className="text-sm mt-2 max-w-xl text-slate-700">{teacher.bio}</p>}
                      {teacher.rejectionReason && (
                        <p className="text-sm mt-2 text-red-600">Reason: {teacher.rejectionReason}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-2">Applied {formatDate(teacher.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {teacher.resumeUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={teacher.resumeUrl} target="_blank" rel="noreferrer">
                          <Download className="w-4 h-4 mr-1" />
                          Resume
                        </a>
                      </Button>
                    )}
                    {teacher.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={processingId === teacher.id}
                          onClick={() => handleAction(teacher.id, "APPROVED")}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={processingId === teacher.id}
                          onClick={() => {
                            const reason = prompt("Rejection reason (optional):")
                            handleAction(teacher.id, "REJECTED", reason || undefined)
                          }}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
