import { DashboardShell } from "@/components/layout/dashboard-shell"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  BarChart3,
  Megaphone,
  Settings,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Teachers", href: "/admin/teachers", icon: <GraduationCap className="w-5 h-5" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
  { label: "Courses", href: "/admin/courses", icon: <BookOpen className="w-5 h-5" /> },
  { label: "Payments", href: "/admin/payments", icon: <CreditCard className="w-5 h-5" /> },
  { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Announcements", href: "/admin/announcements", icon: <Megaphone className="w-5 h-5" /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} roleLabel="Admin" roleColor="bg-primary">
      {children}
    </DashboardShell>
  )
}
