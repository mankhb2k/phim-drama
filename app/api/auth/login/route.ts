import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { canLogin, recordLoginAttempt } from "@/lib/auth/rate-limit";
import { NextResponse } from "next/server";
import { z } from "zod";

const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 },
    );
  }
  const { username, password } = parsed.data;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  if (!(await canLogin(username, ip))) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try later." },
      { status: 429 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || user.status === "BLOCKED") {
    await recordLoginAttempt(username, ip, false);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password);

  if (!valid) {
    await recordLoginAttempt(username, ip, false);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await recordLoginAttempt(username, ip, true);
  await createSession(user.id);

  return NextResponse.json({
    ok: true,
    role: user.role,
  });
}
