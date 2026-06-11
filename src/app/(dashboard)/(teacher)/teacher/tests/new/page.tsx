"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

interface Course { id: string; title: string }

interface Question {
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  optionE: string
  correctAnswer: string
  points: string
}

export default function NewTestPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [timeLimit, setTimeLimit] = useState("30")
  const [maxScore, setMaxScore] = useState("100")
  const [courseId, setCourseId] = useState("")
  const [courses, setCourses] = useState<Course[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/teacher/courses")
      .then((r) => r.json())
      .then((res) => { if (res.success) setCourses(res.data) })
  }, [])

  const addQuestion = () => {
    setQuestions([...questions, { text: "", optionA: "", optionB: "", optionC: "", optionD: "", optionE: "", correctAnswer: "A", points: "1" }])
  }

  const removeQuestion = (idx: number) => { setQuestions(questions.filter((_, i) => i !== idx)) }

  const updateQuestion = (idx: number, field: keyof Question, value: string) => {
    const next = [...questions]
    next[idx] = { ...next[idx], [field]: value }
    setQuestions(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !courseId || questions.length === 0) return toast.error("Fill required fields and add questions")
    setLoading(true)
    try {
      const res = await fetch("/api/teacher/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, timeLimit: Number(timeLimit), maxScore: Number(maxScore), courseId, questions }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Test created")
        router.push("/teacher/tests")
      } else toast.error(data.message || "Failed")
    } catch { toast.error("Failed") }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild><Link href="/teacher/tests"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <h1 className="text-2xl font-bold">New Test</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Textarea placeholder="Description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-4">
              <Input type="number" placeholder="Time limit (mins)" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
              <Input type="number" placeholder="Max score" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Questions ({questions.length})</h3>
                <Button type="button" variant="outline" onClick={addQuestion}><Plus className="w-4 h-4 mr-2" /> Add</Button>
              </div>
              {questions.map((q, idx) => (
                <Card key={idx} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input placeholder="Question text" value={q.text} onChange={(e) => updateQuestion(idx, "text", e.target.value)} required />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(idx)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="A" value={q.optionA} onChange={(e) => updateQuestion(idx, "optionA", e.target.value)} required />
                      <Input placeholder="B" value={q.optionB} onChange={(e) => updateQuestion(idx, "optionB", e.target.value)} required />
                      <Input placeholder="C" value={q.optionC} onChange={(e) => updateQuestion(idx, "optionC", e.target.value)} required />
                      <Input placeholder="D" value={q.optionD} onChange={(e) => updateQuestion(idx, "optionD", e.target.value)} required />
                      <Input placeholder="E" value={q.optionE} onChange={(e) => updateQuestion(idx, "optionE", e.target.value)} required />
                    </div>
                    <div className="flex gap-2">
                      <Select value={q.correctAnswer} onValueChange={(v) => updateQuestion(idx, "correctAnswer", v)}>
                        <SelectTrigger className="w-32"><SelectValue placeholder="Correct" /></SelectTrigger>
                        <SelectContent>
                          {["A","B","C","D","E"].map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input type="number" placeholder="Points" value={q.points} onChange={(e) => updateQuestion(idx, "points", e.target.value)} className="w-24" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Test"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
