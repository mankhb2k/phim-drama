import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "HIDDEN"]).optional(),
  year: z.coerce.number().optional(),
  country: z.string().optional(),
  keyword: z.string().optional(),
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
  const query = querySchema.parse(Object.fromEntries(searchParams));

  const where: any = {};

  if (query.status) where.status = query.status;
  if (query.year) where.year = query.year;
  if (query.country) where.country = query.country;
  if (query.keyword) {
    where.title = { contains: query.keyword, mode: "insensitive" };
  }

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
        status: true,
        year: true,
        country: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    page: query.page,
    limit: query.limit,
    total,
    movies,
  });
}
