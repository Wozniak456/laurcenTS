const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testValidationForDate20250729() {
  try {
    console.log("=== TESTING VALIDATION FOR DATE 2025-07-29 ===\n");

    const location_id = 61;
    const date = "2025-07-29";

    console.log(`Testing location ${location_id} for date ${date}`);

    // 1. Test the OLD logic (what was blocking before)
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

    // 2. Test the NEW logic (excluding recalculations, child documents, and same-location stockings)
    console.log(
      "\n2. Testing NEW validation logic (excluding recalculations, child documents, and same-location stockings)..."
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
        // Exclude stocking documents that only reorganize existing fish
        OR: [
          { doc_type_id: { not: 1 } }, // Not a stocking document
          {
            doc_type_id: 1, // Is a stocking document
            AND: {
              // But has transactions with different location_id (meaning new fish added)
              itemtransactions: {
                some: {
                  location_id: { not: location_id },
                },
              },
            },
          },
        ],
      },
      include: {
        doctype: true,
        itemtransactions: {
          select: {
            location_id: true,
            quantity: true,
          },
        },
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
      if (doc.itemtransactions && doc.itemtransactions.length > 0) {
        console.log(
          `     Transactions: ${doc.itemtransactions
            .map((t) => `Location ${t.location_id}: ${t.quantity}`)
            .join(", ")}`
        );
      }
    });

    // 3. Show what was excluded
    console.log("\n3. Documents excluded by NEW logic:");

    const excludedDocs = oldBlockingDocs.filter(
      (oldDoc) => !newBlockingDocs.some((newDoc) => newDoc.id === oldDoc.id)
    );

    if (excludedDocs.length > 0) {
      console.log(`Excluded ${excludedDocs.length} documents:`);
      excludedDocs.forEach((doc, index) => {
        let reason = "";
        if (doc.doc_type_id === 7) {
          reason = "Feeding calculation (recalculation)";
        } else if (doc.parent_document) {
          reason = "Child document (derived operation)";
        } else if (doc.doc_type_id === 1) {
          reason =
            "Stocking document (same location - reorganizing existing fish)";
        } else {
          reason = "Other";
        }
        console.log(
          `  ${index + 1}. ID: ${doc.id}, Type: ${doc.doctype?.name} (${
            doc.doc_type_id
          }), Reason: ${reason}`
        );
      });
    } else {
      console.log("No documents were excluded");
    }

    // 4. Conclusion for 2025-07-29
    console.log("\n4. Conclusion for 2025-07-29:");
    if (newBlockingDocs.length === 0) {
      console.log("✅ NEW logic: Operations are ALLOWED on this date");
      console.log("✅ Feeding can proceed on 2025-07-29");
    } else {
      console.log("❌ NEW logic: Operations are BLOCKED on this date");
      console.log("❌ Feeding cannot proceed on 2025-07-29");
      console.log("\n📋 Blocking documents:");
      newBlockingDocs.forEach((doc, index) => {
        console.log(
          `  ${index + 1}. ${doc.doctype?.name} (${doc.doc_type_id}) - ${
            doc.date_time.toISOString().split("T")[0]
          }`
        );
        if (doc.doc_type_id === 1) {
          console.log(
            `     This is a stocking document - checking if it has different location transactions...`
          );
          const hasDifferentLocationTransactions = doc.itemtransactions.some(
            (t) => t.location_id !== location_id
          );
          if (hasDifferentLocationTransactions) {
            console.log(
              `     ❌ Has transactions with different locations - SHOULD BLOCK operations`
            );
          } else {
            console.log(
              `     ✅ Only has transactions with same location - SHOULD BE EXCLUDED`
            );
            console.log(
              `     ⚠️  This suggests a potential issue with the validation logic`
            );
          }
        }
      });
    }

    // 5. Comparison with 2025-07-30
    console.log("\n5. Comparison with 2025-07-30:");
    console.log(`Date 2025-07-30: 0 blocking documents (✅ ALLOWED)`);
    console.log(
      `Date 2025-07-29: ${newBlockingDocs.length} blocking documents (${
        newBlockingDocs.length === 0 ? "✅ ALLOWED" : "❌ BLOCKED"
      })`
    );

    if (newBlockingDocs.length > 0) {
      console.log("\n🔍 Analysis:");
      console.log(
        "The date 2025-07-29 is EARLIER than 2025-07-30, so it should have"
      );
      console.log(
        "FEWER or EQUAL blocking documents. If it has MORE blocking documents,"
      );
      console.log(
        "this suggests there might be documents between these dates that"
      );
      console.log("are not being properly excluded by our validation logic.");
    }
  } catch (error) {
    console.error("❌ Error testing validation for 2025-07-29:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testValidationForDate20250729();
