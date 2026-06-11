import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { NextRequest } from "next/server"
import { UserPayload } from "@/types"
import { prisma } from "./db"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed)
}

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload, iat: Date.now() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 })
    return payload as unknown as UserPayload
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string) {
  cookies().set("skoolyn_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function clearAuthCookie() {
  cookies().delete("skoolyn_token")
}

export async function getAuthUser(req?: NextRequest): Promise<UserPayload | null> {
  try {
    const token = req
      ? req.cookies.get("skoolyn_token")?.value
      : cookies().get("skoolyn_token")?.value

    if (!token) return null
    return await verifyToken(token)
  } catch {
    return null
  }
}

export async function requireAuth(req?: NextRequest): Promise<UserPayload> {
  const user = await getAuthUser(req)
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export async function requireRole(
  role: UserPayload["role"] | UserPayload["role"][],
  req?: NextRequest
): Promise<UserPayload> {
  const user = await requireAuth(req)
  const roles = Array.isArray(role) ? role : [role]
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden: insufficient permissions")
  }
  return user
}

export async function getUserFromDb(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      teacherProfile: true,
      studentProfile: true,
    },
  })
}
