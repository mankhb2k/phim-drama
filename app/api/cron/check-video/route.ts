import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function isAlive(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  // 🔐 Có thể thêm CRON_SECRET nếu deploy
  const sources = await prisma.episodeSource.findMany({
    where: { status: "OK" },
    take: 50, // tránh quá tải
  });

  let dieCount = 0;

  for (const source of sources) {
    const alive = await isAlive(source.url);
    if (!alive) {
      await prisma.episodeSource.update({
        where: { id: source.id },
        data: { status: "DIE" },
      });
      dieCount++;
    }
  }

  return NextResponse.json({
    checked: sources.length,
    dieCount,
  });
}
