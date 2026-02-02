import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";
import { MovieStatus } from "@prisma/client";

const paramsSchema = z.object({
  id: z.string().min(1),
});

export async function POST(
  _req: Request,
  context: { params: { id: string } },
): Promise<NextResponse> {
  await requireAdmin();

  const { id } = paramsSchema.parse(context.params);

  await prisma.movie.update({
    where: { id },
    data: {
      status: MovieStatus.DRAFT,
    },
  });

  return NextResponse.json({ ok: true });
}
