import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const adminPasswordHash = await bcrypt.hash('AdminAlimam2026!', 10);
    const guruPasswordHash = await bcrypt.hash('GuruAlimam2026!', 10);

    const civitasProfiles = [
      // ══════════════════════════════════════════════════════════════
      // 1. MULTIUSER (ADMIN SUPER & GURU)
      // ══════════════════════════════════════════════════════════════
      {
        full_name: 'Rieza Eka Tomara, S.Kom',
        email: 'riezaekatomara@gmail.com',
        phone: '085111524441',
        role: 'admin_super',
        secondary_roles: ['admin_super', 'guru', 'staf'],
        password_hash: adminPasswordHash,
      },
      {
        full_name: 'Abdil Aziz, S.Pd, B.A',
        email: 'abdilaziz@pesantren-alimam.com',
        phone: '081234567817',
        role: 'admin_super',
        secondary_roles: ['admin_super', 'guru'],
        password_hash: adminPasswordHash,
      },
      {
        full_name: 'Wahab Rajasam, M.Pd',
        email: 'wahabrajasam@pesantren-alimam.com',
        phone: '081234567804',
        role: 'admin_super',
        secondary_roles: ['admin_super', 'guru', 'mudir'],
        password_hash: adminPasswordHash,
      },

      // ══════════════════════════════════════════════════════════════
      // 2. CIVITAS GURU (AKUN GURU)
      // ══════════════════════════════════════════════════════════════
      {
        full_name: 'Hardiansyah',
        email: 'hardiansyah@pesantren-alimam.com',
        phone: '081234567801',
        role: 'guru',
        secondary_roles: [],
        password_hash: guruPasswordHash,
      },
      {
        full_name: 'Muhammad Maulana Rizki',
        email: 'maulanarizki@pesantren-alimam.com',
        phone: '081234567802',
        role: 'guru',
        secondary_roles: [],
        password_hash: guruPasswordHash,
      },
      {
        full_name: 'Teguh Hudaya, Lc, M.M',
        email: 'teguhhudaya@pesantren-alimam.com',
        phone: '081234567803',
        role: 'guru',
        secondary_roles: ['staf'],
        password_hash: guruPasswordHash,
      },
      {
        full_name: 'Ade Supyana S. Pd. I',
        email: 'adesupyana@pesantren-alimam.com',
        phone: '081234567807',
        role: 'guru',
        secondary_roles: [],
        password_hash: guruPasswordHash,
      },
      {
        full_name: 'Arifin Saefullah, A.Ma, Dpl, Lc, M.M, M.Pd',
        email: 'arifinsaefullah@pesantren-alimam.com',
        phone: '081234567808',
        role: 'guru',
        secondary_roles: [],
        password_hash: guruPasswordHash,
      },
      {
        full_name: 'Muhammad Thoriq Ibn Ziyad, Lc, M.Ag',
        email: 'thoriqziyad@pesantren-alimam.com',
        phone: '081234567809',
        role: 'guru',
        secondary_roles: [],
        password_hash: guruPasswordHash,
      },
      {
        full_name: 'Agus Cahyono',
        email: 'aguscahyono@pesantren-alimam.com',
        phone: '081234567811',
        role: 'guru',
        secondary_roles: ['musyrif'],
        password_hash: guruPasswordHash,
      },
      {
        full_name: 'Wahyudi Pranata, Lc',
        email: 'wahyudipranata@pesantren-alimam.com',
        phone: '081234567812',
        role: 'guru',
        secondary_roles: [],
        password_hash: guruPasswordHash,
      },
      {
        full_name: 'Imron Abdillah',
        email: 'imronabdillah@pesantren-alimam.com',
        phone: '081234567813',
        role: 'guru',
        secondary_roles: ['musyrif'],
        password_hash: guruPasswordHash,
      },
      {
        full_name: 'Ramdan',
        email: 'ramdan@pesantren-alimam.com',
        phone: '081234567814',
        role: 'guru',
        secondary_roles: ['staf'],
        password_hash: guruPasswordHash,
      },
      {
        full_name: 'Muhammad Iqbal, S.Pd',
        email: 'muhammadiqbal@pesantren-alimam.com',
        phone: '081234567815',
        role: 'guru',
        secondary_roles: ['musyrif'],
        password_hash: guruPasswordHash,
      },
    ];

    const results = [];

    for (const p of civitasProfiles) {
      const existing = await prisma.profile.findFirst({
        where: {
          OR: [
            { email: p.email.toLowerCase().trim() },
            { full_name: { contains: p.full_name.split(',')[0].trim(), mode: 'insensitive' } },
          ],
        },
      });

      if (existing) {
        const updated = await prisma.profile.update({
          where: { id: existing.id },
          data: {
            full_name: p.full_name,
            email: p.email.toLowerCase().trim(),
            role: p.role,
            secondary_roles: p.secondary_roles,
            password_hash: p.password_hash,
          },
        });
        results.push({ action: 'updated', id: updated.id, name: updated.full_name, role: updated.role, secondary_roles: updated.secondary_roles });
      } else {
        const created = await prisma.profile.create({
          data: {
            full_name: p.full_name,
            email: p.email.toLowerCase().trim(),
            phone: p.phone,
            role: p.role,
            secondary_roles: p.secondary_roles,
            password_hash: p.password_hash,
          },
        });
        results.push({ action: 'created', id: created.id, name: created.full_name, role: created.role, secondary_roles: created.secondary_roles });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Berhasil mengonfigurasi profil civitas guru & multi-role di database SIMPEG/PPDB!',
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
