import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";
import { MovieStatus } from "@prisma/client";

/* ======================
 * ZOD
 * ====================== */
const paramsSchema = z.object({
  id: z.string().min(1),
});

/* ======================
 * HANDLER
 * ====================== */
export async function POST(
  _req: Request,
  context: { params: { id: string } },
): Promise<NextResponse> {
  // 1️⃣ Auth
  await requireAdmin();

  // 2️⃣ Validate params
  const { id } = paramsSchema.parse(context.params);

  // 3️⃣ Update status
  await prisma.movie.update({
    where: { id },
    data: {
      status: MovieStatus.PUBLISHED,
    },
  });

  return NextResponse.json({ ok: true });
}
