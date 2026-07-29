import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  try {
    const pegawai = await prisma.pegawai.findMany();
    const users = await prisma.user.findMany();
    return NextResponse.json({ pegawai, users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
