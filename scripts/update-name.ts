import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.pendaftar.findFirst({
    where: { nomor_pendaftaran: 'ILA2600001' }
  });
  
  if (p) {
    await prisma.pendaftar.update({
      where: { id: p.id },
      data: { nama_lengkap: 'Khubaib Abdul Aziz' }
    });
    console.log("Nama santri berhasil diupdate menjadi Khubaib Abdul Aziz");
  } else {
    console.log("Santri tidak ditemukan!");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
