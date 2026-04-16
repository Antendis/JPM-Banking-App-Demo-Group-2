import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const dbPath = path.resolve(process.cwd(), dbUrl.replace("file:", ""));
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({ adapter, log: ["error"] });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
