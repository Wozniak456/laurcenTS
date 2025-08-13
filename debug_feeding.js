const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function debugFeeding() {
  console.log("=== DEBUGGING FEEDING ISSUES ===\n");

  try {
    // Check location 61
    const location = await prisma.locations.findUnique({
      where: { id: 61 },
    });

    if (!location) {
      console.log("❌ Location 61 does not exist!");
      return;
    }

    console.log("✅ Location 61 found:", location.name);

    // Check if location 61 is filled with fish
    console.log("\n1. Checking fish in location 61...");
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
      return;
    } else {
      console.log("✅ Location 61 has fish - feeding should be allowed");
    }

    // Check feed availability
    console.log("\n2. Checking feed availability...");
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

    // Check recent feeding documents
    console.log("\n3. Checking recent feeding documents...");
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const feedingDocs = await prisma.documents.findMany({
      where: {
        location_id: 61,
        doc_type_id: 9,
        date_time: { gte: startOfDay },
      },
      include: {
        itemtransactions: true,
      },
    });

    console.log(`Found ${feedingDocs.length} feeding documents for today`);

    if (feedingDocs.length > 0) {
      console.log("Latest document:", {
        id: feedingDocs[0].id,
        date_time: feedingDocs[0].date_time,
        transactions: feedingDocs[0].itemtransactions.length,
      });
    }

    // Check for any posted operations that might block feeding
    console.log("\n4. Checking for blocking posted operations...");
    const postedDocs = await prisma.documents.findMany({
      where: {
        location_id: 61,
        date_time_posted: {
          not: null,
        },
        date_time: {
          gt: startOfDay,
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
    } else {
      console.log("✅ No blocking posted operations found");
    }

    // Check if there are any database constraints or issues
    console.log("\n5. Checking database constraints...");

    // Check if there are any foreign key issues
    const constraintCheck = await prisma.$queryRaw`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name IN ('documents', 'itemtransactions')
    `;

    console.log("Foreign key constraints:", constraintCheck);

    // Check if there are any recent errors or failed transactions
    console.log("\n6. Checking for recent errors or failed transactions...");

    // Check if there are any documents with errors
    const errorDocs = await prisma.documents.findMany({
      where: {
        location_id: 61,
        date_time: { gte: startOfDay },
      },
      include: {
        itemtransactions: true,
      },
      orderBy: {
        date_time: "desc",
      },
    });

    console.log(`Total documents for location 61 today: ${errorDocs.length}`);

    if (errorDocs.length > 0) {
      console.log("Recent documents:");
      errorDocs.forEach((doc, index) => {
        console.log(
          `  ${index + 1}. Doc ID: ${doc.id}, Type: ${doc.doc_type_id}, Date: ${
            doc.date_time
          }, Transactions: ${doc.itemtransactions.length}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error during debugging:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugFeeding();
