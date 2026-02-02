import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { updateRoleSchema } from "@/lib/validators/admin";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    await requireAdmin();

    const body = updateRoleSchema.parse(await req.json());

    await prisma.user.update({
      where: { id: body.userId },
      data: { role: body.role },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
