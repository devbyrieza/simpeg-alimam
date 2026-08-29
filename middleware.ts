import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("app_session");

  // Public routes — tidak perlu login
  if (
    pathname.startsWith("/login") || 
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/setup") || pathname.startsWith("/api/delete-guru") ||
    pathname.startsWith("/pendataan") ||
    pathname.startsWith("/api/pendataan") ||
    pathname.startsWith("/api/pegawai") ||
    pathname.startsWith("/api/export-semua") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/api/uploads") ||
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

  let sessionData: any = null;
  try {
    sessionData = JSON.parse(sessionCookie.value);
  } catch (e) {}

  // Pengecualian khusus untuk Wahab Rajasam (Mudir)
  const isWahabRajasam = sessionData && (sessionData.email === "mudir@pesantren-alandalus.com" || sessionData.full_name?.includes("Wahab Rajasam"));

  if (sessionData && sessionData.is_default_password === true && !isWahabRajasam) {
    const exemptedRoles = ["pendaftar", "santri", "wali_santri"];
    if (!exemptedRoles.includes(sessionData.role)) {
      // Allow access to API for changing password and logout
      if (!pathname.startsWith("/api/profile/password") && !pathname.startsWith("/api/auth/logout")) {
        const isPenguji = sessionData.role === "penguji";
        const targetProfile = isPenguji ? "/dashboard/penguji/profil" : "/dashboard/admin/profil";
        if (pathname !== targetProfile) {
          return NextResponse.redirect(new URL(targetProfile, request.url));
        }
      }
    }
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|api/export-semua).*)"],
};
