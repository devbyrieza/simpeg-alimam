import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function main() {
  const genders = await prisma.pendaftar.groupBy({
    by: ['jenis_kelamin'],
    _count: {
      jenis_kelamin: true
    }
  })
  console.log('Gender distribution:', JSON.stringify(genders, null, 2))

  const provinsis = await prisma.pendaftar.groupBy({
    by: ['provinsi'],
    _count: {
      provinsi: true
    }
  })
  console.log('Provinsi distribution:', JSON.stringify(provinsis, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
