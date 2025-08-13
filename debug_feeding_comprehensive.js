const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function debugFeedingComprehensive() {
  try {
    console.log("=== COMPREHENSIVE FEEDING DEBUG ===\n");

    const location_id = 61;
    const item_id = 8; // ALLER 6 mm bona
    const today = new Date().toISOString().split("T")[0];

    console.log(
      `Testing feeding for location ${location_id}, item ${item_id}, date ${today}`
    );

    // 1. Check location details
    console.log("\n1. Location details...");
    const location = await prisma.locations.findUnique({
      where: { id: location_id },
      include: {
        locationtypes: true,
        pools: true,
      },
    });

    if (!location) {
      console.log("❌ Location 61 does not exist!");
      return;
    }

    console.log("✅ Location found:", {
      id: location.id,
      name: location.name,
      location_type: location.locationtypes?.name,
      pool_id: location.pool_id,
    });

    // 2. Check if location is filled with fish
    console.log("\n2. Checking fish in location...");
    const fishTransactions = await prisma.itemtransactions.aggregate({
      _sum: { quantity: true },
      where: {
        location_id: location_id,
        quantity: { gt: 0 },
      },
    });

    const totalFish = fishTransactions._sum.quantity || 0;
    console.log(`Total fish in location: ${totalFish} kg`);

    if (totalFish <= 0) {
      console.log("❌ Location has no fish - feeding not allowed");
      return;
    }

    // 3. Check feed availability
    console.log("\n3. Checking feed availability...");
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

    // 4. Check for posted operations that might block feeding
    console.log("\n4. Checking for blocking posted operations...");

    // Simulate the isPoolOperationsAllowed check
    const checkDate = new Date(today);
    checkDate.setUTCHours(23, 59, 59, 999);

    const postedDocuments = await prisma.documents.findMany({
      where: {
        location_id: location_id,
        date_time: {
          gt: checkDate,
        },
        date_time_posted: {
          not: null,
        },
      },
      select: {
        id: true,
        doc_type_id: true,
        date_time: true,
        date_time_posted: true,
      },
    });

    if (postedDocuments.length > 0) {
      console.log(
        `❌ Found ${postedDocuments.length} posted documents that block operations:`
      );
      postedDocuments.forEach((doc) => {
        console.log(
          `  - Doc ID: ${doc.id}, Type: ${doc.doc_type_id}, Date: ${doc.date_time}, Posted: ${doc.date_posted}`
        );
      });
      return;
    } else {
      console.log("✅ No blocking posted operations found");
    }

    // 5. Test the getFeedBatchByItemId function
    console.log("\n5. Testing getFeedBatchByItemId function...");

    try {
      // Import the function (this might fail in Node.js environment)
      const {
        getFeedBatchByItemId,
      } = require("./src/actions/crutial/getFeedBatchByItemId.ts");

      const batches = await getFeedBatchByItemId(item_id, 1000); // 1 kg
      console.log("✅ getFeedBatchByItemId returned:", batches);
    } catch (error) {
      console.log("❌ getFeedBatchByItemId failed:", error.message);

      // Test the logic manually
      console.log("\n   Testing batch logic manually...");

      const batches = await prisma.itembatches.findMany({
        where: { item_id: item_id },
        include: { items: true },
      });

      console.log(`   Found ${batches.length} batches for item ${item_id}`);

      if (batches.length > 0) {
        const batchIds = batches.map((b) => b.id);

        const batchQuantities = await prisma.itemtransactions.groupBy({
          by: ["batch_id"],
          where: {
            batch_id: { in: batchIds },
            location_id: 87,
          },
          _sum: { quantity: true },
        });

        console.log("   Batch quantities:", batchQuantities);

        const availableBatches = batchQuantities.filter(
          (bq) => (bq._sum.quantity || 0) > 0
        );
        console.log(`   Available batches: ${availableBatches.length}`);

        if (availableBatches.length > 0) {
          console.log("   ✅ Feed batches are available");
        } else {
          console.log("   ❌ No available feed batches");
        }
      }
    }

    // 6. Test document and transaction creation
    console.log("\n6. Testing document and transaction creation...");

    try {
      // Create a test document
      const testDoc = await prisma.documents.create({
        data: {
          location_id: location_id,
          doc_type_id: 9,
          date_time: new Date(),
          executed_by: 3,
          comments: "TEST FEEDING DEBUG",
        },
      });

      console.log(`✅ Test document created: ${testDoc.id}`);

      // Find a batch
      const batches = await prisma.itembatches.findMany({
        where: { item_id: item_id },
        take: 1,
      });

      if (batches.length > 0) {
        const batch_id = batches[0].id;

        // Create test transactions
        const negTran = await prisma.itemtransactions.create({
          data: {
            doc_id: testDoc.id,
            location_id: 87,
            batch_id: batch_id,
            quantity: -0.1,
            unit_id: 2,
          },
        });

        const posTran = await prisma.itemtransactions.create({
          data: {
            doc_id: testDoc.id,
            location_id: location_id,
            batch_id: batch_id,
            quantity: 0.1,
            unit_id: 2,
          },
        });

        console.log(
          `✅ Test transactions created: ${negTran.id}, ${posTran.id}`
        );

        // Clean up
        await prisma.itemtransactions.deleteMany({
          where: { doc_id: testDoc.id },
        });

        await prisma.documents.delete({
          where: { id: testDoc.id },
        });

        console.log("✅ Test data cleaned up");
      }
    } catch (error) {
      console.log(`❌ Document/transaction creation failed: ${error.message}`);
    }

    console.log("\n=== DEBUGGING COMPLETE ===");
    console.log(
      "If all tests passed, the issue might be in the frontend form submission or data format."
    );
  } catch (error) {
    console.error("❌ Error during debugging:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugFeedingComprehensive();
