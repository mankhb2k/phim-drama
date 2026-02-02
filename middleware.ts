import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LOGIN_PATH = "/login";
const FORBIDDEN_PATH = "/403";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPath = pathname.startsWith("/admin");
  const isEditorPath = pathname.startsWith("/editor");

  // Không phải admin/editor → bỏ qua
  if (!isAdminPath && !isEditorPath) {
    return NextResponse.next();
  }

  // 1️⃣ Lấy session token
  const sessionToken = req.cookies.get("session")?.value;

  if (!sessionToken) {
    return redirect(req, LOGIN_PATH);
  }

  // 2️⃣ Query session + role
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    select: {
      expiresAt: true,
      user: {
        select: {
          role: true,
        },
      },
    },
  });

  // Session không tồn tại hoặc hết hạn
  if (!session || session.expiresAt < new Date()) {
    return redirect(req, LOGIN_PATH);
  }

  const role = session.user.role;

  // 3️⃣ Check quyền
  if (isAdminPath && role !== "ADMIN") {
    return redirect(req, FORBIDDEN_PATH);
  }

  if (isEditorPath && !["ADMIN", "EDITOR"].includes(role)) {
    return redirect(req, FORBIDDEN_PATH);
  }

  return NextResponse.next();
}

function redirect(req: NextRequest, path: string) {
  const url = req.nextUrl.clone();
  url.pathname = path;
  return NextResponse.redirect(url);
}

// Áp dụng middleware
export const config = {
  matcher: ["/admin/:path*", "/editor/:path*"],
};
