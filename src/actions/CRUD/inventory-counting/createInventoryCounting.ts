"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateInventoryCountingFormState = {
  errors?: {
    posting_date_time?: string[];
    _form?: string[];
  };
  message?: string;
};

export async function createInventoryCounting(
  formState: CreateInventoryCountingFormState,
  formData: FormData
): Promise<CreateInventoryCountingFormState> {
  try {
    const posting_date_time = formData.get("posting_date_time") as string;
    const executed_by = parseInt(formData.get("executed_by") as string) || 3;

    if (!posting_date_time) {
      return {
        errors: {
          posting_date_time: ["Дата та час проведення обов'язкові"],
        },
      };
    }

    // Create the document first
    const document = await db.documents.create({
      data: {
        location_id: 87, // Warehouse location
        doc_type_id: 15, // Inventory counting document type
        date_time: new Date(),
        executed_by: executed_by,
        comments: "Інвентаризація кормів",
      },
    });

    // Create the inventory counting header
    const inventoryCounting = await db.inventory_counting.create({
      data: {
        doc_id: document.id,
        posting_date_time: new Date(posting_date_time),
      },
    });

    revalidatePath("/inventory-counting/view");
    return { message: "Інвентаризацію створено успішно" };
  } catch (error: any) {
    return {
      errors: {
        _form: [error.message || "Помилка при створенні інвентаризації"],
      },
    };
  }
}
