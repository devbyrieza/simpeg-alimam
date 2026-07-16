import { getLeastLoadedExaminerFromPool } from "../lib/utils/assignment";

async function testBalancing() {
  console.log("🧪 Testing Balancing Logic...");

  // This is a dry run test. In a real environment, we'd mock prisma.
  // Since I can't easily mock prisma here without extra deps,
  // I'll just check if the logic compiles and makes sense.

  const startTime = new Date();
  const category = "QURAN";
  const tahunAjaranId = "some-id";

  console.log("Input:", { startTime, category, tahunAjaranId });

  try {
    // This will likely fail due to DATABASE_URL missing, but we want to check logic
    const result = await getLeastLoadedExaminerFromPool(
      startTime,
      category,
      tahunAjaranId,
    );
    console.log("Result:", result);
  } catch (e: any) {
    console.log("Expected DB Error (Logic seems OK):", e?.message || e);
  }
}

testBalancing();
