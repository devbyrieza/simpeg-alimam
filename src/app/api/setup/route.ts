import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";

export async function GET() {
  try {
    const email = "admin@pesantren-alimam.com";
    const password = "AdminAlimam2026!";
    
    let admin = await prisma.profile.findFirst({
      where: { email }
    });

    if (!admin) {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin = await prisma.profile.create({
        data: {
          id: crypto.randomUUID(),
          email: email,
          password_hash: hashedPassword,
          full_name: "Administrator SIMPEG",
          role: "admin_super",
          phone: "080000000000",
          updated_at: new Date()
        }
      });
      return NextResponse.json({ success: true, message: "Akun admin berhasil dibuat!", email, password });
    }

    return NextResponse.json({ success: true, message: "Akun admin sudah ada sebelumnya.", email });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
