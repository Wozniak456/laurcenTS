const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testCalculationTableStructure() {
  try {
    console.log("=== TESTING CALCULATION_TABLE STRUCTURE ===\n");

    // 1. Check if calculation_table exists and its structure
    console.log("1. Checking calculation_table structure...");

    try {
      // Try to query calculation_table directly
      const calcTableCount =
        await prisma.$queryRaw`SELECT COUNT(*) as count FROM calculation_table`;
      console.log("✅ calculation_table exists");
      console.log("Row count:", calcTableCount);

      // Get sample data
      const sampleCalcData =
        await prisma.$queryRaw`SELECT * FROM calculation_table LIMIT 3`;
      console.log("Sample calculation_table data:", sampleCalcData);
    } catch (error) {
      console.log(
        "❌ calculation_table not accessible via Prisma:",
        error.message
      );
    }

    // 2. Check the specific document mentioned (ID 48549)
    console.log("\n2. Checking document ID 48549...");

    const document48549 = await prisma.documents.findUnique({
      where: { id: 48549 },
      include: {
        doctype: true,
      },
    });

    if (document48549) {
      console.log("✅ Document 48549 found:");
      console.log(`   ID: ${document48549.id}`);
      console.log(
        `   Type: ${document48549.doctype?.name} (ID: ${document48549.doc_type_id})`
      );
      console.log(`   Date: ${document48549.date_time}`);
      console.log(`   Posted: ${document48549.date_time_posted}`);
      console.log(`   Location: ${document48549.location_id}`);
      console.log(`   Parent Document: ${document48549.parent_document}`);
    } else {
      console.log("❌ Document 48549 not found");
    }

    // 3. Check for documents with parent_document = 48549
    console.log("\n3. Checking documents with parent_document = 48549...");

    const childDocuments = await prisma.documents.findMany({
      where: { parent_document: 48549 },
      include: {
        doctype: true,
      },
    });

    console.log(`Found ${childDocuments.length} child documents:`);
    childDocuments.forEach((doc, index) => {
      console.log(
        `  ${index + 1}. ID: ${doc.id}, Type: ${doc.doctype?.name} (${
          doc.doc_type_id
        }), Date: ${doc.date_time}, Posted: ${doc.date_time_posted}`
      );
    });

    // 4. Check for feeding calculation documents (doc_type_id = 7)
    console.log(
      "\n4. Checking feeding calculation documents (doc_type_id = 7)..."
    );

    const feedingCalcDocs = await prisma.documents.findMany({
      where: {
        doc_type_id: 7,
        location_id: 61,
      },
      include: {
        doctype: true,
      },
      orderBy: { date_time: "desc" },
      take: 5,
    });

    console.log(
      `Found ${feedingCalcDocs.length} feeding calculation documents for location 61:`
    );
    feedingCalcDocs.forEach((doc, index) => {
      console.log(
        `  ${index + 1}. ID: ${doc.id}, Date: ${doc.date_time}, Posted: ${
          doc.date_time_posted
        }, Parent: ${doc.parent_document}`
      );
    });

    // 5. Check for documents that might be blocking July 30, 2025
    console.log("\n5. Checking documents that might block July 30, 2025...");

    const checkDate = new Date("2025-07-30");
    checkDate.setUTCHours(23, 59, 59, 999);

    const blockingDocs = await prisma.documents.findMany({
      where: {
        location_id: 61,
        date_time: { gt: checkDate },
        date_time_posted: { not: null },
      },
      include: {
        doctype: true,
      },
      orderBy: { date_time: "asc" },
    });

    console.log(`Found ${blockingDocs.length} blocking documents:`);
    blockingDocs.forEach((doc, index) => {
      console.log(
        `  ${index + 1}. ID: ${doc.id}, Type: ${doc.doctype?.name} (${
          doc.doc_type_id
        }), Date: ${doc.date_time}, Posted: ${doc.date_time_posted}, Parent: ${
          doc.parent_document
        }`
      );
    });
  } catch (error) {
    console.error("❌ Error testing calculation table structure:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testCalculationTableStructure();
