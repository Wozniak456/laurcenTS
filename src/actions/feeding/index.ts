"use server";

import { db } from "@/db";
import * as actions from "@/actions";
import * as stockingActions from "@/actions/stocking";
import { getFeedBatchByItemId } from "../crutial/getFeedBatchByItemId";
import {
  getPercentFeedingForDate,
  getPriorityForDate,
  getActivePriorityItemForDate,
} from "@/utils/periodic";

interface TimeSlot {
  time: string;
  hours: number;
}

const times: TimeSlot[] = [
  { time: "06:00", hours: 6 },
  { time: "10:00", hours: 10 },
  { time: "14:00", hours: 14 },
  { time: "18:00", hours: 18 },
  { time: "22:00", hours: 22 },
];

//акумуляція по зїдженому корму та ціною корму
export const getTotalAmount = async (generationId: bigint, itemId: number) => {
  //дані про генерацію і всі корми
  const data = await actions.getFeedAmountsAndNames(generationId);

  let amount = 0;
  let price = 0;

  data.forEach((entry) => {
    if (entry.item_id === itemId) {
      amount += entry.total_amount;

      // Додаємо до ціни, якщо вона не null
      if (entry.price !== null) {
        price += (entry.price / 1000) * entry.total_amount;
      }
    }
  });

  return { amount, price };
};

const getLocationSummary = async (location_id: number, today: Date) => {
  const todayCalc = await stockingActions.calculationForLocation(
    location_id,
    today.toISOString().split("T")[0]
  );
  const prevCalc = await stockingActions.getPrevCalc(location_id, todayCalc);
  return { todayCalc, prevCalc };
};

type LocationSummary = {
  uniqueItemId: number;
  totalFeed: number;
};

type locationForFeedWeight = {
  id: number;
  pools: {
    id: number;
    locations: {
      id: number;
      name: string;
    }[];
  }[];
}[];

