"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

export type DeleteInventoryCountingFormState = {
  errors?: {
    inventory_counting_id?: string[];
    _form?: string[];
  };
  message?: string;
};

export async function deleteInventoryCounting(
  formState: DeleteInventoryCountingFormState,
  formData: FormData
): Promise<DeleteInventoryCountingFormState> {
  try {
    const inventory_counting_id = BigInt(
      formData.get("inventory_counting_id") as string
    );

    if (!inventory_counting_id) {
      return {
        errors: {
          inventory_counting_id: ["ID інвентаризації обов'язковий"],
        },
      };
    }

    // Get the inventory counting document
    const inventoryCounting = await db.inventory_counting.findUnique({
      where: { id: inventory_counting_id },
      include: {
        documents: true,
        inventory_counting_lines: true,
      },
    });

    if (!inventoryCounting) {
      return {
        errors: {
          _form: ["Інвентаризація не знайдена"],
        },
      };
    }

    // Check if already posted (has doc_id)
    if (inventoryCounting.doc_id) {
      return {
        errors: {
          _form: ["Не можна видалити проведену інвентаризацію"],
        },
      };
    }

    // Allow deletion of draft documents (no validation needed)

    // Delete the inventory counting (this will cascade delete lines)
    await db.inventory_counting.delete({
      where: { id: inventory_counting_id },
    });

    revalidatePath("/inventory-counting/view");
    return {
      message: "Інвентаризацію видалено успішно",
    };
  } catch (error: any) {
    return {
      errors: {
        _form: [error.message || "Помилка при видаленні інвентаризації"],
      },
    };
  }
}
