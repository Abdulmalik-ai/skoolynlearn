import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth/register",
  "/api/auth/verify-code",
  "/api/auth/login",
  "/api/auth/google",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/payments/webhook",
  "/courses",
  "/courses/",
  "/_next",
  "/favicon.ico",
  "/public",
]

const ROLE_ROUTES = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes and API docs/static assets
  if (
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/upload") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get("skoolyn_token")?.value

  if (!token) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 })
    const role = (payload.role as string) || "STUDENT"

    // Role-based route guards
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url))
    }
    if (pathname.startsWith("/teacher") && role !== "TEACHER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url))
    }
    if (pathname.startsWith("/student") && role !== "STUDENT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Add user info to headers for API routes
    if (pathname.startsWith("/api")) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-user-id", String(payload.id))
      requestHeaders.set("x-user-role", String(payload.role))
      requestHeaders.set("x-user-email", String(payload.email))

      return NextResponse.next({
        request: { headers: requestHeaders },
      })
    }

    return NextResponse.next()
  } catch {
    // Invalid token
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("skoolyn_token")
    return response
  }
}

export const config = {
  matcher: ["/((?!api/payments/webhook|_next/static|_next/image|favicon.ico|public).*)"],
}
