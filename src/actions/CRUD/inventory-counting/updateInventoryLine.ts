"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

export type UpdateInventoryLineFormState = {
  errors?: {
    line_id?: string[];
    actual_quantity?: string[];
    _form?: string[];
  };
  message?: string;
};

export async function updateInventoryLine(
  formState: UpdateInventoryLineFormState,
  formData: FormData
): Promise<UpdateInventoryLineFormState> {
  try {
    const line_id = BigInt(formData.get("line_id") as string);
    const actual_quantity = parseFloat(
      formData.get("actual_quantity") as string
    );

    if (!line_id) {
      return {
        errors: {
          line_id: ["ID позиції обов'язковий"],
        },
      };
    }

    if (isNaN(actual_quantity) || actual_quantity < 0) {
      return {
        errors: {
          actual_quantity: ["Кількість має бути числом більше або рівне 0"],
        },
      };
    }

    // Get the current line to calculate the difference
    const currentLine = await db.inventory_counting_lines.findUnique({
      where: { id: line_id },
      include: {
        itembatches: true,
        inventory_counting: {
          include: {
            documents: true,
          },
        },
      },
    });

    if (!currentLine) {
      return {
        errors: {
          _form: ["Позицію не знайдено"],
        },
      };
    }

    // Check if the inventory counting is in draft status (no doc_id)
    if (currentLine.inventory_counting.doc_id) {
      return {
        errors: {
          _form: ["Не можна редагувати позиції проведеного документа"],
        },
      };
    }

    // Update only the actual_quantity - let the database handle difference calculation
    await db.inventory_counting_lines.update({
      where: { id: line_id },
      data: {
        actual_quantity: actual_quantity,
      },
    });

    revalidatePath("/inventory-counting/view");
    return { message: "Кількість оновлено" };
  } catch (error: any) {
    return {
      errors: {
        _form: [error.message || "Помилка при оновленні кількості"],
      },
    };
  }
}
