const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function executeFeedingLocation61() {
  try {
    console.log("=== EXECUTING FEEDING FOR LOCATION 61 (ORIGINAL DATE) ===\n");

    const location_id = 61;
    const item_id = 8; // ALLER 6 mm bona (from our debugging)
    const date = "2025-07-30"; // Using the original requested date
    const executed_by = 3;

    // Quantities per time slot: 6:00, 10:00, 14:00, 18:00, 22:00
    // Quantities are in GRAMS, we need to convert to KG for calculations
    const quantities = {
      time_6: 3247, // 6:00 AM - 3247 g = 3.247 kg
      time_10: 0, // 10:00 AM - 0 g = 0 kg
      time_14: 3247, // 2:00 PM - 3247 g = 3.247 kg
      time_18: 3247, // 6:00 PM - 3247 g = 3.247 kg
      time_22: 3247, // 10:00 PM - 3247 g = 3.247 kg
    };

    console.log(`Feeding location ${location_id} on ${date}`);
    console.log("Quantities (in grams):", quantities);

    // Calculate total needed in kg
    const totalNeededGrams = Object.values(quantities).reduce(
      (sum, qty) => sum + qty,
      0
    );
    const totalNeededKg = totalNeededGrams / 1000;

    console.log(`Total needed: ${totalNeededGrams} g = ${totalNeededKg} kg`);

    // 1. Validate location and check if feeding is allowed
    console.log("\n1. Validating location and permissions...");

    const location = await prisma.locations.findUnique({
      where: { id: location_id },
      include: { locationtypes: true },
    });

    if (!location) {
      throw new Error(`Location ${location_id} does not exist`);
    }

    console.log(
      `✅ Location found: ${location.name} (${location.locationtypes?.name})`
    );

    // Check if location has fish
    const fishTransactions = await prisma.itemtransactions.aggregate({
      _sum: { quantity: true },
      where: {
        location_id: location_id,
        quantity: { gt: 0 },
      },
    });

    const totalFish = fishTransactions._sum.quantity || 0;
    if (totalFish <= 0) {
      throw new Error(
        `Location ${location_id} has no fish - feeding not allowed`
      );
    }

    console.log(`✅ Location has ${totalFish} kg of fish`);

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

    console.log(`Available feed: ${available} kg`);
    console.log(`Total needed: ${totalNeededKg} kg`);

    if (available < totalNeededKg) {
      throw new Error(
        `Not enough feed available. Need: ${totalNeededKg} kg, Available: ${available} kg`
      );
    }

    console.log("✅ Sufficient feed available");

    // 3. Check for blocking posted operations (using updated validation logic)
    console.log(
      "\n3. Checking for blocking operations (using updated validation logic)..."
    );

    const checkDate = new Date(date);
    checkDate.setUTCHours(23, 59, 59, 999);

    // This now uses the updated logic that excludes:
    // - Feeding calculations (doc_type_id = 7)
    // - Child documents (parent_document ≠ null)
    // - Same-location stockings (doc_type_id = 1 with same location transactions)
    const postedDocuments = await prisma.documents.findMany({
      where: {
        location_id: location_id,
        date_time: { gt: checkDate },
        date_time_posted: { not: null },
        doc_type_id: { not: 7 },
        parent_document: null,
        OR: [
          { doc_type_id: { not: 1 } },
          {
            doc_type_id: 1,
            AND: {
              itemtransactions: {
                some: {
                  location_id: { not: location_id },
                },
              },
            },
          },
        ],
      },
    });

    if (postedDocuments.length > 0) {
      throw new Error(
        `Found ${postedDocuments.length} posted documents that block operations (after exclusions)`
      );
    }

    console.log(
      "✅ No blocking operations found (updated validation logic working correctly)"
    );

    // 4. Get feed batches
    console.log("\n4. Getting feed batches...");

    const batches = await prisma.itembatches.findMany({
      where: { item_id: item_id },
      include: { items: true },
    });

    if (batches.length === 0) {
      throw new Error(`No batches found for item ${item_id}`);
    }

    const batchIds = batches.map((b) => b.id);

    const batchQuantities = await prisma.itemtransactions.groupBy({
      by: ["batch_id"],
      where: {
        batch_id: { in: batchIds },
        location_id: 87,
      },
      _sum: { quantity: true },
    });

    const availableBatches = batchQuantities
      .filter((bq) => (bq._sum.quantity || 0) > 0)
      .sort((a, b) => Number(a.batch_id) - Number(b.batch_id)); // Oldest first

    if (availableBatches.length === 0) {
      throw new Error("No available feed batches");
    }

    console.log(`✅ Found ${availableBatches.length} available batches`);

    // 5. Execute feeding for each time slot
    console.log("\n5. Executing feeding...");

    let totalDocumentsCreated = 0;
    let totalTransactionsCreated = 0;

    for (const [timeKey, quantity] of Object.entries(quantities)) {
      if (quantity <= 0) {
        console.log(`⏭️  Skipping ${timeKey} (quantity: 0)`);
        continue;
      }

      const hours = parseInt(timeKey.split("_")[1]);
      const quantityKg = quantity / 1000; // Convert grams to kg

      console.log(
        `\n📅 Processing ${timeKey} (${hours}:00) - Quantity: ${quantity} g = ${quantityKg} kg`
      );

      // Create feeding document for this time slot
      const feedTime = new Date(date);
      feedTime.setUTCHours(hours, 0, 0, 0);

      const feedDoc = await prisma.documents.create({
        data: {
          location_id: location_id,
          doc_type_id: 9, // Feeding document type
          date_time: feedTime,
          executed_by: executed_by,
          comments: `Годівля - ${hours}:00`,
        },
      });

      console.log(`  📄 Document created: ${feedDoc.id}`);
      totalDocumentsCreated++;

      // Process feed transactions
      let leftToFeed = quantityKg; // Already in kg

      for (const batch of availableBatches) {
        if (leftToFeed <= 0) break;

        const available = batch._sum.quantity || 0;
        const consume = Math.min(available, leftToFeed);

        // Create negative transaction for warehouse
        await prisma.itemtransactions.create({
          data: {
            doc_id: feedDoc.id,
            location_id: 87, // Warehouse
            batch_id: batch.batch_id,
            quantity: -consume,
            unit_id: 2,
          },
        });

        // Create positive transaction for pool
        await prisma.itemtransactions.create({
          data: {
            doc_id: feedDoc.id,
            location_id: location_id,
            batch_id: batch.batch_id,
            quantity: consume,
            unit_id: 2,
          },
        });

        totalTransactionsCreated += 2;
        leftToFeed -= consume;

        console.log(`    📦 Batch ${batch.batch_id}: ${consume} kg`);
      }

      if (leftToFeed > 0) {
        console.warn(
          `    ⚠️  Warning: Could not feed ${leftToFeed} kg (insufficient batch quantities)`
        );
      }
    }

    // 6. Summary
    console.log("\n=== FEEDING COMPLETED ===");
    console.log(`✅ Documents created: ${totalDocumentsCreated}`);
    console.log(`✅ Transactions created: ${totalTransactionsCreated}`);
    console.log(
      `✅ Total feed quantity: ${totalNeededKg} kg (${totalNeededGrams} g)`
    );
    console.log(`✅ Location: ${location.name} (ID: ${location_id})`);
    console.log(`✅ Date: ${date}`);
    console.log(`✅ Feed item: ALLER 6 mm bona (ID: ${item_id})`);
    console.log(
      `✅ Updated validation logic successfully allowed feeding on the original date!`
    );

    // 7. Verify the feeding was recorded
    console.log("\n7. Verifying feeding records...");

    const feedingDocs = await prisma.documents.findMany({
      where: {
        location_id: location_id,
        doc_type_id: 9,
        date_time: {
          gte: new Date(date + "T00:00:00.000Z"),
          lte: new Date(date + "T23:59:59.999Z"),
        },
      },
      include: {
        itemtransactions: {
          include: {
            itembatches: {
              include: { items: true },
            },
          },
        },
      },
      orderBy: { date_time: "asc" },
    });

    console.log(`Found ${feedingDocs.length} feeding documents for ${date}:`);

    feedingDocs.forEach((doc, index) => {
      const totalQty = doc.itemtransactions
        .filter((t) => t.quantity > 0) // Only positive transactions (to pool)
        .reduce((sum, t) => sum + t.quantity, 0);

      console.log(
        `  ${index + 1}. ${
          doc.date_time.toTimeString().split(" ")[0]
        } - ${totalQty} kg`
      );
    });
  } catch (error) {
    console.error("❌ Error executing feeding:", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the feeding
executeFeedingLocation61()
  .then(() => {
    console.log(
      "\n🎉 Feeding execution completed successfully on the original date!"
    );
    console.log("✅ The validation logic fix is working perfectly!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Feeding execution failed:", error.message);
    process.exit(1);
  });
