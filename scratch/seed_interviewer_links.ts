import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const interviewerLinks = [
  { email: 'agus@alimam.com', link: 'https://meet.google.com/vos-fdcd-zqe' },
  { email: 'fuad@alimam.com', link: 'https://meet.google.com/osx-ewdg-vra' },
  { email: 'jusman@alimam.com', link: 'https://meet.google.com/wor-fort-xjr' },
  { email: 'muhajir@alimam.com', link: 'https://meet.google.com/kex-txea-cmt' },
  { email: 'syauqi@alimam.com', link: 'https://meet.google.com/tkp-ayhv-mje' },
  { email: 'bachtiar@alimam.com', link: 'https://meet.google.com/zmh-fyxy-ban' },
  { email: 'abah@alimam.com', link: 'https://meet.google.com/xht-twgh-wnh' },
  { email: 'teguh@alimam.com', link: 'https://meet.google.com/axp-nyiw-ttx' },
];

async function main() {
  console.log('🌱 Seeding interviewer Google Meet links...');
  
  for (const item of interviewerLinks) {
    const profile = await prisma.profile.findFirst({
      where: { email: item.email }
    });

    if (profile) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { google_meet_link: item.link }
      });
      console.log(`✅ Updated ${profile.full_name} (${item.email}) with ${item.link}`);
    } else {
      console.log(`⚠️ Profile not found for email: ${item.email}`);
    }
  }

  console.log('✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
