import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@127.0.0.1:5433/ppdb_alimam"
        },
    },
})

async function main() {
    const pendaftar = await prisma.pendaftar.findFirst({
        where: {
            nama_lengkap: {
                contains: 'atqan',
                mode: 'insensitive'
            }
        },
        include: {
            dokumen: true
        }
    })
    
    if (!pendaftar) {
        console.log("Atqan not found");
        return;
    }
    
    console.log("Pendaftar:", pendaftar.nama_lengkap, pendaftar.nomor_pendaftaran);
    for (const dok of pendaftar.dokumen) {
        console.log(`- ${dok.jenis_dokumen}: ${dok.file_path} (verified: ${dok.is_verified})`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
