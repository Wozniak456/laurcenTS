const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testUpdatedValidation() {
  try {
    console.log("=== TESTING UPDATED VALIDATION LOGIC ===\n");

    const location_id = 61;
    const date = "2025-07-30";

    console.log(`Testing location ${location_id} for date ${date}`);

    // 1. Test the old logic (what was blocking before)
    console.log(
      "\n1. Testing OLD validation logic (what was blocking before)..."
    );

    const checkDate = new Date(date);
    checkDate.setUTCHours(23, 59, 59, 999);

    const oldBlockingDocs = await prisma.documents.findMany({
      where: {
        location_id: location_id,
        date_time: { gt: checkDate },
        date_time_posted: { not: null },
      },
      include: {
        doctype: true,
      },
      orderBy: { date_time: "asc" },
    });

    console.log(
      `OLD logic found ${oldBlockingDocs.length} blocking documents:`
    );
    oldBlockingDocs.forEach((doc, index) => {
      console.log(
        `  ${index + 1}. ID: ${doc.id}, Type: ${doc.doctype?.name} (${
          doc.doc_type_id
        }), Date: ${doc.date_time}, Posted: ${doc.date_time_posted}, Parent: ${
          doc.parent_document
        }`
      );
    });

    // 2. Test the NEW logic (excluding recalculations and child documents)
    console.log(
      "\n2. Testing NEW validation logic (excluding recalculations and child documents)..."
    );

    const newBlockingDocs = await prisma.documents.findMany({
      where: {
        location_id: location_id,
        date_time: { gt: checkDate },
        date_time_posted: { not: null },
        // Exclude feeding calculation documents (recalculations)
        doc_type_id: { not: 7 },
        // Exclude child documents (derived operations)
        parent_document: null,
      },
      include: {
        doctype: true,
      },
      orderBy: { date_time: "asc" },
    });

    console.log(
      `NEW logic found ${newBlockingDocs.length} blocking documents:`
    );
    newBlockingDocs.forEach((doc, index) => {
      console.log(
        `  ${index + 1}. ID: ${doc.id}, Type: ${doc.doctype?.name} (${
          doc.doc_type_id
        }), Date: ${doc.date_time}, Posted: ${doc.date_time_posted}, Parent: ${
          doc.parent_document
        }`
      );
    });

    // 3. Show what was excluded
    console.log("\n3. Documents excluded by NEW logic:");

    const excludedDocs = oldBlockingDocs.filter(
      (oldDoc) => !newBlockingDocs.some((newDoc) => newDoc.id === oldDoc.id)
    );

    if (excludedDocs.length > 0) {
      console.log(`Excluded ${excludedDocs.length} documents:`);
      excludedDocs.forEach((doc, index) => {
        const reason =
          doc.doc_type_id === 7
            ? "Feeding calculation (recalculation)"
            : doc.parent_document
            ? "Child document (derived operation)"
            : "Other";
        console.log(
          `  ${index + 1}. ID: ${doc.id}, Type: ${doc.doctype?.name} (${
            doc.doc_type_id
          }), Reason: ${reason}`
        );
      });
    } else {
      console.log("No documents were excluded");
    }

    // 4. Conclusion
    console.log("\n4. Conclusion:");
    if (newBlockingDocs.length === 0) {
      console.log("✅ NEW logic: Operations are ALLOWED on this date");
      console.log("✅ Feeding can proceed on 2025-07-30");
    } else {
      console.log("❌ NEW logic: Operations are still BLOCKED on this date");
      console.log("❌ Feeding cannot proceed on 2025-07-30");
    }

    if (oldBlockingDocs.length > 0 && newBlockingDocs.length === 0) {
      console.log("\n🎉 SUCCESS: The validation logic has been fixed!");
      console.log(
        "Feeding calculations and child documents no longer block operations."
      );
    }
  } catch (error) {
    console.error("❌ Error testing updated validation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testUpdatedValidation();
