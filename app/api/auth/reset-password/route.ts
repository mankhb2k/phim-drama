import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { NextResponse } from "next/server";
import { z } from "zod";

const ResetPasswordSchema = z.object({
  token: z.string().uuid(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = ResetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 },
    );
  }
  const { token, newPassword } = parsed.data;

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token expired" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: {
      password: await hashPassword(newPassword),
    },
  });

  await prisma.passwordResetToken.delete({
    where: { token },
  });

  return NextResponse.json({ ok: true });
}
