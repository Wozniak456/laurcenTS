"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

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

export async function cleanupLeftovers(
  formState: { message: string } | undefined,
  formData: FormData
): Promise<{ message: string } | undefined> {
  try {
    const batch_id: number = parseInt(formData.get("batch_id") as string);
    const cleanup_date: string = formData.get("cleanup_date") as string;

    if (!batch_id || !cleanup_date) {
      throw new Error("Missing required parameters");
    }

    // Get the actual stock quantity from location 87 (warehouse)
    const stockResult = await db.itemtransactions.groupBy({
      by: ["batch_id"],
      where: {
        batch_id: batch_id,
        location_id: 87, // Warehouse location
      },
      _sum: {
        quantity: true,
      },
    });

    const stockQuantity = stockResult[0]?._sum.quantity || 0;

    if (stockQuantity <= 0) {
      throw new Error("Немає залишків для очищення на складі");
    }

    // Check if document type 14 exists, if not create it
    let docType = await db.doctype.findUnique({
      where: { id: 14 },
    });

    if (!docType) {
      docType = await db.doctype.create({
        data: {
          id: 14,
          name: "Очищення залишків",
          description: "Документ для очищення залишків корму",
        },
      });
    }

    // Create cleanup document
    const cleanupDoc = await db.documents.create({
      data: {
        location_id: 87, // Warehouse location
        doc_type_id: 14, // Cleanup document type
        date_time: addCurrentTimeToDate(new Date(cleanup_date)),
        executed_by: 3,
        comments: `Очищення залишків партії ${batch_id}`,
      },
    });

    // Create negative transaction to write off the quantity from warehouse
    const cleanupTran = await db.itemtransactions.create({
      data: {
        doc_id: cleanupDoc.id,
        location_id: 87, // Warehouse location
        batch_id: batch_id,
        quantity: -stockQuantity, // Negative to write off
        unit_id: 2, // Assuming unit_id 2 is for feed (kg)
      },
    });

    revalidatePath("/leftovers/view");
    revalidatePath("/leftovers/[period]");

    return {
      message: `Успішно очищено ${stockQuantity.toFixed(3)} кг залишків`,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        message: err.message,
      };
    } else {
      return { message: "Something went wrong!" };
    }
  }
}
