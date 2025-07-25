"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { createCalcTable } from "./createCalcTable";
import { isPoolOperationsAllowed } from "@/utils/poolUtils";

function addCurrentTimeToDate(date: Date) {
  if (!(date instanceof Date)) {
    throw new Error("Input must be a Date object.");
  }

  const now = new Date();

  date.setHours(now.getHours());
  date.setMinutes(now.getMinutes());
  date.setSeconds(now.getSeconds());
  date.setMilliseconds(now.getMilliseconds());

  return date;
}

export async function stockPool(
  formState: { message: string } | undefined,
  formData: FormData,
  prisma?: any // Приймаємо prisma тут
): Promise<{ message: string } | undefined> {
  const today: string = formData.get("today") as string;

  try {
    //console.log("stockPool");
    //console.log(formData);

    const activeDb = prisma || db;

    let location_id_from: number = parseInt(
      formData.get("location_id_from") as string
    );

    const location_id_to: number = parseInt(
      formData.get("location_id_to") as string
    );
    const batch_id_str = formData.get("batch_id") as string;
    const batch_id_from: number = batch_id_str ? parseInt(batch_id_str) : 0;
    const batch_id_to_str = formData.get("batch_id_to") as string;
    let batch_id_to: number = batch_id_to_str ? parseInt(batch_id_to_str) : 0;
    const stocking_quantity_str = formData.get("fish_amount") as string;
    const stocking_quantity: number = stocking_quantity_str
      ? parseInt(stocking_quantity_str)
      : 0;
    const quantity_in_location_to_str = formData.get(
      "fish_amount_in_location_to"
    ) as string;
    let quantity_in_location_to: number = quantity_in_location_to_str
      ? parseInt(quantity_in_location_to_str)
      : 0;
    const fish_qty_in_location_from_str = formData.get(
      "fish_qty_in_location_from"
    ) as string;
    const fish_qty_in_location_from: number = fish_qty_in_location_from_str
      ? parseInt(fish_qty_in_location_from_str)
      : 0;
    const average_weight_str = formData.get("average_fish_mass") as string;
    const average_weight = average_weight_str
      ? parseFloat(average_weight_str.replace(",", "."))
      : 0;
    const form_average_weight_str = formData.get(
      "form_average_weight"
    ) as string;
    const form_average_weight = form_average_weight_str
      ? parseFloat(form_average_weight_str.replace(",", "."))
      : null;

    const executed_by = 3; //number = parseInt(formData.get('executed_by') as string);
    const comments: string = formData.get("comments") as string;

    // Check if pool operations are allowed (no posted operations after this date)
    // Only check for destination location if it's different from source
    if (location_id_to !== location_id_from) {
      const operationsCheck = await isPoolOperationsAllowed(
        location_id_to,
        today
      );
      if (!operationsCheck.allowed) {
        return {
          message: `Операція заблокована: ${operationsCheck.reason}`,
        };
      }
    }

    // const p_tran: number = parseInt(formData.get('p_tran') as string);

    // перевірка, щоб зі складу не взяли більше, ніж є

    if (location_id_from == 87 && batch_id_from && stocking_quantity > 0) {
      const fish_amount_on_warehouse = await activeDb.itemtransactions.groupBy({
        by: ["batch_id"],
        where: {
          location_id: 87,
          batch_id: batch_id_from,
        },
        _sum: {
          quantity: true,
        },
      });

      const fishQuantityOnWarehouse =
        fish_amount_on_warehouse[0]?._sum?.quantity || 0;

      if (
        fishQuantityOnWarehouse === 0 ||
        stocking_quantity > fishQuantityOnWarehouse
      ) {
        throw new Error("Недостатня кількість на складі");
      }
    }

    //якщо зі складу, то batch_id_to не визначено, якщо з басейна, то batch_id_to = та партія, якої більше
    if (!batch_id_to) {
      batch_id_to = batch_id_from;
    }

    // документ зариблення
    const parent_document = formData.get("parent_document");
    const date = addCurrentTimeToDate(new Date(today));

    // Find all documents for this location and date, ordered by time
    const startOfDay = new Date(today);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingDocs = await activeDb.documents.findMany({
      where: {
        location_id: location_id_to,
        date_time: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      orderBy: {
        date_time: "desc",
      },
    });

    // Find any documents with the exact same timestamp or later
    const conflictingDocs = existingDocs.filter(
      (doc: { date_time: Date }) => doc.date_time.getTime() >= date.getTime()
    );

    // If there are any conflicts, set our time to 1ms after the latest one
    if (conflictingDocs.length > 0) {
      const latestTime = Math.max(
        ...conflictingDocs.map((doc: { date_time: Date }) =>
          doc.date_time.getTime()
        )
      );
      date.setTime(latestTime + 1);
    }

    const stockDoc = await activeDb.documents.create({
      data: {
        location_id: location_id_to,
        doc_type_id: 1,
        date_time: date,
        executed_by: executed_by,
        comments: comments,
        parent_document: parent_document
          ? BigInt(parent_document as string)
          : undefined,
      },
    });

    if (!stockDoc) {
      throw new Error("Помилка при створенні документа зариблення");
    }

    //console.log(`\n документ зариблення для ${location_id_to}`, stockDoc.id);

    // транзакція для витягування з попереднього басейна stocking_quantity
    const doc_type_id = formData.get("doc_type_id")
      ? parseInt(formData.get("doc_type_id") as string)
      : 1;
    let fetchTran = null;
    if (doc_type_id !== 13) {
      fetchTran = await activeDb.itemtransactions.create({
        data: {
          doc_id: stockDoc.id,
          location_id: location_id_from,
          batch_id: batch_id_from,
          quantity: -stocking_quantity,
          unit_id: 1,
          // parent_transaction: p_tran
        },
      });

      if (!fetchTran) {
        throw new Error(
          "Помилка при створенні транзакції для витягування з попереднього басейна"
        );
      }

      //console.log(
      //` Витягуємо з попереднього для ${location_id_to}. Tran: `,
      //fetchTran
      //);
    }

    //визначаємо яку кількість зариблювати

    const count_to_stock = stocking_quantity;

    //знайти дані про останнє покоління з попередньої локації

    const prev_generation = await activeDb.batch_generation.findFirst({
      where: {
        location_id: location_id_from,
      },
      orderBy: {
        id: "desc",
      },
      take: 1,
    });

    //console.log("prev_generation", prev_generation);

    const first_parent_generation = prev_generation;

    let second_parent_generation;

    //знайти дані про останнє покоління з нової локації
    if (quantity_in_location_to) {
      const generationTo = await activeDb.batch_generation.findFirst({
        where: {
          location_id: location_id_to,
        },
        orderBy: {
          id: "desc",
        },
        take: 1,
      });

      second_parent_generation = generationTo;
    }

    // транзакція для зариблення нового басейна

    let stockTran;
    let negativeStockTran;
    if (location_id_from !== location_id_to && doc_type_id === 13) {
      // Create negative transaction first for growout location
      negativeStockTran = await activeDb.itemtransactions.create({
        data: {
          doc_id: stockDoc.id,
          location_id: location_id_to,
          batch_id: batch_id_to,
          quantity: -count_to_stock,
          unit_id: 1,
        },
      });
      // Create positive transaction referencing the negative one
      stockTran = await activeDb.itemtransactions.create({
        data: {
          doc_id: stockDoc.id,
          location_id: location_id_to,
          batch_id: batch_id_to, //
          quantity: count_to_stock,
          unit_id: 1,
          parent_transaction: negativeStockTran.id,
        },
      });
    } else {
      // Same location logic (original)
      stockTran = await activeDb.itemtransactions.create({
        data: {
          doc_id: stockDoc.id,
          location_id: location_id_to,
          batch_id: batch_id_to, //
          quantity: count_to_stock,
          unit_id: 1,
          parent_transaction: fetchTran ? fetchTran.id : undefined,
        },
      });
    }

    if (!stockTran) {
      throw new Error(
        "Помилка при створенні транзакції для зариблення нового басейна"
      );
    }
    //console.log(`Зариблюємо ${location_id_to}. Tran: `, stockTran);

    // Fetch the last stocking record for the destination location
    const lastStocking = await activeDb.stocking.findFirst({
      where: {
        documents: {
          location_id: location_id_to,
          doc_type_id: 1,
        },
      },
      orderBy: {
        documents: {
          date_time: "desc",
        },
      },
      include: {
        documents: true,
      },
    });

    // Calculate form_average_weight in grams from the form value
    const formAvgWeightGrams =
      form_average_weight !== null && !isNaN(form_average_weight)
        ? Math.round(form_average_weight * 1000) / 1000 // already in grams, just round
        : null;

    // Use previous quantity and average (before addition) and transferred quantity and average, all in grams
    const prevQty = quantity_in_location_to; // before addition
    const prevAvgWeight = lastStocking?.average_weight || 0; // Use actual previous average weight from stocking record
    const addQty = stocking_quantity;
    const addAvgWeight = formAvgWeightGrams;
    let calculatedAvgWeightGrams = formAvgWeightGrams;

    //console.log("Average weight calculation:", {
    // prevQty,
    // prevAvgWeight,
    //addQty,
    //addAvgWeight,
    //formAvgWeightGrams,
    //});

    if (
      prevQty &&
      !isNaN(prevQty) &&
      addQty &&
      !isNaN(addQty) &&
      prevAvgWeight !== null &&
      addAvgWeight !== null
    ) {
      const newTotal = prevQty + addQty;
      calculatedAvgWeightGrams =
        Math.round(
          ((prevQty * prevAvgWeight + addQty * addAvgWeight) / newTotal) * 1000
        ) / 1000;
      //console.log("Calculated new average weight:", calculatedAvgWeightGrams);
    } else if (formAvgWeightGrams !== null) {
      calculatedAvgWeightGrams = formAvgWeightGrams;
      //console.log("Using form average weight:", calculatedAvgWeightGrams);
    } else {
      calculatedAvgWeightGrams = 0;
      //console.log("No valid weights, defaulting to 0");
    }

    // Always create a stocking record for every stocking document
    await activeDb.stocking.create({
      data: {
        doc_id: stockDoc.id,
        average_weight: calculatedAvgWeightGrams
          ? calculatedAvgWeightGrams
          : average_weight,
        ...(formAvgWeightGrams !== null
          ? { form_average_weight: formAvgWeightGrams }
          : {}),
      },
    });

    // For GrowOut to a different location with doc_type_id 13, create feeding calculation only (do not create stocking record again)
    if (doc_type_id === 13 && location_id_from !== location_id_to) {
      formData.set("parent_doc", String(stockDoc.id));
      formData.set("fish_amount", String(count_to_stock));
      formData.set("location_id_to", String(location_id_to));
      formData.set("average_fish_mass", String(calculatedAvgWeightGrams));
      await createCalcTable(formState, formData, prisma);
    }

    // Create batch generation if we have a parent document or if locations are different
    if (parent_document || location_id_from !== location_id_to) {
      // створити покоління змішування партії
      const generationOfTwoBatches = await activeDb.batch_generation.create({
        data: {
          location_id: location_id_to,
          initial_batch_id: batch_id_to,
          first_parent_id: first_parent_generation?.id,
          second_parent_id: second_parent_generation?.id,
          transaction_id: stockTran.id,
        },
      });

      //console.log("????generationOfTwoBatches", generationOfTwoBatches);

      // Handle feed amounts only if locations are different
      if (location_id_from !== location_id_to) {
        if (first_parent_generation && first_parent_generation.id) {
          // знаходимо скільки зїв перший предок
          const grouped_first_ancestor = await getFeedAmountsAndNames(
            first_parent_generation.id,
            prisma
          );
          //console.log("grouped_first_ancestor", grouped_first_ancestor);

          //знаходимо який відсоток ми переміщаємо
          //console.log(
          //"stocking_quantity",
          //stocking_quantity,
          //"fish_qty_in_location_from",
          //fish_qty_in_location_from
          //);
          if (!Number.isNaN(fish_qty_in_location_from))
            if (fish_qty_in_location_from > 0) {
              const part = stocking_quantity / fish_qty_in_location_from;
              //console.log("Calculated part:", part);
              //console.log(
              //"Number of records to process:",
              //grouped_first_ancestor.length
              //);
              for (const record of grouped_first_ancestor) {
                //console.log("Processing record:", {
                //batch_generation_id: record.batch_generation_id,
                //total_amount: record.total_amount,
                //feed_batch_id: record.feed_batch_id,
                //calculated_amount: record.total_amount * part,
                //});
                try {
                  const fetch_record =
                    await activeDb.generation_feed_amount.create({
                      data: {
                        amount: -record.total_amount * part,
                        batch_generation: {
                          connect: {
                            id: record.batch_generation_id,
                          },
                        },
                        feed_batches: {
                          connect: {
                            id: record.feed_batch_id,
                          },
                        },
                        documents: {
                          connect: {
                            id: stockDoc.id,
                          },
                        },
                      },
                    });

                  //console.log(
                  //`витягнули частку зЇдженого: ${fetch_record.feed_batch_id}: ${fetch_record.amount}. і накинули на ${generationOfTwoBatches.id}`
                  //);
                } catch (error) {
                  //console.log("Error creating fetch record:", error);
                }
              }
            }
        }
      }
    }

    // тепер fish_amount це вся риба, яку зариблюємо.
    formData.set("fish_amount", String(count_to_stock));
    formData.set("parent_doc", String(stockDoc.id));

    // })

    await createCalcTable(formState, formData, prisma);

    //console.log("Створили calc table");
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes("Foreign key constraint failed")) {
        return {
          message: "There is no any item or purchaseTitle with such id.",
        };
      } else {
        return {
          message: err.message,
        };
      }
    } else {
      return { message: "Something went wrong!" };
    }
  }

  revalidatePath(`/pool-managing/day/${today}`);
  revalidatePath("/summary-feeding-table/week");
}

async function getFeedAmountsAndNames(
  batch_generation_id: bigint,
  prisma: any
): Promise<
  Array<{
    batch_generation_id: bigint;
    feed_batch_id: bigint;
    total_amount: number;
  }>
> {
  const activeDb = prisma || db;

  try {
    const result = await activeDb.generation_feed_amount.groupBy({
      by: ["batch_generation_id", "feed_batch_id"],
      where: {
        batch_generation_id: batch_generation_id,
      },
      _sum: {
        amount: true,
      },
    });

    if (!result || !Array.isArray(result)) {
      return [];
    }

    return result.map((item: any) => ({
      batch_generation_id: item.batch_generation_id,
      feed_batch_id: item.feed_batch_id,
      total_amount: item._sum?.amount || 0,
    }));
  } catch (error) {
    console.error("Error in getFeedAmountsAndNames:", error);
    return [];
  }
}
