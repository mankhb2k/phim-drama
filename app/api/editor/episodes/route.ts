import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { z } from "zod";

const querySchema = z.object({
  movieId: z.string().min(1),
});

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!["ADMIN", "EDITOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const { movieId } = querySchema.parse(Object.fromEntries(searchParams));

  const episodes = await prisma.episode.findMany({
    where: { movieId },
    orderBy: { number: "asc" },
    include: {
      sources: true,
    },
  });

  return NextResponse.json(episodes);
}
