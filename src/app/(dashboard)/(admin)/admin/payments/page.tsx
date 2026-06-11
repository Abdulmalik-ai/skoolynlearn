"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { CreditCard, Calendar } from "lucide-react"

interface PaymentItem {
  id: string
  reference: string
  amount: number
  status: string
  paidAt: string | null
  createdAt: string
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((res) => { if (res.success) setPayments(res.data) })
      .catch(() => toast.error("Failed to load payments"))
      .finally(() => setLoading(false))
  }, [])

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      SUCCESS: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
      PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
      FAILED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    }
    return <Badge className={colors[status] || "bg-slate-100"}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-slate-500">All payment transactions on the platform.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : (
        <div className="grid gap-3">
          {payments.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{p.reference}</p>
                    <p className="text-sm text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold">₦{(p.amount / 100).toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "Not paid"}
                    </div>
                  </div>
                  {statusBadge(p.status)}
                </div>
              </CardContent>
            </Card>
          ))}
          {payments.length === 0 && <p className="text-center text-slate-500 py-8">No payments yet.</p>}
        </div>
      )}
    </div>
  )
}
