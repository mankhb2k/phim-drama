import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { blockUserSchema } from "@/lib/validators/admin";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    await requireAdmin();

    const { userId } = blockUserSchema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        status: user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
