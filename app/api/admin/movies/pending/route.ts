import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";
import { MovieStatus } from "@prisma/client";

/* ======================
 * ZOD
 * ====================== */
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  keyword: z.string().optional(),
});

/* ======================
 * TYPES
 * ====================== */
type PendingMovieItem = {
  id: string;
  title: string;
  slug: string;
  status: MovieStatus;
  createdAt: Date;
  createdBy: {
    id: string;
    username: string;
  };
};

type PendingMoviesResponse = {
  page: number;
  limit: number;
  total: number;
  movies: PendingMovieItem[];
};

/* ======================
 * HANDLER
 * ====================== */
export async function GET(req: Request): Promise<NextResponse> {
  // 1️⃣ Auth (ADMIN only)
  await requireAdmin();

  // 2️⃣ Parse & validate query
  const { searchParams } = new URL(req.url);
  const query = querySchema.parse(Object.fromEntries(searchParams.entries()));

  // 3️⃣ Build where clause
  const where: {
    status: MovieStatus;
    title?: {
      contains: string;
      mode: "insensitive";
    };
  } = {
    status: MovieStatus.PENDING_REVIEW,
  };

  if (query.keyword) {
    where.title = {
      contains: query.keyword,
      mode: "insensitive",
    };
  }

  // 4️⃣ Query DB
  const [total, movies] = await Promise.all([
    prisma.movie.count({ where }),
    prisma.movie.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    }),
  ]);

  // 5️⃣ Response
  const response: PendingMoviesResponse = {
    page: query.page,
    limit: query.limit,
    total,
    movies,
  };

  return NextResponse.json(response);
}
