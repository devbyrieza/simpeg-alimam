import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const adminPasswordHash = await bcrypt.hash('AdminAlimam2026!', 10);
    const guruPasswordHash = await bcrypt.hash('GuruAlimam2026!', 10);

    // 1. Ambil semua profile/pegawai
    const semuaProfile = await prisma.profile.findMany();

    const results = [];

    for (const p of semuaProfile) {
      // Kita hanya memproses yang memang dikategorikan Guru/Asatidz atau Multi-role yang dikenal
      const namaUpper = p.full_name.toUpperCase();
      
      const isRieza = namaUpper.includes('RIEZA EKA TOMARA');
      const isAbdilAziz = namaUpper.includes('ABDIL AZIZ');
      const isWahab = namaUpper.includes('WAHAB RAJASAM');
      
      const isMultiRole = isRieza || isAbdilAziz || isWahab;
      
      // Jika bukan multi-role dan role utamanya bukan guru, lewati saja
      if (!isMultiRole && p.role !== 'guru' && !p.secondary_roles?.includes('guru')) {
        continue;
      }

      const role = isMultiRole ? 'admin_super' : 'guru';
      const passwordHash = isMultiRole ? adminPasswordHash : guruPasswordHash;
      
      let secondaryRoles = p.secondary_roles || [];
      if (isRieza) secondaryRoles = ['admin_super', 'guru', 'staf'];
      if (isAbdilAziz) secondaryRoles = ['admin_super', 'guru'];
      if (isWahab) secondaryRoles = ['admin_super', 'guru', 'mudir'];

      // Pastikan ada email, jika kosong beri email default
      let targetEmail = p.email?.toLowerCase().trim();
      if (!targetEmail || targetEmail === '') {
        const namaDepan = p.full_name.split(/[\s,]+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        targetEmail = `${namaDepan}@pesantren-alimam.com`;
      }

      // Generate NIP
      let nipProfile = p.nip;
      if (!nipProfile) {
        const randomDigits = Math.floor(100 + Math.random() * 900); // 100 to 999
        nipProfile = `26${randomDigits}`;
        
        try {
          await prisma.profile.update({
            where: { id: p.id },
            data: { nip: nipProfile }
          });
        } catch(e) {
          nipProfile = `26${Math.floor(100 + Math.random() * 900)}`;
          await prisma.profile.update({
            where: { id: p.id },
            data: { nip: nipProfile }
          });
        }
      }

      const updated = await prisma.profile.update({
        where: { id: p.id },
        data: {
          email: targetEmail,
          nip: nipProfile,
          role: role,
          secondary_roles: secondaryRoles,
          password_hash: passwordHash,
        },
      });

      results.push({
        action: 'updated',
        id: updated.id,
        name: updated.full_name,
        email_digunakan: targetEmail,
        role: updated.role,
        secondary_roles: updated.secondary_roles
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Berhasil mengonfigurasi profil civitas guru & multi-role secara dinamis di database SIMPEG/PPDB!',
      total: results.length,
      data: results,
    });
  } catch (error: any) {
    console.error('Error provisioning simpeg profiles:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}
