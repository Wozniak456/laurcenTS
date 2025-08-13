const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function debugFeedingLocation61() {
  console.log("=== DEBUGGING FEEDING FOR LOCATION 61 ===\n");

  try {
    // 1. Check if location 61 exists and its properties
    console.log("1. Checking location 61 properties...");
    const location = await prisma.locations.findUnique({
      where: { id: 61 },
      include: {
        locationtypes: true,
        pools: true,
      },
    });

    if (!location) {
      console.log("❌ Location 61 does not exist!");
      return;
    }

    console.log("✅ Location 61 found:", {
      id: location.id,
      name: location.name,
      location_type_id: location.location_type_id,
      pool_id: location.pool_id,
      locationType: location.locationtypes?.name,
    });

    // 2. Check if location 61 has any recent feeding documents
    console.log("\n2. Checking recent feeding documents for location 61...");
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );

    const feedingDocs = await prisma.documents.findMany({
      where: {
        location_id: 61,
        doc_type_id: 9, // Feeding document type
        date_time: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        itemtransactions: {
          include: {
            itembatches: {
              include: {
                items: true,
              },
            },
          },
        },
      },
      orderBy: {
        date_time: "desc",
      },
    });

    console.log(`Found ${feedingDocs.length} feeding documents for today`);

    if (feedingDocs.length > 0) {
      console.log("Latest feeding document:", {
        id: feedingDocs[0].id,
        date_time: feedingDocs[0].date_time,
        executed_by: feedingDocs[0].executed_by,
        comments: feedingDocs[0].comments,
        transactions: feedingDocs[0].itemtransactions.length,
      });

      // Check transactions
      feedingDocs[0].itemtransactions.forEach((tran, index) => {
        console.log(`  Transaction ${index + 1}:`, {
          id: tran.id,
          location_id: tran.location_id,
          batch_id: tran.batch_id,
          quantity: tran.quantity,
          unit_id: tran.unit_id,
          item_name: tran.itembatches?.items?.name,
        });
      });
    }

    // 3. Check if there are any posted operations after today that might block feeding
    console.log(
      "\n3. Checking for posted operations that might block feeding..."
    );
    const postedDocs = await prisma.documents.findMany({
      where: {
        location_id: 61,
        date_time_posted: {
          not: null,
        },
        date_time: {
          gt: endOfDay,
        },
      },
      select: {
        id: true,
        doc_type_id: true,
        date_time: true,
        date_time_posted: true,
      },
      orderBy: {
        date_time: "asc",
      },
    });

    if (postedDocs.length > 0) {
      console.log(
        `❌ Found ${postedDocs.length} posted documents after today that block operations:`
      );
      postedDocs.forEach((doc) => {
        console.log(
          `  - Doc ID: ${doc.id}, Type: ${doc.doc_type_id}, Date: ${doc.date_time}, Posted: ${doc.date_time_posted}`
        );
      });
    } else {
      console.log("✅ No blocking posted operations found");
    }

    // 4. Check if location 61 is filled (has fish)
    console.log("\n4. Checking if location 61 is filled with fish...");
    const fishTransactions = await prisma.itemtransactions.aggregate({
      _sum: { quantity: true },
      where: {
        location_id: 61,
        quantity: { gt: 0 },
      },
    });

    const totalFish = fishTransactions._sum.quantity || 0;
    console.log(`Total fish in location 61: ${totalFish}`);

    if (totalFish <= 0) {
      console.log("❌ Location 61 has no fish - feeding not allowed");
    } else {
      console.log("✅ Location 61 has fish - feeding should be allowed");
    }

    // 5. Check feed availability for common feed items
    console.log("\n5. Checking feed availability...");
    const feedItems = await prisma.items.findMany({
      where: {
        item_type_id: 3, // Feed items
      },
      select: {
        id: true,
        name: true,
      },
    });

    console.log(`Found ${feedItems.length} feed items`);

    for (const item of feedItems) {
      const feedStock = await prisma.itemtransactions.aggregate({
        _sum: { quantity: true },
        where: {
          location_id: 87, // Warehouse
          itembatches: {
            item_id: item.id,
          },
          quantity: { gt: 0 },
        },
      });

      const available = feedStock._sum.quantity || 0;
      console.log(`  ${item.name} (ID: ${item.id}): ${available} kg available`);
    }

    // 6. Check for any database constraints or triggers
    console.log("\n6. Checking for potential database issues...");

    // Check if there are any recent errors in the database
    const recentErrors = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE tablename IN ('documents', 'itemtransactions', 'itembatches')
      AND schemaname = 'public'
    `;

    console.log("Database statistics for relevant tables:", recentErrors);
  } catch (error) {
    console.error("❌ Error during debugging:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug function
debugFeedingLocation61().catch(console.error);
