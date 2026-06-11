"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ArrowLeft, Clock } from "lucide-react"

interface Question {
  id: string
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  optionE: string
  correctAnswer: string
  points: number
}

interface TestDetail {
  id: string
  title: string
  timeLimit: number
  questions: Question[]
}

export default function TestPage() {
  const { id } = useParams() as { id: string }
  const [test, setTest] = useState<TestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetch(`/api/student/tests?id=${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const t = Array.isArray(res.data) ? res.data.find((x: TestDetail) => x.id === id) : res.data
          if (t) { setTest(t); setTimeLeft(t.timeLimit * 60) }
        }
      })
      .catch(() => toast.error("Failed to load test"))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    }
    if (timeLeft === 0 && !submitted && test) handleSubmit()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timeLeft, submitted, test])

  const handleSubmit = async () => {
    if (submitted) return
    setSubmitted(true)
    if (timerRef.current) clearInterval(timerRef.current)
    try {
      const res = await fetch(`/api/student/tests/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, timeTaken: test ? test.timeLimit * 60 - timeLeft : 0 }),
      })
      const data = await res.json()
      if (data.success) { setScore(data.data.score); toast.success(`Score: ${data.data.score}`) }
      else toast.error(data.message || "Failed to submit")
    } catch { toast.error("Submission failed") }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  if (loading) return <Skeleton className="h-96 w-full" />
  if (!test) return <p className="text-center py-12 text-slate-500">Test not found.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild><Link href="/student/tests"><ArrowLeft className="w-4 h-4" /></Link></Button>
          <h1 className="text-2xl font-bold">{test.title}</h1>
        </div>
        <div className="flex items-center gap-2 text-lg font-mono">
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {submitted && (
        <Card className="bg-emerald-50 dark:bg-emerald-900/20">
          <CardContent className="p-4">
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">Score: {score}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {test.questions.map((q, idx) => (
          <Card key={q.id}>
            <CardHeader><CardTitle className="text-base">{idx + 1}. {q.text}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {["A","B","C","D","E"].map((opt) => (
                <Button
                  key={opt}
                  variant={answers[q.id] === opt ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => !submitted && setAnswers({ ...answers, [q.id]: opt })}
                  disabled={submitted}
                >
                  {opt}. {(q as any)[`option${opt}`]}
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {!submitted && <Button onClick={handleSubmit} className="w-full">Submit Test</Button>}
    </div>
  )
}
