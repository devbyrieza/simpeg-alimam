import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })


const prisma = new PrismaClient()

async function main() {
  const interviewer = await prisma.profile.findFirst({
    where: { email: 'pewawancaracawalsan@alimam.com' }
  })

  if (!interviewer) {
    console.log('Interviewer not found')
    return
  }

  const sessions = await prisma.examSession.findMany({
    where: { created_by: interviewer.id },
    orderBy: { start_time: 'desc' },
    take: 5
  })

  console.log('Interviewer ID:', interviewer.id)
  console.log('Sessions:', JSON.stringify(sessions, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
