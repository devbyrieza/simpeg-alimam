
import { PrismaClient } from '@prisma/client';
import { createHmac } from "crypto";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

const prisma = new PrismaClient();
const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || "fallback-secret-for-dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://pesantren-alimam.com";

function generateMagicToken(profileId: string, role: string, fullName: string, expiresInHours = 48) {
    const exp = Date.now() + expiresInHours * 60 * 60 * 1000;
    const redirect = "/dashboard/penguji/input-nilai";
    const payload = { id: profileId, role, full_name: fullName, exp, redirect };
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64");
    const signature = createHmac("sha256", MAGIC_LINK_SECRET).update(payloadStr).digest("hex");
    return `${payloadStr}.${signature}`;
}

async function main() {
    const names = ['Agus', 'Jusman', 'Syauqi'];
    console.log(`\n--- MENYALAKAN GENERATOR MAGIC LINK ---`);
    console.log(`Domain: ${APP_URL}\n`);

    for (const name of names) {
        const profile = await prisma.profile.findFirst({
            where: {
                full_name: { contains: name, mode: 'insensitive' }
            }
        });

        if (profile) {
            const token = generateMagicToken(profile.id, profile.role || 'penguji', profile.full_name);
            const link = `${APP_URL}/api/auth/magic?token=${token}`;
            console.log(`✅ ${profile.full_name} (${profile.role})`);
            console.log(`👉 Link: ${link}\n`);
        } else {
            console.log(`❌ Profil untuk "${name}" tidak ditemukan.\n`);
        }
    }
    console.log(`--- SELESAI ---\n`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
