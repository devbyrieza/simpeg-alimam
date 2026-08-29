import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/utils/password";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan. Silakan login kembali." },
        { status: 401 },
      );
    }

    let session: any = null;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword) {
      return NextResponse.json(
        { error: "Password baru tidak boleh kosong." },
        { status: 400 },
      );
    }

    const userId = session.id;

    // Multi-tier user lookup (by ID, email, username, or full name)
    let user = null;
    if (userId) {
      user = await prisma.profile.findUnique({
        where: { id: userId },
      }).catch(() => null);
    }

    if (!user && session.email) {
      user = await prisma.profile.findFirst({
        where: { email: session.email.toLowerCase().trim() },
      });
    }

    if (!user && session.username) {
      user = await prisma.profile.findFirst({
        where: { username: session.username.toLowerCase().trim() },
      });
    }

    if (!user && session.full_name) {
      user = await prisma.profile.findFirst({
        where: { full_name: session.full_name },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Profil tidak ditemukan. Silakan coba login ulang." },
        { status: 404 },
      );
    }

    const isWahabRajasam = 
      session.email === "mudir@pesantren-alandalus.com" || 
      session.full_name?.toLowerCase().includes("wahab") ||
      user.email === "mudir@pesantren-alandalus.com" ||
      user.full_name?.toLowerCase().includes("wahab");

    // Standard validation (bypassed for Wahab Rajasam)
    if (!isWahabRajasam) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "Password baru minimal 8 karakter." },
          { status: 400 },
        );
      }

      if (
        !/(?=.*[a-z])/.test(newPassword) || 
        !/(?=.*[A-Z])/.test(newPassword) || 
        !/(?=.*[0-9])/.test(newPassword) || 
        !/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(newPassword)
      ) {
        return NextResponse.json(
          { error: "Password baru harus mengandung setidaknya satu huruf besar, satu huruf kecil, satu angka, dan satu karakter khusus." },
          { status: 400 },
        );
      }

      if (user.username && newPassword.toLowerCase().includes(user.username.toLowerCase())) {
        return NextResponse.json(
          { error: "Password baru tidak boleh mengandung username." },
          { status: 400 },
        );
      }
    }

    const password_hash = await hashPassword(newPassword);

    await prisma.profile.update({
      where: { id: user.id },
      data: {
        password_hash,
        plain_password: newPassword,
        must_change_password: false,
        updated_at: new Date(),
      },
    });

    // Update session cookie
    const newSession = {
      ...session,
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      is_default_password: false,
    };

    const maxAge = 60 * 60 * 24 * 90; // 90 days
    cookieStore.set("app_session", JSON.stringify(newSession), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
      maxAge,
      expires: new Date(Date.now() + maxAge * 1000),
    });

    return NextResponse.json({
      success: true,
      message: "Password berhasil diperbarui.",
    });
  } catch (error: any) {
    console.error("API /api/profile/password Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan internal." },
      { status: 500 },
    );
  }
}
