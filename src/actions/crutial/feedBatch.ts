"use server";
import { db } from "@/db";
import { getFeedBatchByItemId } from "./getFeedBatchByItemId";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { parseDecimal } from "@/utils/numberParsing";
import { isPoolOperationsAllowed } from "@/utils/poolUtils";

interface BatchQuantities {
  total_produced: number;
  qty_1_150g: number;
  qty_150_450g: number;
  qty_450_plus: number;
  sorted_qty_1_150g: number;
  sorted_qty_150_450g: number;
  sorted_qty_450_plus: number;
  dead_qty_1_150g: number;
  dead_qty_150_450g: number;
  dead_qty_450_plus: number;
  total_dead: number;
}

interface FeedData {
  feed_type: string;
  quantity_kg: number;
  cost_uah: number;
}

interface WeightCategoryMetrics {
  category: string;
  feed_kg_per_fish_kg: number;
  feed_uah_per_fish_kg: number;
}

interface CostReportData {
  batch_id: number;
  date: Date;
  quantities: BatchQuantities;
  feed_data: FeedData[];
  weight_categories: WeightCategoryMetrics[];
  total_batch_cost: number;
}

interface RawQueryResult {
  batch_id: number;
  date: Date;
  total_produced: number;
  qty_1_150g: number;
  qty_150_450g: number;
  qty_450_plus: number;
  total_dead: number;
  feed_type: string;
  total_qty: number;
  total_cost: number;
  location_id: number;
}

interface FeedingMetrics {
  feed_type_name: string;
  feed_batch_id: number;
  feeding_date: Date;
  location_id: number;
  fish_batch_id: number | null;
  fish_weight: number | null;
  weight_category: string;
  total_feed_quantity: number;
  total_feed_cost: number;
  feed_per_fish: number;
  feed_cost_per_fish: number;
}

