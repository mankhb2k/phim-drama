import { getSession } from "@/lib/auth/session";

export async function requireAdmin() {
  const session = await getSession();

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return session;
}
