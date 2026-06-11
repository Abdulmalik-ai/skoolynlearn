"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { BookOpen, Plus, Search, Users, Pencil, Trash2, Upload, Image } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface CourseItem {
  id: string
  title: string
  description: string
  thumbnail: string | null
  category: string
  price: number
  isFree: boolean
  isPublished: boolean
  teacher: { user: { name: string } }
  _count?: { enrollments: number; modules: number }
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/courses")
      const data = await res.json()
      if (data.success) setCourses(data.data)
    } catch {
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course? This action cannot be undone.")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast.success("Course deleted")
        fetchCourses()
      } else toast.error(data.message)
    } catch {
      toast.error("Delete failed")
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = courses.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="text-slate-500">Manage all platform courses.</p>
        </div>
        <Button asChild><Link href="/admin/courses/new"><Plus className="w-4 h-4 mr-1" /> New Course</Link></Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input placeholder="Search courses..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-40 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          : filtered.map((course) => (
              <Card key={course.id} className="overflow-hidden group">
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <BookOpen className="w-12 h-12" />
                    </div>
                  )}
                  <Badge className={`absolute top-2 left-2 ${course.isPublished ? "bg-green-600" : "bg-yellow-600"}`}>
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-1">{course.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1"><Users className="w-3 h-3" /><span>{course._count?.enrollments || 0} students</span></div>
                    <span>{course._count?.modules || 0} modules</span>
                    <span>{course.isFree ? "Free" : formatCurrency(Number(course.price))}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button size="sm" variant="outline" asChild className="flex-1"><Link href={`/admin/courses/${course.id}/edit`}><Pencil className="w-3 h-3 mr-1" /> Edit</Link></Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(course.id)} disabled={deletingId === course.id} className="flex-1">{deletingId === course.id ? "Deleting..." : <><Trash2 className="w-3 h-3 mr-1" /> Delete</>}</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No courses found.</p>
        </div>
      )}
    </div>
  )
}
