"use server";

import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { isPoolOperationsAllowed } from "@/utils/poolUtils";
import { createCalcTable } from "@/actions/crutial/createCalcTable";

function addCurrentTimeToDate(date: Date) {
  const now = new Date();

  date.setHours(now.getHours());
  date.setMinutes(now.getMinutes());
  date.setSeconds(now.getSeconds());
  date.setMilliseconds(now.getMilliseconds());

  return date;
}

export async function additionalStocking(
  formStateOrData: { message: string } | undefined | FormData,
  formData?: FormData
): Promise<{ message: string } | undefined> {
  // Handle both cases: called from useFormState and called directly
  const actualFormData = formData || (formStateOrData as FormData);
  const today: string = actualFormData.get("today") as string;

  try {
    const location_id: number = parseInt(
      actualFormData.get("location_id") as string
    );
    const batch_id: number = parseInt(actualFormData.get("batch_id") as string);
    const additional_quantity_str = actualFormData.get(
      "additional_quantity"
    ) as string;
    const additional_quantity: number = additional_quantity_str
      ? parseInt(additional_quantity_str)
      : 0;
    const current_average_weight_str = actualFormData.get(
      "current_average_weight"
    ) as string;
    const current_average_weight: number = current_average_weight_str
      ? parseFloat(current_average_weight_str.replace(",", "."))
      : 0;

    const executed_by = 3;

    // Validation
    if (
      !location_id ||
      !batch_id ||
      !additional_quantity ||
      additional_quantity <= 0
    ) {
      return {
        message: "Необхідно вказати всі обов'язкові поля",
      };
    }

    // Check if pool operations are allowed (no posted operations after this date)
    const operationsCheck = await isPoolOperationsAllowed(location_id, today);
    if (!operationsCheck.allowed) {
      return {
        message: `Операція заблокована: ${operationsCheck.reason}`,
      };
    }

    // Check if there's enough fish in the warehouse (location_id = 87)
    const fish_amount_on_warehouse = await db.itemtransactions.groupBy({
      by: ["batch_id"],
      where: {
        location_id: 87,
        batch_id: batch_id,
      },
      _sum: {
        quantity: true,
      },
    });

    const fishQuantityOnWarehouse =
      fish_amount_on_warehouse[0]?._sum?.quantity || 0;

    if (
      fishQuantityOnWarehouse === 0 ||
      additional_quantity > fishQuantityOnWarehouse
    ) {
      return {
        message: "Недостатня кількість на складі",
      };
    }

    // Create document with current time
    const date = addCurrentTimeToDate(new Date(today));

    // Find all documents for this location and date, ordered by time
    const startOfDay = new Date(today);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingDocs = await db.documents.findMany({
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

    // Create additional stocking document
    const stockDoc = await db.documents.create({
      data: {
        location_id: location_id,
        doc_type_id: 1, // Stocking document type
        date_time: date,
        executed_by: executed_by,
        comments: "Дозариблення",
      },
    });

    if (!stockDoc) {
      throw new Error("Помилка при створенні документа дозариблення");
    }

    // Create transaction for taking fish from warehouse (negative transaction)
    const fetchTran = await db.itemtransactions.create({
      data: {
        doc_id: stockDoc.id,
        location_id: 87, // Warehouse location
        batch_id: batch_id,
        quantity: -additional_quantity,
        unit_id: 1,
      },
    });

    if (!fetchTran) {
      throw new Error(
        "Помилка при створенні транзакції для витягування зі складу"
      );
    }

    // Create transaction for adding fish to pool (positive transaction)
    const stockTran = await db.itemtransactions.create({
      data: {
        doc_id: stockDoc.id,
        location_id: location_id,
        batch_id: batch_id,
        quantity: additional_quantity,
        unit_id: 1,
        parent_transaction: fetchTran.id,
      },
    });

    if (!stockTran) {
      throw new Error("Помилка при створенні транзакції для дозариблення");
    }

    // Create new stocking record with the same average weight
    await db.stocking.create({
      data: {
        doc_id: stockDoc.id,
        average_weight: current_average_weight,
        form_average_weight: current_average_weight,
      },
    });

    // Create batch_generation record (missing logic from stockPool)
    // Find previous batch_generation for this location
    const prevBatchGen = await db.batch_generation.findFirst({
      where: {
        location_id: location_id,
      },
      orderBy: { id: "desc" },
    });

    const newBatchGen = await db.batch_generation.create({
      data: {
        location_id: location_id,
        initial_batch_id: batch_id,
        first_parent_id: prevBatchGen?.id,
        transaction_id: stockTran.id,
      },
    });

    // Process feed amounts from previous generation (missing logic from stockPool)
    if (prevBatchGen && prevBatchGen.id) {
      // Get feed amounts from previous generation
      const feedAmounts = await getFeedAmountsAndNames(prevBatchGen.id);

      // Create generation_feed_amount records for the new generation
      for (const feedAmount of feedAmounts) {
        await db.generation_feed_amount.create({
          data: {
            batch_generation_id: newBatchGen.id,
            feed_batch_id: feedAmount.feed_batch_id,
            amount: feedAmount.total_amount,
            doc_id: stockDoc.id,
          },
        });
      }
    }

    // Create feeding calculations (missing logic from stockPool)
    actualFormData.set("parent_doc", String(stockDoc.id));
    actualFormData.set("fish_amount", String(additional_quantity));
    actualFormData.set("location_id_to", String(location_id));
    actualFormData.set("average_fish_mass", String(current_average_weight));

    await createCalcTable({ message: "" }, actualFormData);

    revalidatePath(`/pool-managing/day/${today}`);
    revalidatePath("/summary-feeding-table/week");
    revalidatePath("/accumulation/view");

    return {
      message: `Успішно дозариблено ${additional_quantity} риб`,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes("Foreign key constraint failed")) {
        return {
          message: "Помилка з зовнішнім ключем в базі даних",
        };
      } else {
        return {
          message: err.message,
        };
      }
    } else {
      return { message: "Щось пішло не так!" };
    }
  }
}

async function getFeedAmountsAndNames(batch_generation_id: bigint): Promise<
  Array<{
    batch_generation_id: bigint;
    feed_batch_id: bigint;
    total_amount: number;
  }>
> {
  try {
    const result = await db.generation_feed_amount.groupBy({
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
