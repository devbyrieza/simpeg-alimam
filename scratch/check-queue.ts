import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function main() {
  const pending = await prisma.whatsappLog.findMany({
    where: { status: 'pending' },
    orderBy: { created_at: 'desc' },
    take: 10
  })
  
  console.log('--- 10 PENDING MESSAGES ---')
  console.log(JSON.stringify(pending, null, 2))
  
  const totalPending = await prisma.whatsappLog.count({ where: { status: 'pending' } })
  console.log('\nTOTAL PENDING:', totalPending)
}

main()
  .catch(e => {
    console.error('ERROR during script execution:')
    console.error(e)
  })
  .finally(() => prisma.$disconnect())
