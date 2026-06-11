"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeSettings } from "@/components/shared/theme-settings"
import { toast } from "sonner"
import { Loader2, Upload, User } from "lucide-react"

export default function SettingsPage() {
  const { user, setUser } = useAuth()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [avatar, setAvatar] = useState("")
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setPhone((user as any).phone || "")
      setAvatar(user.avatar || "")
    }
  }, [user])

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("phone", phone)
      if (fileRef.current?.files?.[0]) {
        formData.append("avatar", fileRef.current.files[0])
      }

      const res = await fetch("/api/user/profile", { method: "PATCH", body: formData })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.message)
        return
      }
      toast.success("Profile updated!")
      setUser({ ...user!, name, avatar: data.data.avatar || avatar } as any)
    } catch {
      toast.error("Update failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer group" onClick={() => fileRef.current?.click()}>
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatar || undefined} />
                <AvatarFallback className="bg-primary text-white text-xl">{name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={() => {
                if (fileRef.current?.files?.[0]) {
                  setAvatar(URL.createObjectURL(fileRef.current.files[0]))
                }
              }} />
            </div>
            <div>
              <p className="font-medium">{name || "User"}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <p className="text-sm text-slate-500 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <User className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <ThemeSettings />
    </div>
  )
}
