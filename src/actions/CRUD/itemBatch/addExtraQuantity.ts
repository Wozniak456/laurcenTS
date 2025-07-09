"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addExtraQuantity(
  formState: { message: string },
  formData: FormData
) {
  try {
    const batch_id: bigint = BigInt(formData.get("batch_id") as string);
    const extra_quantity: number = parseFloat(
      formData.get("extra_quantity") as string
    );
    const executed_by: number =
      parseInt(formData.get("executed_by") as string) || 3;
    const comments: string =
      (formData.get("comments") as string) || "Додавання додаткової кількості";

    if (!extra_quantity || extra_quantity <= 0) {
      throw new Error("Кількість повинна бути більше 0");
    }

    // Verify the batch exists
    const batch = await db.itembatches.findUnique({
      where: { id: batch_id },
      include: { items: true },
    });

    if (!batch) {
      throw new Error("Партія не знайдена");
    }

    // Get the original batch creation document's datetime and unit_id
    const originalDocument = await db.itemtransactions.findFirst({
      select: {
        unit_id: true,
        documents: {
          select: {
            date_time: true,
          },
        },
      },
      where: {
        documents: {
          doc_type_id: 8, // Batch registration type
        },
        batch_id: batch_id,
      },
    });

    if (!originalDocument) {
      throw new Error("Оригінальний документ партії не знайдено");
    }

    // Use the original document's datetime and unit_id
    const originalDateTime = originalDocument.documents.date_time;
    const unit_id = originalDocument.unit_id;

    // Create a document for the extra quantity addition with the same datetime
    const document = await db.documents.create({
      data: {
        location_id: 87, // Warehouse location
        doc_type_id: 8, // Batch registration type
        executed_by: executed_by,
        comments: comments,
        date_time: originalDateTime, // Use the original datetime
      },
    });

    // Create a transaction to add the extra quantity
    await db.itemtransactions.create({
      data: {
        doc_id: document.id,
        location_id: 87, // Warehouse location
        batch_id: batch_id,
        quantity: extra_quantity,
        unit_id: unit_id,
      },
    });

    return {
      message: `Додано ${extra_quantity} одиниць до партії ${batch.name}`,
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
