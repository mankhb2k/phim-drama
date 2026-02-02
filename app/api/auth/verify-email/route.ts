import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const VerifyEmailSchema = z.object({
  token: z.string().uuid(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = VerifyEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 },
    );
  }
  const { token } = parsed.data;

  const record = await prisma.emailVerifyToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: {
      emailVerified: true,
    },
  });

  await prisma.emailVerifyToken.delete({
    where: { token },
  });

  return NextResponse.json({ ok: true });
}
