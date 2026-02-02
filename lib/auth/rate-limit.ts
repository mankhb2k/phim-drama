import { prisma } from "@/lib/prisma";

export async function canLogin(username: string, ip: string) {
  const since = new Date(Date.now() - 15 * 60 * 1000);

  const failed = await prisma.loginAttempt.count({
    where: {
      username,
      ip,
      success: false,
      createdAt: { gte: since },
    },
  });

  return failed < 5;
}

export async function recordLoginAttempt(
  username: string,
  ip: string,
  success: boolean,
) {
  await prisma.loginAttempt.create({
    data: {
      username,
      ip,
      success,
    },
  });
}
