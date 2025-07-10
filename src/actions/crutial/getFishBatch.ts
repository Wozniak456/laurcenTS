"use server";
import { db } from "@/db";
import { BatchWithCreationInfo } from "@/types/app_types";

export async function getFishBatch(
  batch_id: number
): Promise<BatchWithCreationInfo | null> {
  try {
    const batch = await db.itembatches.findFirst({
      select: {
        id: true,
        name: true,
        created: true,
        items: {
          select: {
            id: true,
            name: true,
          },
        },
        itemtransactions: {
          select: {
            quantity: true,
            location_id: true,
            documents: {
              select: {
                doc_type_id: true,
              },
            },
          },
        },
      },
      where: {
        id: batch_id,
      },
    });

    if (!batch) {
      return null;
    }

    // Calculate total quantity on stock (sum of all positive transactions with location_id=87 and doc_type_id=8)
    let totalQuantity = 0;
    if (batch.itemtransactions) {
      totalQuantity = batch.itemtransactions
        .filter(
          (t) =>
            t.quantity > 0 &&
            t.location_id === 87 &&
            t.documents.doc_type_id === 8
        )
        .reduce((sum, t) => sum + t.quantity, 0);
    }

    return {
      ...batch,
      totalQuantity,
      id: batch.id, // Ensure id is explicitly included and typed as bigint
    };
  } catch (err) {
    //console.log(`error: ${err}`)
    return null;
  }
}