export async function feedBatch(
  formState: { message: string },
  formData: FormData
) {
  try {
    process.stdout.write(
      "\n================== FEED BATCH STARTED ==================\n"
    );

    const fish_batch_id: number = parseInt(formData.get("batch_id") as string);
    const executed_by: number = parseInt(formData.get("executed_by") as string);
    const date_time = formData.get("date_time") as string;
    const location_id: number = parseInt(formData.get("location_id") as string);
    const item_id: number = parseInt(formData.get("item_id") as string);

    // Check if pool operations are allowed (no posted operations after this date)
    const operationsCheck = await isPoolOperationsAllowed(
      location_id,
      date_time
    );
    if (!operationsCheck.allowed) {
      return {
        message: `Операція заблокована: ${operationsCheck.reason}`,
      };
    }

    process.stdout.write(
      `Input parameters: ${JSON.stringify(
        {
          fish_batch_id,
          executed_by,
          date_time,
          location_id,
          item_id,
        },
        null,
        2
      )}\n`
    );

    const times = await db.time_table.findMany({
      orderBy: {
        id: "asc",
      },
    });

    process.stdout.write(`Time slots: ${JSON.stringify(times, null, 2)}\n`);

    // Calculate total quantity needed for the day
    let totalQtyNeeded = 0;
    const timeQtyDebug: Record<string, number> = {};

    times.forEach((time) => {
      const hours = parseInt(time.time.split(":")[0]);
      const qty = parseDecimal(formData.get(`time_${hours}`) as string);
      timeQtyDebug[`time_${hours}`] = qty;
      if (!isNaN(qty)) {
        totalQtyNeeded += qty;
      }
    });

    process.stdout.write(
      `Time quantities: ${JSON.stringify(timeQtyDebug, null, 2)}\n`
    );
    process.stdout.write(`Total quantity needed: ${totalQtyNeeded}\n`);

    // Check if this is a zero feeding
    const isZeroFeeding = totalQtyNeeded === 0;

    // Check if we have enough stock only if we need some feed
    if (totalQtyNeeded > 0) {
      const availableBatches = await getFeedBatchByItemId(
        item_id,
        totalQtyNeeded,
        db
      );
      const totalAvailable = availableBatches.reduce(
        (sum, batch) => sum + (batch._sum.quantity || 0),
        0
      );

      if (totalAvailable < totalQtyNeeded / 1000) {
        return {
          message: `Not enough stock available. Required: ${totalQtyNeeded}kg, Available: ${
            totalAvailable * 1000
          }kg`,
        };
      }
    }

    let index = 0;

    // Виконання транзакції
    const result = await db.$transaction(async (prisma) => {
      try {
        for (const time of times) {
          const hours = parseInt(time.time.split(":")[0]);
          const qty: number = parseDecimal(
            formData.get(`time_${hours}`) as string
          );
          process.stdout.write(
            `Processing time slot ${hours}:00 with qty: ${qty}\n`
          );

          const date = new Date(date_time);
          // Format the date as YYYY-MM-DD HH:00:00 without milliseconds
          const formattedDate = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(
            2,
            "0"
          )}T${String(hours).padStart(2, "0")}:00:00.000Z`;

          process.stdout.write(`\nProcessing time ${hours}:00\n`);

          // Find the latest document for this location and date
          const startOfDay = new Date(date_time);
          startOfDay.setUTCHours(0, 0, 0, 0);
          const endOfDay = new Date(date_time);
          endOfDay.setUTCHours(23, 59, 59, 999);

          const latestDoc = await prisma.documents.findFirst({
            where: {
              location_id: location_id,
              date_time: {
                gte: startOfDay,
                lt: endOfDay,
              },
            },
            orderBy: {
              date_time: "desc",
            },
          });

          // If a later document exists, use its time + 1ms
          if (latestDoc && latestDoc.date_time > date) {
            date.setTime(latestDoc.date_time.getTime() + 1);
          }

          let qtyForWholeDay = qty;

          if (index === 0) {
            qtyForWholeDay = 0;
            times.forEach((time) => {
              const howMuchToAdd = parseDecimal(
                formData.get(
                  `time_${parseInt(time.time.split(":")[0])}`
                ) as string
              );
              process.stdout.write(`Adding quantity: ${howMuchToAdd}\n`);
              qtyForWholeDay += howMuchToAdd;
            });
          }

          const feedDoc = await prisma.documents.create({
            data: {
              location_id: location_id,
              doc_type_id: 9,
              date_time: formattedDate,
              executed_by: executed_by,
              comments: "Годівля",
            },
          });

          process.stdout.write(
            `Created document: ${JSON.stringify(
              {
                id: String(feedDoc.id),
                date_time: feedDoc.date_time,
                comments: feedDoc.comments,
              },
              null,
              2
            )}\n`
          );

          // Always create a transaction, even for 0 quantity
          if (qty === 0) {
            // Use actual batch_id(s) from getFeedBatchByItemId for zero feeding
            const batches_id = await getFeedBatchByItemId(
              item_id,
              0.001, // Use a small positive number to get at least one batch
              prisma
            );
            for (const batch of batches_id) {
              await prisma.itemtransactions.create({
                data: {
                  doc_id: feedDoc.id,
                  location_id: 87,
                  batch_id: batch.batch_id,
                  quantity: 0,
                  unit_id: 2,
                },
              });
              await prisma.itemtransactions.create({
                data: {
                  doc_id: feedDoc.id,
                  location_id: location_id,
                  batch_id: batch.batch_id,
                  quantity: 0,
                  unit_id: 2,
                },
              });
            }
          } else {
            // Create transaction for any quantity > 0 as before
            const batches_id = await getFeedBatchByItemId(
              item_id,
              Math.max(qtyForWholeDay, 0.001), // Use a small positive number to get at least one batch
              prisma
            );
            let leftToFeed = qty / 1000;
            for (const batch of batches_id) {
              if (leftToFeed <= 0) break;
              const available = batch._sum.quantity ?? 0;
              const consume = Math.min(available, leftToFeed);
              // Create negative transaction for warehouse
              const fetchTran = await prisma.itemtransactions.create({
                data: {
                  doc_id: feedDoc.id,
                  location_id: 87,
                  batch_id: batch.batch_id,
                  quantity: -consume,
                  unit_id: 2,
                },
              });
              // Create positive transaction for pool
              const feedTran = await prisma.itemtransactions.create({
                data: {
                  doc_id: feedDoc.id,
                  location_id: location_id,
                  batch_id: batch.batch_id,
                  quantity: consume,
                  unit_id: 2,
                },
              });
              const latestGeneration = await prisma.batch_generation.findFirst({
                include: {
                  itemtransactions: true,
                },
                where: {
                  location_id: location_id,
                },
                orderBy: {
                  id: "desc",
                },
                take: 1,
              });
              const record = await prisma.generation_feed_amount.create({
                data: {
                  batch_generation_id: latestGeneration?.id as bigint,
                  feed_batch_id: batch.batch_id,
                  amount: consume * 1000, // store in grams if needed
                  doc_id: feedDoc.id,
                },
              });
              leftToFeed -= consume;
              process.stdout.write(
                `Created transactions: ${JSON.stringify(
                  {
                    fetchTransactionId: String(fetchTran.id),
                    feedTransactionId: String(feedTran.id),
                    recordId: String(record.id),
                    consumed: consume,
                    leftToFeed,
                  },
                  null,
                  2
                )}\n`
              );
            }
          }
          index++;
        }
      } catch (innerError: any) {
        process.stdout.write(
          `Transaction error: ${innerError.message || "невідома помилка"}\n`
        );
        throw new Error(
          `Транзакція не виконана: ${innerError.message || "невідома помилка"}`
        );
      }
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      {
        process.stdout.write(err.message + "\n");
        return { message: err.message };
      }
    } else {
      return { message: "Something went wrong!" };
    }
  }
  revalidatePath(`/accumulation/view`);
  revalidatePath("/leftovers/view");
  revalidatePath(`/summary-feeding-table/day/${formData.get("date_time")}`);
  return { message: "Success" };
}

export async function getCostReport(
  batchId?: number,
  date?: string
): Promise<FeedingMetrics[]> {
  // Build WHERE clauses for filtering
  const batchFilter = batchId ? `AND fs.fish_batch_id = ${batchId}` : "";
  const dateFilter = date
    ? `AND CAST(ft.feeding_date AS DATE) <= '${date}'`
    : "";

  const result = await db.$queryRaw<FeedingMetrics[]>`
    WITH FeedTransactions AS (
      SELECT 
          it.id,
          it.batch_id as feed_batch_id,
          it.location_id,
          CAST(d.date_time AS DATE) as feeding_date,
          ft.name as feed_type_name,
          it.quantity as feed_quantity,
          it.quantity * ib.price as feed_cost
      FROM itemtransactions it
      JOIN documents d ON it.doc_id = d.id
      JOIN itembatches ib ON it.batch_id = ib.id
      JOIN items i ON ib.item_id = i.id
      JOIN feedtypes ft ON i.feed_type_id = ft.id
      JOIN locations l ON it.location_id = l.id
      WHERE d.doc_type_id = 9
      AND l.location_type_id = 2
      AND i.item_type_id = 3
    ),
    FishState AS (
      WITH DailyTransactions AS (
          SELECT
              itr.batch_id as fish_batch_id,
              itr.location_id,
              CAST(d.date_time AS DATE) AS transaction_date,
              SUM(itr.quantity) AS quantity_change
          FROM itemtransactions itr
          INNER JOIN documents d ON d.id = itr.doc_id
          INNER JOIN itembatches ib ON ib.id = itr.batch_id
          INNER JOIN items it ON it.id = ib.item_id AND it.item_type_id = 1
          INNER JOIN locations l ON l.id = itr.location_id
          WHERE l.location_type_id = 2
          GROUP BY
              itr.batch_id,
              itr.location_id,
              CAST(d.date_time AS DATE)
      ),
      CumulativeQuantity AS (
          SELECT
              dt.*,
              SUM(dt.quantity_change) OVER (
                  PARTITION BY dt.fish_batch_id, dt.location_id
                  ORDER BY dt.transaction_date
                  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
              ) AS cumulative_quantity
          FROM DailyTransactions dt
      ),
      StockingWeights AS (
          SELECT DISTINCT
              itr.batch_id as fish_batch_id,
              itr.location_id,
              CAST(d.date_time AS DATE) AS stocking_date,
              s.average_weight
          FROM stocking s
          INNER JOIN documents d ON s.doc_id = d.id
          INNER JOIN itemtransactions itr ON itr.doc_id = d.id
          WHERE s.average_weight IS NOT NULL
      )
      SELECT
          cq.fish_batch_id,
          cq.location_id,
          cq.transaction_date,
          cq.cumulative_quantity,
          CASE
              WHEN cq.cumulative_quantity > 0 THEN 
                  (SELECT sw.average_weight
                   FROM StockingWeights sw
                   WHERE sw.fish_batch_id = cq.fish_batch_id
                     AND sw.location_id = cq.location_id
                     AND sw.stocking_date <= cq.transaction_date
                   ORDER BY sw.stocking_date DESC
                   LIMIT 1)
              ELSE NULL
          END as fish_weight
      FROM CumulativeQuantity cq
      WHERE cq.cumulative_quantity > 0
    )
    SELECT 
        ft.feed_type_name,
        MAX(ft.feed_batch_id) as feed_batch_id,
        ft.feeding_date,
        ft.location_id,
        fs.fish_batch_id,
        fs.fish_weight,
        CASE
            WHEN fs.fish_weight <= 50 THEN '0-50g'
            WHEN fs.fish_weight <= 100 THEN '50-100g'
            WHEN fs.fish_weight <= 200 THEN '100-200g'
            WHEN fs.fish_weight <= 300 THEN '200-300g'
            WHEN fs.fish_weight <= 500 THEN '300-500g'
            WHEN fs.fish_weight <= 1000 THEN '500-1000g'
            ELSE '1000g+'
        END as weight_category,
        SUM(ft.feed_quantity) as total_feed_quantity,
        SUM(ft.feed_cost) as total_feed_cost,
        CASE 
            WHEN MAX(fs.cumulative_quantity) > 0 THEN SUM(ft.feed_quantity) / MAX(fs.cumulative_quantity)
            ELSE 0 
        END as feed_per_fish,
        CASE 
            WHEN MAX(fs.cumulative_quantity) > 0 THEN SUM(ft.feed_cost) / MAX(fs.cumulative_quantity)
            ELSE 0 
        END as feed_cost_per_fish
    FROM FeedTransactions ft
    LEFT JOIN LATERAL (
        SELECT *
        FROM FishState fs
        WHERE fs.location_id = ft.location_id
        AND fs.transaction_date <= ft.feeding_date
        ORDER BY fs.transaction_date DESC
        LIMIT 1
    ) fs ON true
    WHERE 1=1
        ${Prisma.raw(batchFilter)}
        ${Prisma.raw(dateFilter)}
    GROUP BY
        ft.feed_type_name,
        ft.feeding_date,
        ft.location_id,
        fs.fish_batch_id,
        fs.fish_weight
    ORDER BY 
        fs.fish_batch_id,
        ft.location_id,
        ft.feeding_date,
        feed_batch_id
  `;

  return result;
}

export async function getCostReportPivot(batchId: number, date: string) {
  // 1. Get all feed types for feed transactions up to the date
  const feedTypes = await db.$queryRawUnsafe<any[]>(
    `SELECT DISTINCT ft.name as feed_type_name
     FROM itemtransactions it
     JOIN itembatches ib ON it.batch_id = ib.id
     JOIN items i ON ib.item_id = i.id
     JOIN feedtypes ft ON i.feed_type_id = ft.id
     JOIN documents d ON it.doc_id = d.id
     WHERE d.doc_type_id = 9
       AND i.item_type_id = 3
       AND CAST(d.date_time AS DATE) <= CAST($2 AS date)
    `,
    batchId,
    date
  );
  const feedTypeNames = feedTypes.map((ft) => ft.feed_type_name);

  // If no feed types, return empty arrays
  if (feedTypeNames.length === 0) {
    return { feedSummary: [], efficiencySummary: [] };
  }

  // 2. Build dynamic SQL for feed type pivot columns
  const feedTypeKgCols = feedTypeNames
    .map(
      (name) =>
        `SUM(CASE WHEN ft.feed_type_name = '${name}' THEN ft.feed_quantity ELSE 0 END) AS "${name} (kg)"`
    )
    .join(", ");
  const feedTypeUahCols = feedTypeNames
    .map(
      (name) =>
        `SUM(CASE WHEN ft.feed_type_name = '${name}' THEN ft.feed_cost ELSE 0 END) AS "${name} (UAH)"`
    )
    .join(", ");

  // 3. Feed summary (pivot) - using original query structure and join logic
  const feedSummary = await db.$queryRawUnsafe<any[]>(
    `WITH FeedTransactions AS (
      SELECT 
          it.id,
          it.batch_id as feed_batch_id,
          it.location_id,
          CAST(d.date_time AS DATE) as feeding_date,
          ft.name as feed_type_name,
          it.quantity as feed_quantity,
          it.quantity * ib.price as feed_cost
      FROM itemtransactions it
      JOIN documents d ON it.doc_id = d.id
      JOIN itembatches ib ON it.batch_id = ib.id
      JOIN items i ON ib.item_id = i.id
      JOIN feedtypes ft ON i.feed_type_id = ft.id
      JOIN locations l ON it.location_id = l.id
      WHERE d.doc_type_id = 9
      AND l.location_type_id = 2
      AND i.item_type_id = 3
      AND CAST(d.date_time AS DATE) <= CAST($2 AS date)
    ),
    FishState AS (
      WITH DailyTransactions AS (
          SELECT
              itr.batch_id as fish_batch_id,
              itr.location_id,
              CAST(d.date_time AS DATE) AS transaction_date,
              SUM(itr.quantity) AS quantity_change
          FROM itemtransactions itr
          INNER JOIN documents d ON d.id = itr.doc_id
          INNER JOIN itembatches ib ON ib.id = itr.batch_id
          INNER JOIN items it ON it.id = ib.item_id AND it.item_type_id = 1
          INNER JOIN locations l ON l.id = itr.location_id
          WHERE l.location_type_id = 2
          GROUP BY
              itr.batch_id,
              itr.location_id,
              CAST(d.date_time AS DATE)
      ),
      CumulativeQuantity AS (
          SELECT
              dt.*,
              SUM(dt.quantity_change) OVER (
                  PARTITION BY dt.fish_batch_id, dt.location_id
                  ORDER BY dt.transaction_date
                  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
              ) AS cumulative_quantity
          FROM DailyTransactions dt
      ),
      StockingWeights AS (
          SELECT DISTINCT
              itr.batch_id as fish_batch_id,
              itr.location_id,
              CAST(d.date_time AS DATE) AS stocking_date,
              s.average_weight
          FROM stocking s
          INNER JOIN documents d ON s.doc_id = d.id
          INNER JOIN itemtransactions itr ON itr.doc_id = d.id
          WHERE s.average_weight IS NOT NULL
      )
      SELECT
          cq.fish_batch_id,
          cq.location_id,
          cq.transaction_date,
          cq.cumulative_quantity,
          CASE
              WHEN cq.cumulative_quantity > 0 THEN 
                  (SELECT sw.average_weight
                   FROM StockingWeights sw
                   WHERE sw.fish_batch_id = cq.fish_batch_id
                     AND sw.location_id = cq.location_id
                     AND sw.stocking_date <= cq.transaction_date
                   ORDER BY sw.stocking_date DESC
                   LIMIT 1)
              ELSE NULL
          END as fish_weight
      FROM CumulativeQuantity cq
      WHERE cq.cumulative_quantity > 0
    )
    SELECT 
        ft.feed_type_name,
        ft.feed_batch_id,
        ft.feeding_date,
        ft.location_id,
        fs.fish_batch_id,
        fs.fish_weight,
        CASE
            WHEN fs.fish_weight <= 50 THEN '0-50g'
            WHEN fs.fish_weight <= 100 THEN '50-100g'
            WHEN fs.fish_weight <= 200 THEN '100-200g'
            WHEN fs.fish_weight <= 300 THEN '200-300g'
            WHEN fs.fish_weight <= 500 THEN '300-500g'
            WHEN fs.fish_weight <= 1000 THEN '500-1000g'
            ELSE '1000g+'
        END as weight_category,
        ${feedTypeKgCols},
        ${feedTypeUahCols},
        SUM(ft.feed_quantity) as total_feed_quantity,
        SUM(ft.feed_cost) as total_feed_cost,
        CASE 
            WHEN MAX(fs.cumulative_quantity) > 0 THEN SUM(ft.feed_quantity) / MAX(fs.cumulative_quantity)
            ELSE 0 
        END as feed_per_fish,
        CASE 
            WHEN MAX(fs.cumulative_quantity) > 0 THEN SUM(ft.feed_cost) / MAX(fs.cumulative_quantity)
            ELSE 0 
        END as feed_cost_per_fish
    FROM FeedTransactions ft
    LEFT JOIN LATERAL (
        SELECT *
        FROM FishState fs
        WHERE fs.location_id = ft.location_id
        AND fs.transaction_date <= ft.feeding_date
        ORDER BY fs.transaction_date DESC
        LIMIT 1
    ) fs ON true
    GROUP BY
        ft.feed_type_name,
        ft.feed_batch_id,
        ft.feeding_date,
        ft.location_id,
        fs.fish_batch_id,
        fs.fish_weight,
        weight_category
    HAVING fs.fish_batch_id = $1
    ORDER BY 
        fs.fish_batch_id,
        ft.location_id,
        ft.feeding_date,
        ft.feed_batch_id
  `,
    batchId,
    date
  );

  // 4. Efficiency summary (grouped by weight category, using same join logic)
  const efficiencySummary = await db.$queryRawUnsafe<any[]>(
    `WITH FeedTransactions AS (
      SELECT 
          it.id,
          it.batch_id as feed_batch_id,
          it.location_id,
          CAST(d.date_time AS DATE) as feeding_date,
          ft.name as feed_type_name,
          it.quantity as feed_quantity,
          it.quantity * ib.price as feed_cost
      FROM itemtransactions it
      JOIN documents d ON it.doc_id = d.id
      JOIN itembatches ib ON it.batch_id = ib.id
      JOIN items i ON ib.item_id = i.id
      JOIN feedtypes ft ON i.feed_type_id = ft.id
      JOIN locations l ON it.location_id = l.id
      WHERE d.doc_type_id = 9
      AND l.location_type_id = 2
      AND i.item_type_id = 3
      AND CAST(d.date_time AS DATE) <= CAST($2 AS date)
    ),
    FishState AS (
      WITH DailyTransactions AS (
          SELECT
              itr.batch_id as fish_batch_id,
              itr.location_id,
              CAST(d.date_time AS DATE) AS transaction_date,
              SUM(itr.quantity) AS quantity_change
          FROM itemtransactions itr
          INNER JOIN documents d ON d.id = itr.doc_id
          INNER JOIN itembatches ib ON ib.id = itr.batch_id
          INNER JOIN items it ON it.id = ib.item_id AND it.item_type_id = 1
          INNER JOIN locations l ON l.id = itr.location_id
          WHERE l.location_type_id = 2
          GROUP BY
              itr.batch_id,
              itr.location_id,
              CAST(d.date_time AS DATE)
      ),
      CumulativeQuantity AS (
          SELECT
              dt.*,
              SUM(dt.quantity_change) OVER (
                  PARTITION BY dt.fish_batch_id, dt.location_id
                  ORDER BY dt.transaction_date
                  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
              ) AS cumulative_quantity
          FROM DailyTransactions dt
      ),
      StockingWeights AS (
          SELECT DISTINCT
              itr.batch_id as fish_batch_id,
              itr.location_id,
              CAST(d.date_time AS DATE) AS stocking_date,
              s.average_weight
          FROM stocking s
          INNER JOIN documents d ON s.doc_id = d.id
          INNER JOIN itemtransactions itr ON itr.doc_id = d.id
          WHERE s.average_weight IS NOT NULL
      )
      SELECT
          cq.fish_batch_id,
          cq.location_id,
          cq.transaction_date,
          cq.cumulative_quantity,
          CASE
              WHEN cq.cumulative_quantity > 0 THEN 
                  (SELECT sw.average_weight
                   FROM StockingWeights sw
                   WHERE sw.fish_batch_id = cq.fish_batch_id
                     AND sw.location_id = cq.location_id
                     AND sw.stocking_date <= cq.transaction_date
                   ORDER BY sw.stocking_date DESC
                   LIMIT 1)
              ELSE NULL
          END as fish_weight
      FROM CumulativeQuantity cq
      WHERE cq.cumulative_quantity > 0
    )
    SELECT 
      CASE
        WHEN fs.fish_weight <= 50 THEN '0-50g'
        WHEN fs.fish_weight <= 100 THEN '50-100g'
        WHEN fs.fish_weight <= 200 THEN '100-200g'
        WHEN fs.fish_weight <= 300 THEN '200-300g'
        WHEN fs.fish_weight <= 500 THEN '300-500g'
        WHEN fs.fish_weight <= 1000 THEN '500-1000g'
        ELSE '1000g+'
      END as weight_category,
      ${feedTypeKgCols},
      ${feedTypeUahCols},
      SUM(ft.feed_quantity) as total_feed_quantity,
      SUM(ft.feed_cost) as total_feed_cost,
      CASE 
        WHEN fs.cumulative_quantity > 0 THEN SUM(ft.feed_quantity) / fs.cumulative_quantity
        ELSE 0 
      END as feed_per_fish,
      CASE 
        WHEN fs.cumulative_quantity > 0 THEN SUM(ft.feed_cost) / fs.cumulative_quantity
        ELSE 0 
      END as feed_cost_per_fish
    FROM FeedTransactions ft
    JOIN FishState fs
      ON fs.fish_batch_id = $1
      AND fs.location_id = ft.location_id
      AND fs.transaction_date <= ft.feeding_date
    WHERE fs.fish_batch_id = $1
    GROUP BY
      fs.fish_batch_id,
      fs.fish_weight,
      weight_category
    ORDER BY 
      fs.fish_batch_id,
      fs.fish_weight
  `,
    batchId,
    date
  );

  return { feedSummary, efficiencySummary };
}

// Returns the exact stock quantity for a batch up to a given date
export async function getBatchStockQty(
  batchId: number,
  date: string
): Promise<number> {
  // Sum all itemtransactions.quantity for the batch up to and including the date
  const result = await db.$queryRawUnsafe<any[]>(
    `SELECT SUM(itr.quantity) as sum
     FROM itemtransactions itr
     JOIN documents d ON itr.doc_id = d.id
     WHERE itr.batch_id = $1
       AND CAST(d.date_time AS DATE) <= CAST($2 AS DATE)
    `,
    batchId,
    date
  );
  return result[0]?.sum ?? 0;
}

// Returns the stocking history for a batch: for each stocking event, the date, quantity stocked, and cumulative quantity after stocking
export async function getBatchStockingHistory(batchId: number): Promise<
  Array<{
    stocking_transaction_id: number;
    stocking_date: string;
    stocked_qty: number;
    quantity_after_stocking: number;
  }>
> {
  // You may need to adjust doc_type_id for stocking events if not 1
  const result = await db.$queryRawUnsafe<any[]>(
    `SELECT
      s.id AS stocking_transaction_id,
      d.date_time AS stocking_date,
      s.quantity AS stocked_qty,
      (
        SELECT SUM(itr.quantity)
        FROM itemtransactions itr
        JOIN documents doc ON itr.doc_id = doc.id
        WHERE itr.batch_id = s.batch_id
          AND doc.date_time <= d.date_time
      ) AS quantity_after_stocking
    FROM itemtransactions s
    JOIN documents d ON s.doc_id = d.id
    WHERE s.batch_id = $1
      AND d.doc_type_id = 1 -- adjust if needed for your stocking doc type
    ORDER BY d.date_time;
    `,
    batchId
  );
  return result;
}

// Returns the total stock and total weight for a batch as of a given date
export async function getBatchTotalStockAndWeight(
  batchId: number,
  date: string
): Promise<{ tot_stock: number; tot_weight: number }> {
  const result = await db.$queryRawUnsafe<any[]>(
    `WITH loc_qty AS (
      SELECT
        itr.location_id,
        SUM(itr.quantity) AS stock
      FROM itemtransactions itr
      INNER JOIN itembatches ib ON ib.id = $1 AND ib.id = itr.batch_id
      INNER JOIN documents doc ON doc.id = itr.doc_id AND CAST(doc.date_time AS DATE) <= CAST($2 AS DATE)
      GROUP BY itr.location_id
      HAVING SUM(itr.quantity) > 0
    ),
    last_stocking AS (
      SELECT
        d.location_id,
        s.average_weight,
        s.id AS stocking_id,
        CAST(d.date_time AS DATE) AS stocking_date,
        ROW_NUMBER() OVER (PARTITION BY d.location_id ORDER BY d.date_time DESC) AS rn
      FROM stocking s
      INNER JOIN documents d ON d.id = s.doc_id
      WHERE CAST(d.date_time AS DATE) <= CAST($2 AS DATE)
    )
    SELECT
      SUM(lq.stock) AS tot_stock,
      SUM(ls.average_weight / 1000 * lq.stock) AS tot_weight
    FROM loc_qty lq
    LEFT JOIN last_stocking ls
      ON lq.location_id = ls.location_id AND ls.rn = 1
    `,
    batchId,
    date
  );
  return {
    tot_stock: result[0]?.tot_stock ?? 0,
    tot_weight: result[0]?.tot_weight ?? 0,
  };
}