// Helper to get the periodic value of 'Тип розрахунку годування' for a location and date
export async function getFeedCalculationType(date: Date) {
  const param = await db.parameters.findFirst({
    where: { name: "Тип розрахунку годування" },
  });

  if (!param) {
    console.log(
      "[DEBUG] Parameter 'Тип розрахунку годування' not found, returning '0'"
    );
    return "0";
  }

  const dateStr = date.toISOString().slice(0, 10);

  // Try to find the most recent value on or before the given date
  const valueRecord = await db.parametersvalues.findFirst({
    where: {
      parameter_id: param.id,
      date: {
        lte: new Date(dateStr + "T23:59:59.999Z"), // End of the given date
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  const value = valueRecord?.value ?? "0";
  console.log(`[DEBUG] Feed calculation type for ${dateStr}: ${value}`);

  return value;
}

// Debug function to check all parameters
export async function debugAllParameters() {
  console.log("[DEBUG] Checking all parameters...");
  const allParams = await db.parameters.findMany({
    include: {
      parametersvalues: {
        orderBy: { date: "desc" },
        take: 3,
      },
    },
  });

  allParams.forEach((param) => {
    console.log(`[DEBUG] Parameter: ${param.name} (ID: ${param.id})`);
    param.parametersvalues.forEach((val) => {
      console.log(`  - Date: ${val.date}, Value: ${val.value}`);
    });
  });
}

// Test function to check if the feeding calculation parameter exists
export async function testFeedingCalculationParameter() {
  console.log("[DEBUG] Testing feeding calculation parameter...");

  // Check if parameter exists
  const param = await db.parameters.findFirst({
    where: { name: "Тип розрахунку годування" },
  });

  if (!param) {
    console.log("[DEBUG] Parameter 'Тип розрахунку годування' does not exist!");
    return false;
  }

  console.log(`[DEBUG] Parameter exists with ID: ${param.id}`);

  // Check all values
  const values = await db.parametersvalues.findMany({
    where: { parameter_id: param.id },
    orderBy: { date: "desc" },
  });

  console.log(`[DEBUG] Parameter has ${values.length} values:`);
  values.forEach((val) => {
    console.log(`  - Date: ${val.date}, Value: ${val.value}`);
  });

  return true;
}

// Function to create the feeding calculation parameter if it doesn't exist
export async function ensureFeedingCalculationParameter() {
  console.log("[DEBUG] Ensuring feeding calculation parameter exists...");

  // Check if parameter exists
  let param = await db.parameters.findFirst({
    where: { name: "Тип розрахунку годування" },
  });

  if (!param) {
    console.log("[DEBUG] Creating parameter 'Тип розрахунку годування'...");
    param = await db.parameters.create({
      data: {
        name: "Тип розрахунку годування",
        description:
          "Тип розрахунку годування: 0 - старий (20/80, 40/60, 60/40, 80/20), 1 - новий (50/50)",
        kind: "variable",
      },
    });
    console.log(`[DEBUG] Created parameter with ID: ${param.id}`);
  } else {
    console.log(`[DEBUG] Parameter already exists with ID: ${param.id}`);
  }

  // Check if parameter has a value for today
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const todayValue = await db.parametersvalues.findFirst({
    where: {
      parameter_id: param.id,
      date: {
        lte: new Date(todayStr + "T23:59:59.999Z"),
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  if (!todayValue) {
    console.log(
      "[DEBUG] No value found for today, creating default value '1'..."
    );
    await db.parametersvalues.create({
      data: {
        parameter_id: param.id,
        value: "1", // Default to new 50/50 calculation
        date: new Date(),
      },
    });
    console.log("[DEBUG] Created default value '1'");
  } else {
    console.log(`[DEBUG] Found value for today: ${todayValue.value}`);
  }

  return param;
}

export const getAllSummary = async (
  lines: locationForFeedWeight,
  today: Date
) => {
  const locationSummary: { [itemId: number]: LocationSummary } = {};

  await Promise.all(
    lines.map(async (line) => {
      await Promise.all(
        line.pools.map(async (pool) => {
          await Promise.all(
            pool.locations.map(async (loc) => {
              const isPoolFilled = await isFilled(loc.id);

              if (isPoolFilled == true) {
                const { todayCalc, prevCalc } = await getLocationSummary(
                  loc.id,
                  today
                );

                // Обробка todayCalc
                if (
                  todayCalc &&
                  todayCalc.feed &&
                  todayCalc.calc &&
                  todayCalc.feed.item_id
                ) {
                  const itemId = todayCalc.feed.item_id;
                  let feedPerFeeding = todayCalc.calc.feed_per_feeding;

                  // let feedingEdited

                  const feedTypeValue = await getFeedCalculationType(today);

                  if (todayCalc.calc.transition_day) {
                    if (feedTypeValue === "0") {
                      feedPerFeeding =
                        feedPerFeeding *
                        (1 - todayCalc.calc.transition_day * 0.2);
                    } else if (feedTypeValue === "1") {
                      feedPerFeeding = feedPerFeeding * 0.5;
                    }
                    console.log(
                      `[DEBUG] FeedCalculationType for location_id=${
                        loc.id
                      }, date=${today
                        .toISOString()
                        .slice(
                          0,
                          10
                        )}: value=${feedTypeValue} and feedPerFeeding=${feedPerFeeding}`
                    );
                  }

                  if (!locationSummary[itemId]) {
                    locationSummary[itemId] = {
                      totalFeed: feedPerFeeding,
                      uniqueItemId: itemId,
                    };
                    // console.log(`Додаємо ${feedPerFeeding} до корму: ${itemId}`)
                  } else {
                    locationSummary[itemId].totalFeed += feedPerFeeding;
                    // console.log(`Додаємо ${feedPerFeeding} до корму: ${itemId}`)
                  }
                }

                // Обробка prevCalc
                if (
                  prevCalc &&
                  prevCalc.feed &&
                  prevCalc.calc &&
                  prevCalc.feed.item_id &&
                  todayCalc &&
                  todayCalc.feed &&
                  todayCalc.calc
                ) {
                  const itemId = prevCalc.feed.item_id;
                  let feedPerFeeding = todayCalc.calc.feed_per_feeding;

                  const feedTypeValue = await getFeedCalculationType(today);

                  if (todayCalc.calc.transition_day) {
                    if (feedTypeValue === "0") {
                      feedPerFeeding =
                        feedPerFeeding * (todayCalc.calc.transition_day * 0.2);
                    } else if (feedTypeValue === "1") {
                      feedPerFeeding = feedPerFeeding * 0.5;
                    }
                    console.log(
                      `[DEBUG] FeedCalculationType for location_id=${
                        loc.id
                      }, date=${today
                        .toISOString()
                        .slice(
                          0,
                          10
                        )}: value=${feedTypeValue} and feedPerFeeding=${feedPerFeeding}`
                    );
                  }

                  if (todayCalc.calc.transition_day) {
                    if (!locationSummary[itemId]) {
                      locationSummary[itemId] = {
                        totalFeed: feedPerFeeding,
                        uniqueItemId: itemId,
                      };
                    } else {
                      locationSummary[itemId].totalFeed += feedPerFeeding;
                    }
                  }
                }
              }
            })
          );
        })
      );
    })
  );

  return locationSummary;
};

// басейн заповнений?
export const isFilled = async (location_id: number) => {
  const lastStocking = await db.itemtransactions.findFirst({
    where: {
      documents: {
        doc_type_id: 1, //зариблення
      },
      location_id: location_id,
    },
    orderBy: {
      id: "desc",
    },
    take: 1,
  });

  if (lastStocking && lastStocking?.quantity > 0) {
    return true;
  } else {
    return false;
  }
};

export async function feedBatch(
  formState: { message: string },
  formData: FormData
): Promise<{ message: string }> {
  //console.log("================== FEED BATCH STARTED ==================");
  try {
    // Debug: Log all form data keys and values
    const formDataDebug: Record<string, any> = {};
    formData.forEach((value, key) => {
      formDataDebug[key] = value;
    });
    //console.log("DEBUG - Form Data:", formDataDebug);

    const item_id = parseInt(formData.get("item_id") as string);
    const location_id = parseInt(formData.get("location_id") as string);

    // Calculate total quantity from time slots
    let totalQtyNeeded = 0;
    const timeDebug: Record<string, any> = {};

    for (const time of times) {
      const timeKey = `time_${time.hours}`;
      const qty = parseFloat(formData.get(timeKey) as string);
      timeDebug[timeKey] = qty;
      if (!isNaN(qty)) {
        totalQtyNeeded += qty;
      }
    }

    //console.log("DEBUG - Feed Check:", {
    // item_id,
    //location_id,
    //times: timeDebug,
    //totalQtyNeeded,
    //});

    // Calculate total available stock for the item
    const availableBatches = await getFeedBatchByItemId(item_id, 0, db);
    const totalAvailable = availableBatches
      ? availableBatches.reduce(
          (sum, batch) => sum + (batch._sum.quantity ?? 0),
          0
        )
      : 0;

    // If requested > available, return error
    if (totalQtyNeeded > totalAvailable * 1000) {
      // *1000 if available is in kg and needed is in grams
      return { message: "Not enough feed available: Немає достатньо корму" };
    }

    // Now get batches for the actual needed amount (as before)
    const batchesForFeeding = await getFeedBatchByItemId(
      item_id,
      totalQtyNeeded,
      db
    );

    if (!batchesForFeeding || batchesForFeeding.length === 0) {
      //console.log("DEBUG - No batches found for item:", item_id);
      return { message: "Not enough feed available: Немає достатньо корму" };
    }

    // Create feeding document
    const date = new Date();

    // Create transactions for each time slot
    for (const time of times) {
      const timeKey = `time_${time.hours}`;
      const qty = parseFloat(formData.get(timeKey) as string);

      if (!isNaN(qty) && qty > 0) {
        // Create ONE document for this specific time slot
        const feedTime = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          time.hours,
          0,
          0
        );
        feedTime.setMilliseconds(0);

        const docData = {
          location_id,
          doc_type_id: 9,
          date_time: feedTime.toISOString(),
          executed_by: 3,
          comments: "Годівля",
        };

        // Log the data we're about to send
        //console.error(
        //"Creating document with data:",
        //JSON.stringify(docData, null, 2)
        //);

        const feedDoc = await db.documents.create({
          data: docData,
          // Explicitly select all fields including comments
          select: {
            id: true,
            comments: true,
            date_time: true,
            doc_type_id: true,
            location_id: true,
            executed_by: true,
          },
        });

        // Log the result immediately after creation
        //console.error("Document created:", JSON.stringify(feedDoc, null, 2));

        if (!feedDoc) {
          throw new Error("Failed to create document - no document returned");
        }

        if (!feedDoc.comments) {
          //console.error("Warning: Document created but comments field is null");
        }

        // Process all batch transactions under this single document
        let leftToFeed = qty / 1000; // Convert to kg
        for (const batch of batchesForFeeding) {
          if (leftToFeed <= 0) break;
          const available = batch._sum.quantity ?? 0;
          const consume = Math.min(available, leftToFeed);
          // Negative transaction for warehouse
          await db.itemtransactions.create({
            data: {
              doc_id: feedDoc.id,
              location_id: 87,
              batch_id: batch.batch_id,
              quantity: -consume,
              unit_id: 2,
            },
          });
          // Positive transaction for pool
          await db.itemtransactions.create({
            data: {
              doc_id: feedDoc.id,
              location_id: location_id,
              batch_id: batch.batch_id,
              quantity: consume,
              unit_id: 2,
            },
          });
          leftToFeed -= consume;
        }

        //console.log("DEBUG - Created feed transactions:", {
        //docId: feedDoc.id,
        //timeSlot: time.hours,
        //transactionCount: leftToFeed,
        //});
      }
    }

    return { message: "Feed batch processed successfully" };
  } catch (error) {
    //console.log("DEBUG - Main error:", error);
    return {
      message: `Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Fetch a single feeding row for a given date, location, and item (feed) id.
 * Returns the same structure as a row in the summary feeding table.
 */
export async function fetchFeedingRow({
  date,
  location_id,
  item_id,
  times,
}: {
  date: string;
  location_id: number;
  item_id: number;
  times: { id: number; time: string }[];
}) {
  const db = (await import("@/db")).db;
  const actions = await import("@/actions");
  const stockingActions = await import("@/actions/stocking");

  // 1. Check if pool is filled
  const isPoolFilled = await actions.isFilled(location_id, date);
  if (!isPoolFilled) return null;

  // Get the active priority item for this location and date
  const activePriority = await getActivePriorityItemForDate(location_id, date);
  const activeItemId = activePriority?.item_id || item_id;

  // 2. Get calculation info for this location and date
  const todayCalc = await stockingActions.calculationForLocation(
    location_id,
    date
  );

  // 3. Get feed type info for this item
  const item = await db.items.findUnique({
    where: { id: activeItemId },
    select: {
      id: true,
      name: true,
      feedtypes: { select: { id: true, name: true } },
    },
  });
  if (!item) return null;
  const feedTypeInfo = item.feedtypes;

  // 4. For each time slot, fetch editing/feeding values
  const getEdited = async (hours: number) => {
    const todayDate = new Date(date);
    todayDate.setUTCHours(hours, 0, 0, 0);
    const fedAlready = await db.documents.findMany({
      select: {
        id: true,
        itemtransactions: {
          select: { quantity: true },
          where: {
            location_id: location_id,
            itembatches: { items: { id: activeItemId } },
          },
        },
      },
      where: {
        location_id: location_id,
        doc_type_id: 9,
        date_time: todayDate,
        itemtransactions: {
          some: { itembatches: { items: { id: activeItemId } } },
        },
      },
    });
    return fedAlready.map((doc) => ({
      ...doc,
      hasDocument: doc.itemtransactions.length > 0,
      itemtransactions: doc.itemtransactions.length
        ? doc.itemtransactions
        : [{ quantity: 0 }],
    }));
  };

  // 5. Build feedings array for this item
  const feedings: any[] = [];
  if (todayCalc && todayCalc.feed && todayCalc.feed.item_id === activeItemId) {
    // No transition logic for simplicity; add if needed
    const feedingsResult = Object.fromEntries(
      await Promise.all(
        times.map(async ({ time }) => {
          const hours = Number(time.split(":")[0]);
          const editing = await getEdited(hours);
          const totalEditing = editing.reduce(
            (sum, e) => sum + (e.itemtransactions[0]?.quantity || 0),
            0
          );
          return [
            hours.toString(),
            {
              feeding: todayCalc.calc?.feed_per_feeding?.toFixed(1) || "",
              editing:
                totalEditing !== 0 ? (totalEditing * 1000).toFixed(1) : "",
              hasDocument: editing[0]?.hasDocument || false,
            },
          ];
        })
      )
    );
    feedings.push({
      feedType: todayCalc.feed.type_name || "",
      feedName: todayCalc.feed.item_name || "",
      feedId: todayCalc.feed.item_id,
      feedings: feedingsResult,
    });
  }

  // Get percent_feeding using periodic function
  const percentFeeding = await getPercentFeedingForDate(
    location_id,
    new Date(date)
  );

  // 6. Compose the row object
  return {
    locId: location_id,
    locName: item.name,
    date,
    batch: {
      id: Number(todayCalc?.batch.batch_id),
      name: String(todayCalc?.batch.batch_name),
    },
    rowCount: feedings.length,
    feedings,
    percent_feeding: percentFeeding?.percent_feeding || 0,
    priority: activePriority?.priority || 0,
    priority_item_id: activePriority?.item_id || null,
    priority_item_name: activePriority?.items?.name || null,
  };
}

/**
 * Check if there is enough stock for a planned feeding (pre-submit, no DB changes).
 * Returns { ok: true } or { ok: false, message }.
 */
export async function checkStockBeforeFeed({
  location_id,
  item_id,
  date,
  quantities, // { [time: string]: number }
}: {
  location_id: number;
  item_id: number;
  date: string;
  quantities: Record<string, number>;
}) {
  const db = (await import("@/db")).db;

  // Sum all planned quantities (convert to kg if needed)
  const totalQuantity =
    Object.values(quantities).reduce(
      (sum, q) => sum + (parseFloat(q as any) || 0),
      0
    ) / 1000; // assuming input is in grams

  // Find all batches for this item
  const batches = await db.itembatches.findMany({
    where: { item_id },
    select: { id: true },
  });
  const batchIds = batches.map((b) => b.id);

  // Sum available stock for these batches at WAREHOUSE location (87) - FIXED
  const stock = await db.itemtransactions.aggregate({
    _sum: { quantity: true },
    where: {
      location_id: 87, // WAREHOUSE location - not the pool location
      batch_id: { in: batchIds },
    },
  });
  const available = stock._sum.quantity || 0;

  if (available < totalQuantity) {
    return { ok: false, message: "Not enough stock (pre-submit check)" };
  }
  return { ok: true };
}
