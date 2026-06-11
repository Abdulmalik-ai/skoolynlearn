import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { Toaster } from "@/components/ui/sonner"
import { SocketProvider } from "@/components/providers/socket-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Skoolyn L.E.A.R.N - Transforming Education",
  description:
    "Skoolyn L.E.A.R.N is a modern learning management platform with live classes, video courses, assignments, and secure payments.",
  keywords: ["LMS", "online learning", "courses", "education", "Nigeria", "Paystack"],
  openGraph: {
    title: "Skoolyn L.E.A.R.N",
    description: "Transforming education, one learner at a time.",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SocketProvider>
              {children}
              <Toaster position="top-right" richColors />
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
