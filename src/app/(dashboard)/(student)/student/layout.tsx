import { DashboardShell } from "@/components/layout/dashboard-shell"
import {
  LayoutDashboard,
  BookOpen,
  Video,
  FileText,
  ClipboardList,
  Users,
  MessageCircle,
  Settings,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/student/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Courses", href: "/student/courses", icon: <BookOpen className="w-5 h-5" /> },
  { label: "Live Classes", href: "/student/classes", icon: <Video className="w-5 h-5" /> },
  { label: "Assignments", href: "/student/assignments", icon: <FileText className="w-5 h-5" /> },
  { label: "Tests", href: "/student/tests", icon: <ClipboardList className="w-5 h-5" /> },
  { label: "Groups", href: "/student/groups", icon: <Users className="w-5 h-5" /> },
  { label: "Community", href: "/student/community", icon: <MessageCircle className="w-5 h-5" /> },
  { label: "Settings", href: "/student/settings", icon: <Settings className="w-5 h-5" /> },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} roleLabel="Student" roleColor="bg-emerald-500">
      {children}
    </DashboardShell>
  )
}
