"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

export type AddInventoryLineFormState = {
  errors?: {
    inventory_counting_id?: string[];
    feed_type_id?: string[];
    item_id?: string[];
    batch_id?: string[];
    actual_quantity?: string[];
    _form?: string[];
  };
  message?: string;
};

export async function addInventoryLine(
  formState: AddInventoryLineFormState,
  formData: FormData
): Promise<AddInventoryLineFormState> {
  try {
    const inventory_counting_id = BigInt(
      formData.get("inventory_counting_id") as string
    );
    const feed_type_id = parseInt(formData.get("feed_type_id") as string);
    const item_id = parseInt(formData.get("item_id") as string);
    const batch_id = parseInt(formData.get("batch_id") as string);
    const actual_quantity = parseFloat(
      formData.get("actual_quantity") as string
    );
    const unit_id = parseInt(formData.get("unit_id") as string) || 2; // Default to kg

    if (!inventory_counting_id) {
      return {
        errors: {
          inventory_counting_id: ["ID інвентаризації обов'язковий"],
        },
      };
    }

    if (!feed_type_id) {
      return {
        errors: {
          feed_type_id: ["Тип корму обов'язковий"],
        },
      };
    }

    if (!item_id) {
      return {
        errors: {
          item_id: ["Товар обов'язковий"],
        },
      };
    }

    if (!batch_id) {
      return {
        errors: {
          batch_id: ["Партія обов'язкова"],
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

    // Calculate system quantity from current stock for the specific batch
    const systemStock = await db.itemtransactions.groupBy({
      by: ["batch_id"],
      where: {
        batch_id: batch_id,
        location_id: 87, // Warehouse location
      },
      _sum: {
        quantity: true,
      },
    });

    const system_quantity = systemStock.reduce(
      (sum, stock) => sum + (stock._sum.quantity || 0),
      0
    );

    // Check if line already exists for this item and batch
    const existingLine = await db.inventory_counting_lines.findFirst({
      where: {
        inventory_counting_id: inventory_counting_id,
        item_id: item_id,
        batch_id: batch_id,
      },
    });

    if (existingLine) {
      return {
        errors: {
          _form: ["Цей товар вже додано до інвентаризації"],
        },
      };
    }

    // Create the inventory line
    await db.inventory_counting_lines.create({
      data: {
        inventory_counting_id: inventory_counting_id,
        feed_type_id: feed_type_id,
        item_id: item_id,
        batch_id: batch_id,
        system_quantity: system_quantity,
        actual_quantity: actual_quantity,
        unit_id: unit_id,
      },
    });

    revalidatePath("/inventory-counting/view");
    return { message: "Товар додано до інвентаризації" };
  } catch (error: any) {
    return {
      errors: {
        _form: [error.message || "Помилка при додаванні товару"],
      },
    };
  }
}
