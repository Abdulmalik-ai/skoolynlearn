"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { teacherApplicationSchema } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useAuth } from "@/components/providers/auth-provider"
import { Loader2, GraduationCap, X, Plus } from "lucide-react"

type ApplyForm = z.infer<typeof teacherApplicationSchema>

export default function TeacherApplyPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [subjects, setSubjects] = useState<string[]>([])
  const [newSubject, setNewSubject] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ApplyForm>({
    resolver: zodResolver(teacherApplicationSchema),
  })

  const addSubject = () => {
    if (!newSubject.trim()) return
    if (subjects.includes(newSubject.trim())) return
    const updated = [...subjects, newSubject.trim()]
    setSubjects(updated)
    setValue("subjects", updated.join(", "))
    setNewSubject("")
  }

  const removeSubject = (s: string) => {
    const updated = subjects.filter((sub) => sub !== s)
    setSubjects(updated)
    setValue("subjects", updated.join(", "))
  }

  const onSubmit = async (data: ApplyForm) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/teacher/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success("Application submitted! We'll review it shortly.")
      router.push("/teacher/dashboard")
    } catch {
      toast.error("Submission failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mx-auto mb-4">
            <GraduationCap className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">Teacher Application</CardTitle>
          <CardDescription>Tell us about yourself and your expertise</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                placeholder="Tell us about your teaching experience, style, and passion..."
                rows={5}
                className="border-slate-200"
                {...register("bio")}
              />
              {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Subjects You Teach</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a subject (e.g., Mathematics)"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubject())}
                  className="border-slate-200"
                />
                <Button type="button" variant="outline" onClick={addSubject}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {subjects.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1">
                    {s}
                    <button type="button" onClick={() => removeSubject(s)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              {errors.subjects && <p className="text-xs text-red-500">{errors.subjects.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <Input type="number" min={0} max={60} className="border-slate-200" {...register("yearsExperience", { valueAsNumber: true })} />
                {errors.yearsExperience && <p className="text-xs text-red-500">{errors.yearsExperience.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Education</Label>
                <Input placeholder="e.g., BSc Computer Science" className="border-slate-200" {...register("education")} />
              </div>
            </div>

            <Button type="submit" className="w-full bg-secondary hover:bg-secondary-600" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
