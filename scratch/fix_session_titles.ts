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

  // Rename all "Sesi Ujian" created by this interviewer to "Seleksi Wawancara Orang Tua"
  const result = await prisma.examSession.updateMany({
    where: {
      created_by: interviewer.id,
      title: 'Sesi Ujian'
    },
    data: {
      title: 'Seleksi Wawancara Orang Tua'
    }
  })

  console.log(`Successfully updated ${result.count} sessions for interviewer ${interviewer.full_name}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
