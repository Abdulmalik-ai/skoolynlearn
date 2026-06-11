import axios from "axios"

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE_URL = "https://api.paystack.co"

const paystackApi = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    "Content-Type": "application/json",
  },
})

export async function initializePayment(data: {
  email: string
  amount: number // in kobo
  reference: string
  metadata: Record<string, unknown>
  callback_url?: string
}) {
  try {
    const response = await paystackApi.post("/transaction/initialize", data)
    return response.data
  } catch (error: any) {
    console.error("Paystack init error:", error?.response?.data || error.message)
    throw new Error(error?.response?.data?.message || "Payment initialization failed")
  }
}

export async function verifyPayment(reference: string) {
  try {
    const response = await paystackApi.get(`/transaction/verify/${reference}`)
    return response.data
  } catch (error: any) {
    console.error("Paystack verify error:", error?.response?.data || error.message)
    throw new Error(error?.response?.data?.message || "Payment verification failed")
  }
}

export function generatePaystackReference(): string {
  return `skoolyn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
}

export function koboFromNaira(naira: number): number {
  return Math.round(naira * 100)
}

export function nairaFromKobo(kobo: number): number {
  return kobo / 100
}

export async function listPaystackTransactions(
  page = 1,
  perPage = 50,
  status?: string
) {
  try {
    const params = new URLSearchParams()
    params.append("perPage", perPage.toString())
    params.append("page", page.toString())
    if (status) params.append("status", status)

    const response = await paystackApi.get(`/transaction?${params.toString()}`)
    return response.data
  } catch (error: any) {
    console.error("Paystack list error:", error?.response?.data || error.message)
    throw new Error(error?.response?.data?.message || "Failed to fetch transactions")
  }
}

export async function fetchPaystackTransaction(id: string) {
  try {
    const response = await paystackApi.get(`/transaction/${id}`)
    return response.data
  } catch (error: any) {
    console.error("Paystack fetch error:", error?.response?.data || error.message)
    throw new Error(error?.response?.data?.message || "Failed to fetch transaction")
  }
}
