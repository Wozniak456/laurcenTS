const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testUpdatedValidationWithStocking() {
  try {
    console.log("=== TESTING UPDATED VALIDATION WITH STOCKING LOGIC ===\n");

    const location_id = 61;
    const date = "2025-07-30";

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

    // 4. Check the specific stocking document (ID 48549) to see its transactions
    console.log("\n4. Analyzing stocking document ID 48549:");

    const stockingDoc = await prisma.documents.findUnique({
      where: { id: 48549 },
      include: {
        doctype: true,
        itemtransactions: {
          select: {
            location_id: true,
            quantity: true,
            batch_id: true,
          },
        },
      },
    });

    if (stockingDoc) {
      console.log(`Document ID: ${stockingDoc.id}`);
      console.log(
        `Type: ${stockingDoc.doctype?.name} (${stockingDoc.doc_type_id})`
      );
      console.log(`Date: ${stockingDoc.date_time}`);
      console.log(`Location: ${stockingDoc.location_id}`);
      console.log(`Transactions: ${stockingDoc.itemtransactions.length}`);

      stockingDoc.itemtransactions.forEach((tran, tIndex) => {
        console.log(
          `  Transaction ${tIndex + 1}: Location ${
            tran.location_id
          }, Quantity ${tran.quantity}, Batch ${tran.batch_id}`
        );
      });

      // Check if this stocking document should be excluded
      const hasDifferentLocationTransactions =
        stockingDoc.itemtransactions.some((t) => t.location_id !== location_id);
      if (hasDifferentLocationTransactions) {
        console.log(
          `  ❌ This stocking document has transactions with different locations - SHOULD BLOCK operations`
        );
      } else {
        console.log(
          `  ✅ This stocking document only has transactions with same location - SHOULD BE EXCLUDED from blocking`
        );
      }
    }

    // 5. Conclusion
    console.log("\n5. Conclusion:");
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
        "Feeding calculations, child documents, and same-location stockings no longer block operations."
      );
    }
  } catch (error) {
    console.error("❌ Error testing updated validation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testUpdatedValidationWithStocking();
