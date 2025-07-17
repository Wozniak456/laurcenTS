"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

export type PostInventoryCountingFormState = {
  errors?: {
    inventory_counting_id?: string[];
    _form?: string[];
  };
  message?: string;
};

export async function postInventoryCounting(
  formState: PostInventoryCountingFormState,
  formData: FormData
): Promise<PostInventoryCountingFormState> {
  try {
    // 1. Parse inventory counting ID from form data
    const inventory_counting_id = BigInt(
      formData.get("inventory_counting_id") as string
    );

    if (!inventory_counting_id) {
      // If no ID provided, return error
      return {
        errors: {
          inventory_counting_id: ["ID інвентаризації обов'язковий"],
        },
      };
    }

    // 2. Fetch the inventory counting document and its lines
    //    The related document (documents) is created with doc_type_id = 15 (see createInventoryCounting.ts)
    const inventoryCounting = await db.inventory_counting.findUnique({
      where: { id: inventory_counting_id },
      include: {
        documents: true, // This is the document with doc_type_id = 15
        inventory_counting_lines: {
          include: {
            items: {
              include: {
                itembatches: true,
              },
            },
          },
        },
      },
    });

    if (!inventoryCounting) {
      // If not found, return error
      return {
        errors: {
          _form: ["Інвентаризація не знайдена"],
        },
      };
    }

    // 3. Check if already posted (date_time_posted matches posting_date_time)
    if (
      inventoryCounting.documents.date_time_posted &&
      inventoryCounting.documents.date_time_posted.getTime() ===
        inventoryCounting.posting_date_time.getTime()
    ) {
      return {
        errors: {
          _form: ["Інвентаризація вже проведена"],
        },
      };
    }

    // 4. For each line, create an itemtransaction if there is a difference
    let transactionsCreated = 0;

    for (const line of inventoryCounting.inventory_counting_lines) {
      const difference = line.difference;

      // Only create transactions if there's a difference (tolerance 0.001)
      if (difference !== null && Math.abs(difference) > 0.001) {
        // Get the first available batch for this item
        const batch = line.items.itembatches[0];

        if (batch && line.unit_id) {
          // Create adjustment transaction for the difference
          // The transaction is linked to the same document (doc_type_id = 15)
          const transaction = await db.itemtransactions.create({
            data: {
              doc_id: inventoryCounting.documents.id, // Document with doc_type_id = 15
              location_id: 87, // Warehouse location
              batch_id: batch.id,
              quantity: difference, // Positive for additions, negative for reductions
              unit_id: line.unit_id,
            },
          });

          // Update the inventory counting line with the transaction reference
          // TODO: Uncomment after regenerating Prisma client
          /*
          await db.inventory_counting_lines.update({
            where: { id: line.id },
            data: {
              itemtransaction_id: transaction.id,
            },
          });
          */

          transactionsCreated++;
        }
      }
    }

    // 5. Update the document's posting time to mark as posted
    await db.documents.update({
      where: { id: inventoryCounting.documents.id },
      data: {
        date_time_posted: inventoryCounting.posting_date_time,
      },
    });

    // 6. Revalidate the inventory counting view
    revalidatePath("/inventory-counting/view");
    return {
      message: `Інвентаризацію проведено. Створено ${transactionsCreated} транзакцій для коригування залишків.`,
    };
  } catch (error: any) {
    // 7. Handle errors
    return {
      errors: {
        _form: [error.message || "Помилка при проведенні інвентаризації"],
      },
    };
  }
}
