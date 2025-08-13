const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testGetFeedBatch() {
  try {
    console.log("=== TESTING getFeedBatchByItemId ===\n");

    const item_id = 8; // ALLER 6 mm bona
    const quantity = 1000; // 1 kg in grams

    console.log(`Testing with item_id: ${item_id}, quantity: ${quantity}`);

    // Import the function
    const {
      getFeedBatchByItemId,
    } = require("./src/actions/crutial/getFeedBatchByItemId.ts");

    try {
      const result = await getFeedBatchByItemId(item_id, quantity);
      console.log("✅ Function returned:", result);
    } catch (error) {
      console.log("❌ Function threw error:", error.message);
    }
  } catch (error) {
    console.error("❌ Error during testing:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testGetFeedBatch();
