"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

export type DeleteInventoryLineFormState = {
  errors?: {
    line_id?: string[];
    _form?: string[];
  };
  message?: string;
};

export async function deleteInventoryLine(
  formState: DeleteInventoryLineFormState,
  formData: FormData
): Promise<DeleteInventoryLineFormState> {
  try {
    console.log("DeleteInventoryLine called with formData:", {
      line_id: formData.get("line_id"),
      entries: Array.from(formData.entries()),
    });

    const line_id = BigInt(formData.get("line_id") as string);

    if (!line_id) {
      return {
        errors: {
          line_id: ["ID позиції обов'язковий"],
        },
      };
    }

    // Check if line exists
    const existingLine = await db.inventory_counting_lines.findUnique({
      where: { id: line_id },
      include: {
        inventory_counting: {
          include: {
            documents: true,
            inventory_counting_lines: true,
          },
        },
      },
    });

    if (!existingLine) {
      return {
        errors: {
          _form: ["Позицію не знайдено"],
        },
      };
    }

    // Check if the inventory counting is in draft status (no doc_id)
    if (existingLine.inventory_counting.doc_id) {
      return {
        errors: {
          _form: ["Не можна видаляти позиції проведеного документа"],
        },
      };
    }

    // Delete the inventory line
    await db.inventory_counting_lines.delete({
      where: { id: line_id },
    });

    revalidatePath("/inventory-counting/view");
    console.log("Line deleted successfully:", line_id);
    console.log("Returning success response");
    return { message: "Позицію видалено" };
  } catch (error: any) {
    console.error("Error in deleteInventoryLine:", error);
    return {
      errors: {
        _form: [error.message || "Помилка при видаленні позиції"],
      },
    };
  }
}
