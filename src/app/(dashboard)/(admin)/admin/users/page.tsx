"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Search, UserCheck, UserX, Users, Pencil, Trash2 } from "lucide-react"

interface UserItem {
  id: string
  name: string
  email: string
  role: string
  isVerified: boolean
  isSuspended: boolean
  createdAt: string
  avatar: string | null
  phone: string | null
  _count?: { enrollments: number }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editRole, setEditRole] = useState("")
  const [editSaving, setEditSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchUsers = () => {
    setLoading(true)
    const url = "/api/admin/users?search=" + encodeURIComponent(search)
    fetch(url)
      .then((r) => r.json())
      .then((res) => { if (res.success) setUsers(res.data) })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [search])

  const toggleSuspend = async (id: string) => {
    try {
      const res = await fetch("/api/admin/users/" + id + "/suspend", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        toast.success(data.data.isSuspended ? "User blocked" : "User unblocked")
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isSuspended: data.data.isSuspended } : u))
      } else toast.error(data.message)
    } catch { toast.error("Failed") }
  }

  const openEdit = (user: UserItem) => {
    setEditingUser(user)
    setEditName(user.name)
    setEditEmail(user.email)
    setEditRole(user.role)
  }

  const saveEdit = async () => {
    if (!editingUser) return
    setEditSaving(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingUser.id, name: editName, email: editEmail, role: editRole }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("User updated")
        setEditingUser(null)
        fetchUsers()
      } else toast.error(data.message)
    } catch { toast.error("Failed to update") }
    finally { setEditSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const url = "/api/admin/users?id=" + deleteId
      const res = await fetch(url, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast.success("User deleted")
        setDeleteId(null)
        fetchUsers()
      } else toast.error(data.message)
    } catch { toast.error("Failed to delete") }
    finally { setDeleting(false) }
  }

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      TEACHER: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
      STUDENT: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    }
    return <Badge className={colors[role] || "bg-slate-100"}>{role}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-slate-500">Manage all platform users. Block, unblock, edit or delete.</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-medium">{users.length} total</span>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input className="pl-10" placeholder="Search users by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : (
        <div className="grid gap-3">
          {users.map((u) => (
            <Card key={u.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                    {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-slate-500">{u.email} {u.phone ? "· " + u.phone : ""}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {roleBadge(u.role)}
                      {u.isVerified ? <Badge variant="outline" className="gap-1"><UserCheck className="w-3 h-3" /> Verified</Badge> : <Badge variant="outline" className="text-amber-600">Unverified</Badge>}
                      {u.isSuspended && <Badge variant="destructive">Blocked</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(u)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant={u.isSuspended ? "outline" : "destructive"} onClick={() => toggleSuspend(u.id)}>
                    {u.isSuspended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                    {u.isSuspended ? "Unblock" : "Block"}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteId(u.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {users.length === 0 && <p className="text-center text-slate-500 py-8">No users found.</p>}
        </div>
      )}

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <Input placeholder="Email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            <Select value={editRole} onValueChange={setEditRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="TEACHER">Teacher</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={editSaving}>{editSaving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to delete this user? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
