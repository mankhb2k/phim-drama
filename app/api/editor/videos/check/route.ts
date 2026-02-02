import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { z } from "zod";

// ===== ZOD =====
const checkVideoSchema = z.object({
  sourceId: z.string().min(1),
});

// ===== HELPER =====
async function isVideoAlive(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);

    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  // 1️⃣ Auth
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!["ADMIN", "EDITOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2️⃣ Validate input
  const body = checkVideoSchema.parse(await req.json());

  // 3️⃣ Get source
  const source = await prisma.episodeSource.findUnique({
    where: { id: body.sourceId },
    select: {
      id: true,
      url: true,
      status: true,
    },
  });

  if (!source) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  // 4️⃣ Check video
  const alive = await isVideoAlive(source.url);
  const newStatus = alive ? "OK" : "DIE";

  // 5️⃣ Update DB (chỉ update khi đổi trạng thái)
  if (source.status !== newStatus) {
    await prisma.episodeSource.update({
      where: { id: source.id },
      data: { status: newStatus },
    });
  }

  // 6️⃣ Response
  return NextResponse.json({
    sourceId: source.id,
    status: newStatus,
  });
}
