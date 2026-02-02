import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  email: z.string().email(),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { password, ...safeUser } = session.user;
  return NextResponse.json(safeUser);
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = UpdateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 },
    );
  }
  const { email } = parsed.data;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      email,
      emailVerified: false,
    },
  });

  return NextResponse.json({ ok: true });
}
