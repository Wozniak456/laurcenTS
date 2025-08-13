const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testFeeding() {
  try {
    console.log("=== TESTING FEEDING PROCESS ===\n");

    const location_id = 61;
    const item_id = 8; // ALLER 6 mm bona (from the debug output)
    const today = new Date().toISOString().split("T")[0];

    console.log(
      `Testing feeding for location ${location_id}, item ${item_id}, date ${today}`
    );

    // 1. Check if pool operations are allowed
    console.log("\n1. Checking if pool operations are allowed...");

    // Check for posted operations after this date
    const postedDocs = await prisma.documents.findMany({
      where: {
        location_id: location_id,
        date_time_posted: {
          not: null,
        },
        date_time: {
          gt: new Date(today + "T23:59:59.999Z"),
        },
      },
      select: {
        id: true,
        doc_type_id: true,
        date_time: true,
        date_time_posted: true,
      },
    });

    if (postedDocs.length > 0) {
      console.log(
        `❌ Found ${postedDocs.length} posted documents that block operations:`
      );
      postedDocs.forEach((doc) => {
        console.log(
          `  - Doc ID: ${doc.id}, Type: ${doc.doc_type_id}, Date: ${doc.date_time}, Posted: ${doc.date_time_posted}`
        );
      });
      return;
    } else {
      console.log("✅ No blocking posted operations found");
    }

    // 2. Check feed availability
    console.log("\n2. Checking feed availability...");

    const feedStock = await prisma.itemtransactions.aggregate({
      _sum: { quantity: true },
      where: {
        location_id: 87, // Warehouse
        itembatches: {
          item_id: item_id,
        },
        quantity: { gt: 0 },
      },
    });

    const available = feedStock._sum.quantity || 0;
    console.log(`Available feed for item ${item_id}: ${available} kg`);

    if (available <= 0) {
      console.log("❌ No feed available");
      return;
    }

    // 3. Check if we can create a document
    console.log("\n3. Testing document creation...");

    try {
      const testDoc = await prisma.documents.create({
        data: {
          location_id: location_id,
          doc_type_id: 9, // Feeding document type
          date_time: new Date(),
          executed_by: 3,
          comments: "TEST FEEDING",
        },
      });

      console.log(`✅ Test document created with ID: ${testDoc.id}`);

      // Clean up test document
      await prisma.documents.delete({
        where: { id: testDoc.id },
      });

      console.log("✅ Test document cleaned up");
    } catch (error) {
      console.log(`❌ Failed to create test document: ${error.message}`);
      return;
    }

    // 4. Check if we can create transactions
    console.log("\n4. Testing transaction creation...");

    try {
      // Create a test document first
      const testDoc = await prisma.documents.create({
        data: {
          location_id: location_id,
          doc_type_id: 9,
          date_time: new Date(),
          executed_by: 3,
          comments: "TEST FEEDING TRANSACTIONS",
        },
      });

      // Find a batch for this item
      const batches = await prisma.itembatches.findMany({
        where: { item_id: item_id },
        take: 1,
      });

      if (batches.length === 0) {
        console.log("❌ No batches found for this item");
        await prisma.documents.delete({ where: { id: testDoc.id } });
        return;
      }

      const batch_id = batches[0].id;
      console.log(`Using batch ID: ${batch_id}`);

      // Test creating a negative transaction (warehouse)
      const negTran = await prisma.itemtransactions.create({
        data: {
          doc_id: testDoc.id,
          location_id: 87, // Warehouse
          batch_id: batch_id,
          quantity: -0.1, // Small test quantity
          unit_id: 2,
        },
      });

      console.log(`✅ Negative transaction created: ${negTran.id}`);

      // Test creating a positive transaction (pool)
      const posTran = await prisma.itemtransactions.create({
        data: {
          doc_id: testDoc.id,
          location_id: location_id,
          batch_id: batch_id,
          quantity: 0.1, // Small test quantity
          unit_id: 2,
        },
      });

      console.log(`✅ Positive transaction created: ${posTran.id}`);

      // Clean up test data
      await prisma.itemtransactions.deleteMany({
        where: { doc_id: testDoc.id },
      });

      await prisma.documents.delete({
        where: { id: testDoc.id },
      });

      console.log("✅ Test transactions cleaned up");
    } catch (error) {
      console.log(`❌ Failed to create test transactions: ${error.message}`);
      return;
    }

    console.log(
      "\n✅ All tests passed! Feeding should work for this location."
    );
  } catch (error) {
    console.error("❌ Error during testing:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testFeeding();
