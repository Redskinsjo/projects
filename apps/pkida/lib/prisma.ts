import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { pkidaPrisma?: PrismaClient };
export function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL manquante : configurez PostgreSQL dans apps/pkida/.env.local puis redémarrez PKida.",
    );
  }
  if (!globalForPrisma.pkidaPrisma) {
    globalForPrisma.pkidaPrisma = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
        max: 5,
        connectionTimeoutMillis: 15000,
        idleTimeoutMillis: 30000,
      }),
    });
  }
  return globalForPrisma.pkidaPrisma;
}
