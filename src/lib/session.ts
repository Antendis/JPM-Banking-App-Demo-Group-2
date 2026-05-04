import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getSessionUser() {
  const jar = await cookies();
  const raw = jar.get("session_user_id")?.value;
  if (!raw) return null;
  const id = parseInt(raw, 10);
  if (isNaN(id)) return null;
  return prisma.user.findUnique({ where: { id } });
}
