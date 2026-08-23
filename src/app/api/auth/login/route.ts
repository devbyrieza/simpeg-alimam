import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/utils/password";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email: rawEmail, password } = body;
    const email = rawEmail?.trim()?.toLowerCase();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan Password wajib diisi" },
        { status: 400 }
      );
    }

    const profile = await prisma.profile.findFirst({
      where: {
        OR: [
          { email },
          { username: { equals: email, mode: "insensitive" } },
          { phone: email }
        ]
      } });

    if (!profile || !profile.password_hash) {
      return NextResponse.json(
        { error: "User ID / Email / No. WA atau password salah" },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, profile.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "User ID / Email / No. WA atau password salah", dbHash: profile.password_hash, dbUrl: process.env.DATABASE_URL?.substring(0, 30) },
        { status: 401 }
      );
    }

    const isDefaultPassword = profile.must_change_password === true || password === "2026#@" || profile.plain_password === "2026#@";

    const responseJson = NextResponse.json({
      success: true,
      message: "Login berhasil",
      role: profile.role,
      is_default_password: isDefaultPassword });

    const maxAge = 60 * 60 * 24 * 90; // 90 Days
    responseJson.cookies.set(
      "app_session",
      JSON.stringify({
        role: profile.role,
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        is_default_password: isDefaultPassword }),
      {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
        maxAge,
        expires: new Date(Date.now() + maxAge * 1000) }
    );

    return responseJson;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  }
}

