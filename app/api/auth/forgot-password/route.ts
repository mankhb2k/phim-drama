import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

const ForgotPasswordSchema = z.object({
  email: z.string().email().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = ForgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    // preserve previous behavior: silently succeed
    return NextResponse.json({ ok: true });
  }

  const { email } = parsed.data;

  if (!email) {
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomUUID();

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 phút
    },
  });

  // TODO: gửi email
  console.log("RESET TOKEN:", token);

  return NextResponse.json({ ok: true });
}
