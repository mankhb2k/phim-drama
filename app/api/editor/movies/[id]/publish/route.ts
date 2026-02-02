import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.movie.update({
    where: { id: params.id },
    data: { status: "PENDING_REVIEW" },
  });

  return NextResponse.json({ ok: true });
}
