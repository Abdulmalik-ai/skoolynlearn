"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useAuth } from "@/components/providers/auth-provider"
import { Search, BookOpen, Star, Users, PlayCircle, Lock, CheckCircle } from "lucide-react"
import { CourseWithDetails } from "@/types"
import { formatCurrency } from "@/lib/utils"

export default function StudentCoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<CourseWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [priceType, setPriceType] = useState("all")

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (category && category !== "all") params.append("category", category)
      if (priceType !== "all") params.append("isFree", priceType === "free" ? "true" : "false")

      const res = await fetch(`/api/student/courses?${params.toString()}`)
      const data = await res.json()
      if (data.success) setCourses(data.data)
    } catch {
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [search, category, priceType])

  const handleEnroll = async (courseId: string, isFree: boolean) => {
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.message)
        return
      }
      if (isFree) {
        toast.success("Enrolled successfully!")
        fetchCourses()
      } else if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url
      }
    } catch {
      toast.error("Enrollment failed")
    }
  }

  const categories = ["all", "Programming", "Design", "Business", "Marketing", "Science", "Mathematics", "Languages"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Browse Courses</h1>
        <p className="text-slate-500">Discover new skills and expand your knowledge.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search courses..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "all" ? "All Categories" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priceType} onValueChange={setPriceType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-40 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          : courses.map((course) => (
              <Card key={course.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <BookOpen className="w-12 h-12" />
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-white/90 text-slate-900">
                    {course.isFree ? "Free" : formatCurrency(Number(course.price))}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-1">{course.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{Number(course.rating).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{course._count?.enrollments || 0} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <PlayCircle className="w-3 h-3" />
                      <span>{course._count?.modules || 0} modules</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {course.teacher?.user?.name?.charAt(0) || "T"}
                    </div>
                    <span className="text-xs text-slate-600">{course.teacher?.user?.name}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  {(course as any).isEnrolled ? (
                    <Button className="w-full" variant="outline" asChild>
                      <Link href={`/student/courses/${course.id}`}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Continue Learning
                      </Link>
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => handleEnroll(course.id, course.isFree)}>
                      {course.isFree ? (
                        <>
                          <BookOpen className="w-4 h-4 mr-1" />
                          Enroll Free
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-1" />
                          Buy Course
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
      </div>

      {!loading && courses.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No courses found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
