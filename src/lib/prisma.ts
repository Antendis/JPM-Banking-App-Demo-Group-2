import { PrismaClient } from "@prisma/client";

// Prisma 7: datasourceUrl is passed via the constructor (url no longer lives in schema.prisma)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
    datasourceUrl: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
