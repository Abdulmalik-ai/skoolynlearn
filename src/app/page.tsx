import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Video, Users, CreditCard, Award, Zap, BarChart3, Globe } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-slate-900 dark:text-white">
              Skoolyn <span className="text-secondary">L.E.A.R.N</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary-600">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Transforming education in Nigeria and beyond
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Learn, Teach, and Grow with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Skoolyn L.E.A.R.N
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A modern learning platform with live video classes, interactive courses, secure payments, and a
            thriving community of learners and educators.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-primary hover:bg-primary-600 text-lg px-8">
                Start Learning
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Become a Teacher
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Everything You Need</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Built for students, teachers, and administrators alike
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Video,
                title: "Live Video Classes",
                desc: "Join interactive sessions with Jitsi Meet integration and real-time chat powered by Socket.io.",
              },
              {
                icon: CreditCard,
                title: "Secure Payments",
                desc: "Paystack-powered checkout for course purchases in NGN. Instant enrollment on successful payment.",
              },
              {
                icon: Award,
                title: "Auto-Graded Tests",
                desc: "Multiple choice tests with instant scoring, timed auto-submission, and detailed feedback.",
              },
              {
                icon: Users,
                title: "Community Groups",
                desc: "Create or join student groups, post updates, comment, and collaborate on projects.",
              },
              {
                icon: BarChart3,
                title: "Rich Analytics",
                desc: "Track progress, earnings, completion rates, and platform growth with beautiful dashboards.",
              },
              {
                icon: Globe,
                title: "Mobile-First Design",
                desc: "Fully responsive interface built with Tailwind CSS. Learn on any device, anywhere.",
              },
            ].map((feature, i) => (
              <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Ready to Start?</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 mb-8">
            Join thousands of students and teachers on Skoolyn L.E.A.R.N today.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-secondary hover:bg-secondary-600 text-lg px-10">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          <p>Skoolyn L.E.A.R.N &copy; {new Date().getFullYear()}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
