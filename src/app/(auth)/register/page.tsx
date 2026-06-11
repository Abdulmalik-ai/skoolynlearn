"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { BookOpen, Eye, EyeOff, Loader2, Mail, User, Phone, UserCircle, GraduationCap, Upload, Camera } from "lucide-react"

import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const verify = params.get("verify")
      if (verify) {
        setEmail(verify)
        setNeedsVerification(true)
      }
    }
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      toast.error("Please fill all required fields")
      return
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("password", password)
      formData.append("role", role)
      formData.append("phone", phone)
      if (fileRef.current?.files?.[0]) {
        formData.append("avatar", fileRef.current.files[0])
      }

      const res = await fetch("/api/auth/register", { method: "POST", body: formData })
      const result = await res.json()

      if (!result.success) {
        toast.error(result.message || "Registration failed")
        return
      }

      setNeedsVerification(true)
      toast.success("Registration successful! Check your email for the 6-digit code.")
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async () => {
    if (verificationCode.length !== 6) return
    setIsVerifying(true)
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      })
      const result = await res.json()

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success("Account verified! Redirecting...")
      router.push(result.data?.redirect || "/login")
    } catch {
      toast.error("Verification failed")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      })
      const result = await res.json()
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success("Welcome!")
      router.push(result.data?.redirect || "/")
    } catch {
      toast.error("Google login failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (needsVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <CardTitle>Verify your email</CardTitle>
            <CardDescription>Enter the 6-digit code sent to {email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="000000" maxLength={6} className="text-center text-lg tracking-[0.5em]" />
            <Button onClick={handleVerify} className="w-full" disabled={isVerifying || verificationCode.length !== 6}>
              {isVerifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Verify & Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            Skoolyn L.E.A.R.N
          </Link>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Join the learning community</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex justify-center">
              <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google login failed")} theme="outline" size="large" width="100%" text="continue_with" />
              </GoogleOAuthProvider>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or register with email</span></div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setRole("STUDENT")} className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${role === "STUDENT" ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-slate-200 dark:border-slate-700 hover:border-primary/50"}`}>
                  <UserCircle className="h-6 w-6 mb-2 text-primary" />
                  <span className="text-sm font-medium">Student</span>
                </button>
                <button type="button" onClick={() => setRole("TEACHER")} className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${role === "TEACHER" ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20" : "border-slate-200 dark:border-slate-700 hover:border-orange-500/50"}`}>
                  <GraduationCap className="h-6 w-6 mb-2 text-orange-500" />
                  <span className="text-sm font-medium">Teacher</span>
                </button>
              </div>

              <div className="flex justify-center">
                <div className="relative cursor-pointer group" onClick={() => fileRef.current?.click()}>
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300">
                    {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-slate-400" />}
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                    <Upload className="w-3 h-3" />
                  </div>
                </div>
                <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={() => {
                  const file = fileRef.current?.files?.[0]
                  if (file) setAvatarPreview(URL.createObjectURL(file))
                }} />
              </div>
              <p className="text-center text-xs text-slate-400">{avatarPreview ? "Photo selected" : "Click to upload profile photo (optional)"}</p>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input id="email" type="email" placeholder="name@example.com" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input id="phone" placeholder="+234 800 000 0000" className="pl-9" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min 6 characters" className="pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Account
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-slate-500">Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link></p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
