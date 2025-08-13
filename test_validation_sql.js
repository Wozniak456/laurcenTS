const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testValidationSQL() {
  try {
    console.log("=== VALIDATION LOGIC AS SQL QUERY ===\n");

    const location_id = 61;
    const date = "2025-07-30";

    console.log(`Location ID: ${location_id}`);
    console.log(`Check Date: ${date}`);
    console.log(`Check DateTime: ${new Date(date).toISOString()}`);

    // Show the exact SQL query that would be executed
    console.log("\n=== EXACT SQL QUERY ===");
    console.log(`
-- QUESTION: "Can we perform feeding operations on July 30, 2025 for location 61?"
-- 
-- This query checks if there are any POSTED documents AFTER July 30, 2025 that would BLOCK operations
-- on that earlier date. The logic is: "If there are posted operations on later dates, 
-- we cannot perform operations on earlier dates" (to maintain data integrity).
--
-- WHAT WE'RE LOOKING FOR:
-- 1. Documents for location 61
-- 2. That have a date AFTER July 30, 2025 (23:59:59.999)
-- 3. That are POSTED (date_time_posted IS NOT NULL)
-- 4. But EXCLUDING certain document types that shouldn't block operations
--
-- EXCLUSIONS (documents that DON'T block operations):
-- - Feeding calculation documents (doc_type_id != 7) - these are just recalculations
-- - Child documents (parent_document IS NULL) - these are derived from parent operations
--
-- RESULT INTERPRETATION:
-- - If query returns 0 rows: ✅ Feeding is ALLOWED on July 30, 2025
-- - If query returns >0 rows: ❌ Feeding is BLOCKED on July 30, 2025

SELECT 
  d.id,                    -- Document ID for reference
  d.doc_type_id,           -- Document type (1=Stocking, 7=Feeding calc, etc.)
  d.date_time,             -- When the document was created
  d.date_time_posted,      -- When the document was posted
  d.parent_document        -- Parent document ID (null if standalone)
FROM documents d
WHERE 
  d.location_id = ${location_id}                           -- Only check location 61
  AND d.date_time > '${
    new Date(date).toISOString().split("T")[0]
  }T23:59:59.999Z'  -- After July 30, 2025
  AND d.date_time_posted IS NOT NULL                      -- Only posted documents
  AND d.doc_type_id != 7                                  -- Exclude feeding calculations (recalculations)
  AND d.parent_document IS NULL                           -- Exclude child documents (derived operations)
ORDER BY d.date_time DESC;                                -- Most recent first
    `);

    // Execute the query using Prisma
    console.log("\n=== EXECUTING QUERY ===");

    const checkDate = new Date(date);
    checkDate.setUTCHours(23, 59, 59, 999);

    const postedDocuments = await prisma.documents.findMany({
      where: {
        location_id: location_id,
        date_time: {
          gt: checkDate, // After the given date
        },
        date_time_posted: {
          not: undefined, // Document has been posted
        },
        // Exclude feeding calculation documents (recalculations)
        doc_type_id: {
          not: 7,
        },
        // Exclude child documents (derived operations)
        parent_document: null,
      },
      select: {
        id: true,
        doc_type_id: true,
        date_time: true,
        date_time_posted: true,
        parent_document: true,
      },
      orderBy: {
        date_time: "desc",
      },
    });

    console.log(`\n=== QUERY RESULTS ===`);
    console.log(`Found ${postedDocuments.length} blocking documents:`);

    if (postedDocuments.length > 0) {
      postedDocuments.forEach((doc, index) => {
        console.log(
          `  ${index + 1}. ID: ${doc.id}, Doc Type: ${doc.doc_type_id}, Date: ${
            doc.date_time
          }, Posted: ${doc.date_time_posted}, Parent: ${doc.parent_document}`
        );
      });

      console.log(`\n❌ Operations are BLOCKED on ${date}`);
      console.log(
        `Reason: Found ${postedDocuments.length} posted document(s) after ${date} (excluding recalculations and child documents)`
      );
    } else {
      console.log(`\n✅ Operations are ALLOWED on ${date}`);
      console.log(
        `No blocking documents found (excluding recalculations and child documents)`
      );
    }

    // Also show what the OLD logic would have found
    console.log("\n=== COMPARISON WITH OLD LOGIC ===");

    const oldLogicDocs = await prisma.documents.findMany({
      where: {
        location_id: location_id,
        date_time: { gt: checkDate },
        date_time_posted: { not: null },
      },
      select: {
        id: true,
        doc_type_id: true,
        date_time: true,
        date_time_posted: true,
        parent_document: true,
      },
      orderBy: { date_time: "desc" },
    });

    console.log(`OLD logic found: ${oldLogicDocs.length} documents`);
    console.log(`NEW logic found: ${postedDocuments.length} documents`);
    console.log(
      `Documents excluded: ${oldLogicDocs.length - postedDocuments.length}`
    );

    if (oldLogicDocs.length > postedDocuments.length) {
      console.log("\n=== EXCLUDED DOCUMENTS ===");
      const excludedDocs = oldLogicDocs.filter(
        (oldDoc) => !postedDocuments.some((newDoc) => newDoc.id === oldDoc.id)
      );

      excludedDocs.forEach((doc, index) => {
        const reason =
          doc.doc_type_id === 7
            ? "Feeding calculation (doc_type_id = 7)"
            : doc.parent_document
            ? "Child document (parent_document ≠ null)"
            : "Other";
        console.log(
          `  ${index + 1}. ID: ${doc.id}, Type: ${
            doc.doc_type_id
          }, Reason: ${reason}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error testing validation SQL:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testValidationSQL();
