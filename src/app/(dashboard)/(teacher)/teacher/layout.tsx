import { DashboardShell } from "@/components/layout/dashboard-shell"
import {
  LayoutDashboard,
  BookOpen,
  Video,
  FileText,
  ClipboardList,
  BarChart3,
  Users,
  Settings,
  Library,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/teacher/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "My Courses", href: "/teacher/courses", icon: <BookOpen className="w-5 h-5" /> },
  { label: "Videos & Materials", href: "/teacher/materials", icon: <Library className="w-5 h-5" /> },
  { label: "Live Classes", href: "/teacher/classes", icon: <Video className="w-5 h-5" /> },
  { label: "Assignments", href: "/teacher/assignments", icon: <FileText className="w-5 h-5" /> },
  { label: "Tests", href: "/teacher/tests", icon: <ClipboardList className="w-5 h-5" /> },
  { label: "Students", href: "/teacher/students", icon: <Users className="w-5 h-5" /> },
  { label: "Analytics", href: "/teacher/analytics", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Settings", href: "/teacher/settings", icon: <Settings className="w-5 h-5" /> },
]

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} roleLabel="Teacher" roleColor="bg-orange-500">
      {children}
    </DashboardShell>
  )
}
