import { PrismaClient } from "@prisma/client"

/**
 * Resolve the Prisma connection URLs.
 *
 * Prisma's schema reads `DATABASE_URL` (pooled) and `DIRECT_URL` (direct/session)
 * via env(). In this project those are not set directly — instead the Supabase
 * integration provides `usman_POSTGRES_PRISMA_URL`. We derive both URLs from it
 * so the app works locally AND when deployed without any manual env var setup.
 */
function resolvePrismaEnv() {
  // If already provided (e.g. a custom deployment), respect them.
  const pooled = process.env.DATABASE_URL || process.env.usman_POSTGRES_PRISMA_URL

  if (!pooled) {
    // Nothing to do — let Prisma surface its own helpful error.
    return
  }

  process.env.DATABASE_URL = pooled

  if (!process.env.DIRECT_URL) {
    try {
      // Build a direct (session pooler) URL: same host/credentials, port 5432,
      // without the pgbouncer flag. Supabase's session pooler supports this and
      // is reachable where the direct DB host may not be (IPv6-only).
      const url = new URL(pooled)
      url.port = "5432"
      url.searchParams.delete("pgbouncer")
      url.searchParams.set("sslmode", "require")
      process.env.DIRECT_URL = url.toString()
    } catch {
      process.env.DIRECT_URL = pooled
    }
  }
}

resolvePrismaEnv()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
