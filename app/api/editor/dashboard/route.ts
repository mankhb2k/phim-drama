import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { z } from "zod";

// ===== ZOD =====
// Dashboard hiện tại không cần input,
// nhưng vẫn để schema để giữ convention
const dashboardQuerySchema = z.object({});

export async function GET(req: Request) {
  // 1️⃣ Auth
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Chỉ ADMIN / EDITOR
  if (!["ADMIN", "EDITOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2️⃣ Validate query (future-proof)
  dashboardQuerySchema.parse({});

  // 3️⃣ Time helpers
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // 4️⃣ Queries song song (tối ưu)
  const [
    totalMovies,
    draftMovies,
    pendingReview,
    publishedMovies,
    moviesToday,
    totalEpisodes,
    videoErrors,
    recentMovies,
  ] = await Promise.all([
    prisma.movie.count(),

    prisma.movie.count({
      where: { status: "DRAFT" },
    }),

    prisma.movie.count({
      where: { status: "PENDING_REVIEW" },
    }),

    prisma.movie.count({
      where: { status: "PUBLISHED" },
    }),

    prisma.movie.count({
      where: {
        createdAt: { gte: startOfToday },
      },
    }),

    prisma.episode.count(),

    prisma.episodeSource.count({
      where: { status: "DIE" },
    }),

    prisma.movie.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  // 5️⃣ Response
  return NextResponse.json({
    totalMovies,
    draftMovies,
    pendingReview,
    publishedMovies,
    moviesToday,
    totalEpisodes,
    videoErrors,
    recentMovies,
  });
}
