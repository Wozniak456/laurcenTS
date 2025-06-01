const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const readline = require("readline");

// Define batchIdToItemId cache at the top
const batchIdToItemId = {};

async function main() {
  // 1. Find all batches that first went negative in warehouse (location_id: 87) for feed items (item_type_id: 3)
  const negativeBatches = await prisma.$queryRaw`
    WITH batch_stock_history AS (
      SELECT 
        it.batch_id,
        it.doc_id,
        it.id as transaction_id,
        d.date_time,
        it.quantity,
        SUM(it.quantity) OVER (
          PARTITION BY it.batch_id 
          ORDER BY d.date_time, it.id
        ) as running_balance
      FROM itemtransactions it
      JOIN documents d ON d.id = it.doc_id
      JOIN itembatches ib ON ib.id = it.batch_id
      JOIN items i ON i.id = ib.item_id
      WHERE it.location_id = 87
        AND i.item_type_id = 3
      ORDER BY it.batch_id, d.date_time, it.id
    ),
    first_negative_stock AS (
      SELECT 
        batch_id,
        MIN(date_time) as first_negative_date
      FROM batch_stock_history
      WHERE running_balance < 0
      GROUP BY batch_id
    )
    SELECT batch_id, first_negative_date FROM first_negative_stock;
  `;

  // 2. Find all feeding transactions and generation_feed_amount records for these batches after they first went negative
  const affectedTransactions = await prisma.$queryRaw`
    SELECT 
      d.date_time,
      d.id as doc_id,
      dt.name as document_type,
      it.id as transaction_id,
      it.batch_id,
      ib.name as batch_name,
      i.id as item_id,
      i.name as item_name,
      it.quantity,
      it.location_id,
      l.name as location_name,
      fns.first_negative_date,
      gfa.id as generation_feed_amount_id,
      gfa.amount as feed_amount,
      gfa.batch_generation_id
    FROM documents d
    JOIN doctype dt ON dt.id = d.doc_type_id
    JOIN itemtransactions it ON it.doc_id = d.id
    JOIN itembatches ib ON ib.id = it.batch_id
    JOIN items i ON i.id = ib.item_id
    JOIN locations l ON l.id = it.location_id
    JOIN (
      SELECT batch_id, MIN(first_negative_date) as first_negative_date
      FROM (
        WITH batch_stock_history AS (
          SELECT 
            it.batch_id,
            it.doc_id,
            it.id as transaction_id,
            d.date_time,
            it.quantity,
            SUM(it.quantity) OVER (
              PARTITION BY it.batch_id 
              ORDER BY d.date_time, it.id
            ) as running_balance
          FROM itemtransactions it
          JOIN documents d ON d.id = it.doc_id
          JOIN itembatches ib ON ib.id = it.batch_id
          JOIN items i ON i.id = ib.item_id
          WHERE it.location_id = 87
            AND i.item_type_id = 3
          ORDER BY it.batch_id, d.date_time, it.id
        )
        SELECT batch_id, MIN(date_time) as first_negative_date
        FROM batch_stock_history
        WHERE running_balance < 0
        GROUP BY batch_id
      ) as sub
      GROUP BY batch_id
    ) fns ON fns.batch_id = it.batch_id
    LEFT JOIN generation_feed_amount gfa 
      ON gfa.doc_id = d.id
      AND gfa.feed_batch_id = it.batch_id
    WHERE d.doc_type_id = 9
      AND d.date_time >= fns.first_negative_date
    ORDER BY d.date_time, it.id;
  `;

  // Print only the counts
  console.log("Negative batches count:", negativeBatches.length);
  console.log(
    "Affected transactions and feed amounts count:",
    affectedTransactions.length
  );

  // 3. Backup affected records (store in variables)
  const transactionIds = affectedTransactions
    .map((r) => r.transaction_id)
    .filter(Boolean);
  const feedAmountIds = affectedTransactions
    .map((r) => r.generation_feed_amount_id)
    .filter(Boolean);

  const backupTransactions = await prisma.itemtransactions.findMany({
    where: { id: { in: transactionIds } },
  });
  const backupFeedAmounts = await prisma.generation_feed_amount.findMany({
    where: { id: { in: feedAmountIds } },
  });

  // Custom replacer to handle BigInt serialization
  function bigintReplacer(key, value) {
    return typeof value === "bigint" ? value.toString() : value;
  }

  // Backup to JSON files before deletion, but do not overwrite if already exists
  const transactionsBackupFile = "backup_transactions.json";
  const feedAmountsBackupFile = "backup_feed_amounts.json";

  if (!fs.existsSync(transactionsBackupFile)) {
    fs.writeFileSync(
      transactionsBackupFile,
      JSON.stringify(backupTransactions, bigintReplacer, 2)
    );
    console.log("Transactions backup written to file.");
  } else {
    console.log("Transactions backup file already exists, not overwriting.");
  }

  if (!fs.existsSync(feedAmountsBackupFile)) {
    fs.writeFileSync(
      feedAmountsBackupFile,
      JSON.stringify(backupFeedAmounts, bigintReplacer, 2)
    );
    console.log("Feed amounts backup written to file.");
  } else {
    console.log("Feed amounts backup file already exists, not overwriting.");
  }

  // Read data back from JSON files
  let backupTransactionsRestored = JSON.parse(
    fs.readFileSync(transactionsBackupFile, "utf8")
  );
  let backupFeedAmountsRestored = JSON.parse(
    fs.readFileSync(feedAmountsBackupFile, "utf8")
  );

  // Present count of lines and first record from each backup
  console.log(
    "Restored transactions count:",
    backupTransactionsRestored.length
  );
  if (backupTransactionsRestored.length > 0) {
    console.log("First restored transaction:", backupTransactionsRestored[0]);
  }
  console.log("Restored feed amounts count:", backupFeedAmountsRestored.length);
  if (backupFeedAmountsRestored.length > 0) {
    console.log("First restored feed amount:", backupFeedAmountsRestored[0]);
  }

  // Group transactions by doc_id for easier processing
  const transactionsByDoc = {};
  for (const tran of backupTransactionsRestored) {
    if (!transactionsByDoc[tran.doc_id]) transactionsByDoc[tran.doc_id] = [];
    transactionsByDoc[tran.doc_id].push(tran);
  }

  // Define newTransactions and newFeedAmounts before simulation loop
  const newTransactions = [];
  const newFeedAmounts = [];

  // After restoring backup from files
  // Delete affected records using IDs from restored backup
  const transactionIdsToDelete = backupTransactionsRestored.map((r) =>
    typeof r.id === "string" ? BigInt(r.id) : r.id
  );
  const feedAmountIdsToDelete = backupFeedAmountsRestored.map((r) =>
    typeof r.id === "string" ? BigInt(r.id) : r.id
  );

  console.log("Deleting affected records from database...");
  if (feedAmountIdsToDelete.length > 0) {
    await prisma.generation_feed_amount.deleteMany({
      where: { id: { in: feedAmountIdsToDelete } },
    });
  }
  if (transactionIdsToDelete.length > 0) {
    await prisma.itemtransactions.deleteMany({
      where: { id: { in: transactionIdsToDelete } },
    });
  }
  console.log("Deletion of affected records complete.");

  console.log("Backup complete. No deletion performed.");
  console.log("Backed up transactions:", backupTransactions.length);
  console.log("Backed up feed amounts:", backupFeedAmounts.length);

  // --- IN-MEMORY STOCK TRACKING ---
  // Gather all unique batch_ids from positive transactions in the restored backup
  const batchIdsInBackup = Array.from(
    new Set(
      backupTransactionsRestored
        .filter((t) => Number(t.quantity) > 0)
        .map((t) => t.batch_id)
    )
  );

  // Query the DB for item_id for each batch_id and build batchIdToItemIdMap
  const batchIdToItemIdMap = {};
  const batchesInfo = await prisma.itembatches.findMany({
    where: { id: { in: batchIdsInBackup.map((id) => BigInt(id)) } },
    select: { id: true, item_id: true },
  });
  for (const b of batchesInfo) {
    batchIdToItemIdMap[b.id.toString()] = b.item_id;
  }

  // Build the set of unique item_ids from this map for use in the stock query
  const itemIdsInBackup = Array.from(
    new Set(Object.values(batchIdToItemIdMap))
  );

  // Query all batches with positive stock at warehouse for these item_ids
  const allBatches = await prisma.$queryRaw`
    SELECT
      ib.id as batch_id,
      ib.item_id,
      MIN(CASE WHEN it.quantity > 0 THEN d.date_time END) as first_arrival,
      SUM(it.quantity) as stock
    FROM itembatches ib
    JOIN itemtransactions it ON it.batch_id = ib.id
    JOIN documents d ON d.id = it.doc_id
    WHERE ib.item_id IN (${Prisma.join(itemIdsInBackup)})
      AND it.location_id = 87
    GROUP BY ib.id, ib.item_id
    HAVING SUM(it.quantity) > 0
    ORDER BY ib.item_id, first_arrival ASC, batch_id ASC
  `;

  // Build in-memory stock map: { item_id: [ { batch_id, first_arrival, stock }, ... ] }
  const stockMap = {};
  for (const batch of allBatches) {
    const key = String(batch.item_id);
    if (!stockMap[key]) stockMap[key] = [];
    stockMap[key].push({
      batch_id: batch.batch_id,
      first_arrival: batch.first_arrival,
      stock: Number(batch.stock),
    });
  }

  // Ensure FIFO: sort each batch array by first_arrival (ascending)
  for (const key in stockMap) {
    stockMap[key].sort(
      (a, b) => new Date(a.first_arrival) - new Date(b.first_arrival)
    );
  }

  // Debug: Print itemIdsInBackup and stockMap keys
  console.log("itemIdsInBackup:", itemIdsInBackup);
  console.log("stockMap keys:", Object.keys(stockMap));

  // --- SIMULATION LOOP WITH IN-MEMORY STOCK ---
  // Build docIdToDate for all doc_ids in newTransactions (if not already built)
  const allDocIds = Array.from(
    new Set(
      Object.values(transactionsByDoc)
        .flat()
        .map((t) => t.doc_id)
    )
  );
  const allDocs = await prisma.documents.findMany({
    where: { id: { in: allDocIds } },
    select: { id: true, date_time: true },
  });
  const docIdToDate = Object.fromEntries(
    allDocs.map((d) => [d.id, d.date_time])
  );

  for (const doc_id in transactionsByDoc) {
    const trans = transactionsByDoc[doc_id];
    for (const tran of trans) {
      const qty = Number(tran.quantity);
      if (qty === 0) {
        // Copy zero-quantity transaction as-is
        newTransactions.push({ ...tran });
        continue;
      }
      if (qty < 0) {
        // Skip original negative transactions
        continue;
      }
      // Only process positive transactions for batch splitting
      // Use tran.item_id if available, otherwise use cache or fetch from DB
      let real_item_id = tran.item_id;
      if (!real_item_id && batchIdToItemIdMap[tran.batch_id]) {
        real_item_id = batchIdToItemIdMap[tran.batch_id];
      }
      if (!real_item_id && batchIdToItemId[tran.batch_id]) {
        real_item_id = batchIdToItemId[tran.batch_id];
      }
      if (!real_item_id) {
        // Fetch from DB and cache
        const batch = await prisma.itembatches.findUnique({
          where: { id: BigInt(tran.batch_id) },
          select: { item_id: true },
        });
        real_item_id = batch ? batch.item_id : null;
        batchIdToItemId[tran.batch_id] = real_item_id;
      }
      // Use in-memory stock map for this item_id (as string)
      const batches = stockMap[String(real_item_id)] || [];
      if (batches.length === 0) {
        console.log(
          `No batches found in stockMap for item_id: ${real_item_id}`
        );
      }
      let qtyToFeed = Math.abs(qty);
      let poolLocation = tran.location_id;
      let unitId = tran.unit_id;
      let batch_generation_id =
        backupFeedAmountsRestored.find(
          (fa) => fa.doc_id == tran.doc_id && fa.batch_generation_id
        )?.batch_generation_id || null;
      let docId = tran.doc_id;
      for (const batch of batches) {
        if (qtyToFeed <= 0) break;
        if (batch.stock <= 0) continue;
        // Only use batch if it has arrived by the doc date
        if (
          batch.first_arrival &&
          docIdToDate[tran.doc_id] &&
          new Date(batch.first_arrival) > new Date(docIdToDate[tran.doc_id])
        ) {
          continue;
        }
        const consume = Math.min(qtyToFeed, batch.stock);
        // Negative transaction for warehouse
        newTransactions.push({
          doc_id: docId,
          location_id: 87,
          batch_id: batch.batch_id,
          quantity: -consume,
          unit_id: unitId,
        });
        // Positive transaction for pool
        newTransactions.push({
          doc_id: docId,
          location_id: poolLocation,
          batch_id: batch.batch_id,
          quantity: consume,
          unit_id: unitId,
        });
        // generation_feed_amount
        newFeedAmounts.push({
          batch_generation_id: batch_generation_id,
          feed_batch_id: batch.batch_id,
          amount: consume * 1000, // grams
          doc_id: docId,
        });
        batch.stock -= consume; // Update in-memory stock
        qtyToFeed -= consume;
      }
    }
  }

  // Write new transactions and feed amounts to JSON files
  fs.writeFileSync(
    "new_transactions.json",
    JSON.stringify(newTransactions, bigintReplacer, 2)
  );
  fs.writeFileSync(
    "new_feed_amounts.json",
    JSON.stringify(newFeedAmounts, bigintReplacer, 2)
  );
  console.log(
    "Simulation complete. New transactions and feed amounts written to new_transactions.json and new_feed_amounts.json"
  );

  // --- VALIDATION ---
  // Sum of negative quantities in restored backup
  const sumNegativeBackup = backupTransactionsRestored
    .filter((t) => Number(t.quantity) < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.quantity)), 0);
  // Sum of negative quantities in new generated transactions
  const sumNegativeNew = newTransactions
    .filter((t) => Number(t.quantity) < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.quantity)), 0);
  console.log(
    "Sum of negative quantities in restored backup:",
    sumNegativeBackup
  );
  console.log(
    "Sum of negative quantities in new generated transactions:",
    sumNegativeNew
  );
  if (sumNegativeBackup === sumNegativeNew) {
    console.log("Validation PASSED: Sums match.");
  } else {
    console.log("Validation FAILED: Sums do not match!");
  }

  // --- SHOW DOCUMENTS WITH TRANSITION ---
  // Find doc_ids with more than one negative transaction (indicating a split/transition)
  const docIdNegCounts = {};
  for (const t of newTransactions) {
    if (Number(t.quantity) < 0) {
      docIdNegCounts[t.doc_id] = (docIdNegCounts[t.doc_id] || 0) + 1;
    }
  }
  const docsWithTransition = Object.entries(docIdNegCounts)
    .filter(([doc_id, count]) => count > 1)
    .map(([doc_id]) => doc_id);

  // --- VALIDATE GENERATION_FEED_AMOUNT FOR TRANSITION DOCUMENTS ---
  for (const doc_id of docsWithTransition) {
    const positives = newTransactions.filter(
      (t) => t.doc_id == doc_id && t.location_id != 87 && Number(t.quantity) > 0
    );
    const feedAmounts = newFeedAmounts.filter((fa) => fa.doc_id == doc_id);

    for (const pos of positives) {
      const match = feedAmounts.find(
        (fa) =>
          fa.feed_batch_id == pos.batch_id &&
          fa.amount === Math.abs(pos.quantity) * 1000
      );
      if (!match) {
        console.log(
          `No generation_feed_amount for doc_id ${doc_id}, batch_id ${pos.batch_id}, quantity ${pos.quantity}`
        );
      }
    }
  }
  console.log("Feed amount validation for transition documents complete.");

  // --- SUMMARY INFO ---
  console.log(
    "Restored transactions count:",
    backupTransactionsRestored.length
  );
  console.log("New generated transactions count:", newTransactions.length);
  console.log("Restored feed amounts count:", backupFeedAmountsRestored.length);
  console.log("New generated feed amounts count:", newFeedAmounts.length);
  console.log(
    "Sum of negative quantities in restored backup:",
    sumNegativeBackup
  );
  console.log(
    "Sum of negative quantities in new generated transactions:",
    sumNegativeNew
  );
  if (sumNegativeBackup === sumNegativeNew) {
    console.log("Validation PASSED: Sums match.");
  } else {
    console.log("Validation FAILED: Sums do not match!");
  }

  // --- SHOW NEW TRANSACTIONS IN DATE RANGE 2025-05-19 to 2025-05-21 ---
  // Fetch document dates for doc_ids in newTransactions
  const docIdsSet = new Set(newTransactions.map((t) => t.doc_id));
  const docIds = Array.from(docIdsSet);
  const docsInRange = await prisma.documents.findMany({
    where: {
      id: { in: docIds },
      date_time: {
        gte: new Date("2025-05-19T00:00:00Z"),
        lte: new Date("2025-05-21T23:59:59Z"),
      },
    },
    select: { id: true, date_time: true },
  });
  const filteredNewTransactions = newTransactions.filter(
    (t) => docIdToDate[t.doc_id]
  );
  if (filteredNewTransactions.length > 0) {
    console.log("\n--- New Transactions from 2025-05-19 to 2025-05-21 ---");
    for (const t of filteredNewTransactions) {
      console.log({ ...t, doc_date: docIdToDate[t.doc_id] });
    }
    console.log("--- End of New Transactions in Range ---\n");
  } else {
    console.log("No new transactions in the range 2025-05-19 to 2025-05-21.");
  }

  if (docsWithTransition.length > 0) {
    console.log("Documents with transition (split across multiple batches):");
    for (const doc_id of docsWithTransition) {
      console.log(`doc_id: ${doc_id}`);
      const trans = newTransactions.filter((t) => t.doc_id == doc_id);
      for (const t of trans) {
        console.log(t);
      }
      // Also print all newFeedAmounts for this doc_id
      const feeds = newFeedAmounts.filter((fa) => fa.doc_id == doc_id);
      console.log(`generation_feed_amount records for doc_id: ${doc_id}`);
      for (const fa of feeds) {
        console.log(fa);
      }
    }
  } else {
    console.log("No documents with transition (no splits detected).");
  }

  // --- INSERTION STEP ---
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    'Do you want to insert the new transactions and feed amounts into the database? Type "yes" to confirm: ',
    async (answer) => {
      if (answer.trim().toLowerCase() === "yes") {
        await prisma.$transaction(async (tx) => {
          // Insert new transactions
          for (const t of newTransactions) {
            const { id, mirror_for, ...data } = t;
            await tx.itemtransactions.create({
              data: {
                ...data,
                // id: id, // Uncomment if you want to preserve the original id (and your DB allows it)
              },
            });
          }
          // Insert new generation_feed_amount records
          for (const fa of newFeedAmounts) {
            const { id, mirror_for, ...data } = fa;
            await tx.generation_feed_amount.create({
              data: {
                ...data,
                // id: id, // Uncomment if you want to preserve the original id (and your DB allows it)
              },
            });
          }
        });
        console.log("Insertion of new transactions and feed amounts complete.");
      } else {
        console.log("Insertion skipped by user.");
      }
      rl.close();
      await prisma.$disconnect();
    }
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
