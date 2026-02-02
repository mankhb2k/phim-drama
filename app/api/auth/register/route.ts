import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { NextResponse } from "next/server";
import { z } from "zod";

const RegisterSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 },
    );
  }

  const { username, password } = parsed.data;

  const exists = await prisma.user.findUnique({
    where: { username },
  });

  if (exists) {
    return NextResponse.json(
      { error: "Username already exists" },
      { status: 409 },
    );
  }

  await prisma.user.create({
    data: {
      username,
      password: await hashPassword(password),
    },
  });

  return NextResponse.json({ ok: true });
}
