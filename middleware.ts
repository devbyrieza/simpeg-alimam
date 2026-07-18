import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("app_session");

  // Public routes — tidak perlu login
  if (
    pathname.startsWith("/login") || 
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/pendataan") ||
    pathname.startsWith("/api/pendataan") ||
    pathname.startsWith("/api/pegawai") ||
    pathname.startsWith("/images") ||
    pathname === "/"
  ) {
    // Jika sudah login dan mencoba akses /login, redirect ke dashboard
    if (sessionCookie && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Semua route lain butuh login (seperti /dashboard)
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Rolling session renewal
  const response = NextResponse.next();
  if (sessionCookie) {
    const maxAge = 60 * 60 * 24 * 90; // 90 Days
    const expires = new Date(Date.now() + maxAge * 1000);
      
    response.cookies.set("app_session", sessionCookie.value, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      expires,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
