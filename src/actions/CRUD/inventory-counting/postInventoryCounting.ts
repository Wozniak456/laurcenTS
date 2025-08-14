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
    const inventoryCounting = await db.inventory_counting.findUnique({
      where: { id: inventory_counting_id },
      include: {
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

    // 3. Check if already posted (doc_id exists)
    if (inventoryCounting.doc_id) {
      return {
        errors: {
          _form: ["Інвентаризація вже проведена"],
        },
      };
    }

    // 4. Create the document first
    const document = await db.documents.create({
      data: {
        location_id: 87, // Warehouse location
        doc_type_id: 15, // Inventory counting document type
        date_time: inventoryCounting.posting_date_time, // Use the planned posting date
        executed_by: 3, // Default executor
        comments: "Інвентаризація кормів",
        date_time_posted: new Date(), // Current time when posted in system
      },
    });

    // 5. Update the inventory counting to link to the document
    await db.inventory_counting.update({
      where: { id: inventory_counting_id },
      data: {
        doc_id: document.id,
      },
    });

    // 6. For each line, create an itemtransaction if there is a difference
    let transactionsCreated = 0;

    for (const line of inventoryCounting.inventory_counting_lines) {
      const difference = line.difference;

      // Only create transactions if there's a difference (tolerance 0.001)
      if (difference !== null && Math.abs(difference) > 0.001) {
        // Use the batch_id from the inventory counting line directly
        if (line.batch_id && line.unit_id) {
          // Create adjustment transaction for the difference
          // The transaction is linked to the same document (doc_type_id = 15)
          const transaction = await db.itemtransactions.create({
            data: {
              doc_id: document.id, // Document with doc_type_id = 15
              location_id: 87, // Warehouse location
              batch_id: line.batch_id, // Use the selected batch from inventory counting line
              quantity: difference, // Positive for additions, negative for reductions
              unit_id: line.unit_id,
            },
          });

          // Update the inventory counting line with the transaction reference
          await db.inventory_counting_lines.update({
            where: { id: line.id },
            data: {
              itemtransaction_id: transaction.id,
            },
          });

          transactionsCreated++;
        }
      }
    }

    // 7. Revalidate the inventory counting view
    revalidatePath("/inventory-counting/view");
    return {
      message: `Інвентаризацію проведено. Створено ${transactionsCreated} транзакцій для коригування залишків.`,
    };
  } catch (error: any) {
    // 8. Handle errors
    return {
      errors: {
        _form: [error.message || "Помилка при проведенні інвентаризації"],
      },
    };
  }
}
