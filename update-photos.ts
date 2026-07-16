import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const photoDir = path.join(process.cwd(), "public/images/Foto Kartu Jajan");
  
  if (!fs.existsSync(photoDir)) {
    console.log("Directory not found:", photoDir);
    return;
  }

  const files = fs.readdirSync(photoDir);
  console.log(`Found ${files.length} photos in the directory.`);
  
  const users = await prisma.user.findMany({
    where: { role: "WALI_SANTRI" },
    include: { Pendaftar: true }
  });

  console.log(`Found ${users.length} Wali Santri users in database.`);

  let updatedCount = 0;

  for (const file of files) {
    const namePart = file.replace(/\.(jpg|png)$/i, "").replace(/-/g, " ").toLowerCase();
    const fileWords = namePart.split(" ");
    
    // Find the best matching user
    let match = null;
    let maxMatches = 0;

    for (const u of users) {
      const pendaftarName = u.Pendaftar[0]?.namaLengkap?.toLowerCase() || "";
      const userName = u.name?.toLowerCase() || "";
      
      let matches = 0;
      for (const word of fileWords) {
        if (word.length > 2 && (pendaftarName.includes(word) || userName.includes(word))) {
          matches++;
        }
      }

      if (matches > maxMatches) {
        maxMatches = matches;
        match = u;
      }
    }

    if (match) {
      const imageUrl = `/images/Foto Kartu Jajan/${file}`;
      await prisma.user.update({
        where: { id: match.id },
        data: { image: imageUrl }
      });
      console.log(`✅ Linked photo: [${file}] ---> to User: [${match.name} / ${match.Pendaftar[0]?.namaLengkap}]`);
      updatedCount++;
    } else {
      console.log(`❌ Could not find a match for photo: [${file}]`);
    }
  }

  console.log(`\nSuccessfully updated ${updatedCount} user profiles with real photos!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
