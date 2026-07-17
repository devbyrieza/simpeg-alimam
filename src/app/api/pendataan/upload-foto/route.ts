import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("foto") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name);
    const fileName = `${uuidv4()}${ext}`;
    
    // Save to public/uploads directory
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await writeFile(path.join(uploadDir, fileName), buffer);

    return NextResponse.json({ success: true, url: `/uploads/${fileName}` });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ success: false, error: "Gagal mengunggah file" }, { status: 500 });
  }
}
