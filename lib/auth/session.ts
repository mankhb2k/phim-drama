import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const SESSION_COOKIE = "session";

// Types for cookie helpers
type CookieSameSite = "lax" | "strict" | "none";

type CookieSetOptions = {
  name: string;
  value: string;
  httpOnly?: boolean;
  sameSite?: CookieSameSite;
  secure?: boolean;
  path?: string;
  domain?: string;
  expires?: Date;
  maxAge?: number;
};

type CookieGetResult = { name: string; value: string } | undefined;

type CookieDeleteOptions = {
  name: string;
  path?: string;
  domain?: string;
};

function getCookieStore() {
  // cookies() may be typed as a Promise<ReadonlyRequestCookies> in your environment.
  // Await and cast to a minimal writable cookie store interface we need.
  return cookies() as unknown as Promise<{
    set: (opts: CookieSetOptions) => void;
    get: (name: string) => CookieGetResult;
    delete: (name: string) => void;
  }>;
}

export async function createSession(userId: string) {
  const token = crypto.randomUUID();

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
    },
  });

  const cookieStore = await getCookieStore();
  cookieStore.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await getCookieStore();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return;

  await prisma.session.delete({ where: { token } });
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await getCookieStore();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}
