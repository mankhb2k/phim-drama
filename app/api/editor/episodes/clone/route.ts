import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { z } from "zod";

const cloneSchema = z.object({
  episodeId: z.string().min(1),
  newNumber: z.number().int().positive(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!["ADMIN", "EDITOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { episodeId, newNumber } = cloneSchema.parse(await req.json());

  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    include: { sources: true },
  });

  if (!episode) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }

  const cloned = await prisma.episode.create({
    data: {
      movieId: episode.movieId,
      number: newNumber,
      language: episode.language,
      createdById: session.user.id,
      sources: {
        create: episode.sources.map(
          (s: { server: string; url: string; status: string }) => ({
            server: s.server,
            url: s.url,
            status: s.status,
          }),
        ),
      },
    },
  });

  return NextResponse.json(cloned);
}
