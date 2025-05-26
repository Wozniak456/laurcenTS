"use server";

import { db } from "@/db";
import * as actions from "@/actions";
import * as stockingActions from "@/actions/stocking";
import { getFeedBatchByItemId } from "../crutial/getFeedBatchByItemId";

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

                  if (todayCalc.calc.transition_day) {
                    feedPerFeeding =
                      feedPerFeeding *
                      (1 - todayCalc.calc.transition_day * 0.2);
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

                  if (todayCalc.calc.transition_day) {
                    feedPerFeeding =
                      feedPerFeeding * (todayCalc.calc.transition_day * 0.2);
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
  console.log("================== FEED BATCH STARTED ==================");
  try {
    // Debug: Log all form data keys and values
    const formDataDebug: Record<string, any> = {};
    formData.forEach((value, key) => {
      formDataDebug[key] = value;
    });
    console.log("DEBUG - Form Data:", formDataDebug);

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

    console.log("DEBUG - Feed Check:", {
      item_id,
      location_id,
      times: timeDebug,
      totalQtyNeeded,
    });

    // Check stock availability
    try {
      console.log("DEBUG - Checking stock for:", {
        item_id,
        quantity: totalQtyNeeded,
      });

      const availableBatches = await getFeedBatchByItemId(
        item_id,
        totalQtyNeeded,
        db
      );

      console.log("DEBUG - Stock check result:", {
        success: !!availableBatches,
        batchCount: availableBatches?.length || 0,
      });

      if (!availableBatches || availableBatches.length === 0) {
        console.log("DEBUG - No batches found for item:", item_id);
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
          console.error(
            "Creating document with data:",
            JSON.stringify(docData, null, 2)
          );

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
          console.error("Document created:", JSON.stringify(feedDoc, null, 2));

          if (!feedDoc) {
            throw new Error("Failed to create document - no document returned");
          }

          if (!feedDoc.comments) {
            console.error(
              "Warning: Document created but comments field is null"
            );
          }

          // Process all batch transactions under this single document
          let leftToFeed = qty / 1000; // Convert to kg
          for (const batch of availableBatches) {
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

          console.log("DEBUG - Created feed transactions:", {
            docId: feedDoc.id,
            timeSlot: time.hours,
            transactionCount: leftToFeed,
          });
        }
      }

      return { message: "Feed batch processed successfully" };
    } catch (error) {
      console.log("DEBUG - Stock check error:", error);
      if (error instanceof Error && error.message === "Немає достатньо корму") {
        return { message: "Not enough feed available: Немає достатньо корму" };
      }
      throw error;
    }
  } catch (error) {
    console.log("DEBUG - Main error:", error);
    return {
      message: `Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
