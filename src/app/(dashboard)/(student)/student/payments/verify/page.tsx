"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react"

function VerifyContent() {
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [message, setMessage] = useState("")
  const [reference, setReference] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get("reference") || ""
    setReference(ref)

    if (!ref) {
      setStatus("failed")
      setMessage("No payment reference found.")
      return
    }

    fetch(`/api/payments/verify?reference=${ref}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.status === "success") {
          setStatus("success")
          setMessage("Payment successful! You are now enrolled in the course.")
          toast.success("Enrollment confirmed!")
        } else {
          setStatus("failed")
          setMessage(res.message || "Payment verification failed. Please contact support.")
          toast.error(res.message || "Verification failed")
        }
      })
      .catch(() => {
        setStatus("failed")
        setMessage("Network error. Please try again.")
      })
  }, [])

  return (
    <div className="max-w-md mx-auto py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Payment Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
              <p>Verifying your payment...</p>
              {reference && <p className="text-xs text-slate-400">Ref: {reference}</p>}
            </div>
          )}
          {status === "success" && (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 mx-auto text-emerald-500" />
              <Badge className="bg-emerald-100 text-emerald-700">Success</Badge>
              <p>{message}</p>
              <Button asChild className="w-full">
                <Link href="/student/courses"><ArrowLeft className="w-4 h-4 mr-2" /> My Courses</Link>
              </Button>
            </div>
          )}
          {status === "failed" && (
            <div className="space-y-4">
              <XCircle className="w-12 h-12 mx-auto text-red-500" />
              <Badge variant="destructive">Failed</Badge>
              <p>{message}</p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/student/courses"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto py-12"><Card><CardContent className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /><p className="mt-2">Loading...</p></CardContent></Card></div>}>
      <VerifyContent />
    </Suspense>
  )
}
