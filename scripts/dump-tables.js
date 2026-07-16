const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const models = prisma._runtimeDataModel.models;
  for (const modelName of Object.keys(models)) {
    const key = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    if (!prisma[key]) continue;
    try {
      const count = await prisma[key].count();
      console.log(`Model ${modelName}: ${count} rows`);
      if (count > 0 && modelName === 'Pendaftar') {
        const samples = await prisma[key].findMany({ take: 5 });
        console.log("Samples:", samples.map(s => s.nama_lengkap));
      }
    } catch (e) {
      console.log(`Model ${modelName}: Error ${e.message}`);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
