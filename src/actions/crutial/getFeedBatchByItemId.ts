"use server";
import { db } from "@/db";
import { Prisma } from "@prisma/client";

type batchType = {
  id: bigint;
  price: number | null | undefined;
  items: {
    id: number;
    name: string;
    description: string | null;
    item_type_id: number | null;
    feed_type_id: number | null;
    default_unit_id: number | null;
    parent_item: number | null;
    vendor_id: number | null;
  };
};

type BatchQuantity = Prisma.PickEnumerable<
  Prisma.ItemtransactionsGroupByOutputType,
  "batch_id"[] // You want only the `batch_id` field as a grouping key
> & {
  _sum: {
    quantity: number | null; // You want to sum the `quantity` field
  };
};

export async function getFeedBatchByItemId(
  item_id: number,
  quantity: number,
  prisma?: any
) {
  console.warn("DEBUG - getFeedBatchByItemId called:", { item_id, quantity });

  const activeDb = prisma || db;

  const batches: batchType[] = await activeDb.itembatches.findMany({
    include: {
      items: true,
    },
    where: {
      item_id: item_id,
    },
  });

  console.warn("DEBUG - Found batches:", batches);

  const batches_quantity_ = await activeDb.itemtransactions.groupBy({
    by: ["batch_id"],
    where: {
      batch_id: {
        in: batches.map((batch) => batch.id),
      },
      location_id: 87,
    },
    _sum: {
      quantity: true,
    },
  });

  console.warn("DEBUG - Batch quantities:", batches_quantity_);

  const batches_quantity: BatchQuantity[] = batches_quantity_;

  const batches_quantity_with_price = batches_quantity.map((bq) => {
    const batch = batches.find((batch) => batch.id === bq.batch_id);
    return {
      ...bq,
      price: batch ? batch.price : null,
      feed_type_id: batch ? batch.items.feed_type_id : null,
    };
  });

  console.warn("DEBUG - Batches with price:", batches_quantity_with_price);

  // Якщо в партії не вистачає корму на годування, то брати з іншої партії
  const batches_array = [];
  let totalQuantity = 0;
  quantity = quantity / 1000;

  console.warn("DEBUG - Checking quantities:", {
    totalQuantity,
    neededQuantity: quantity,
  });

  while (totalQuantity < quantity && batches_quantity_with_price.length > 0) {
    const minBatch = batches_quantity_with_price.reduce((min, current) =>
      min.batch_id < current.batch_id ? min : current
    );

    batches_array.push(minBatch);

    if (minBatch._sum?.quantity !== null) {
      totalQuantity += minBatch._sum.quantity;
    }

    console.warn("DEBUG - Added batch:", {
      batchId: minBatch.batch_id,
      quantity: minBatch._sum?.quantity,
      newTotal: totalQuantity,
    });

    if (totalQuantity >= quantity) {
      break;
    }

    const minIndex = batches_quantity_with_price.indexOf(minBatch);
    batches_quantity_with_price.splice(minIndex, 1);
  }

  if (totalQuantity < quantity) {
    console.warn("DEBUG - Not enough feed:", {
      available: totalQuantity,
      needed: quantity,
    });
    throw new Error("Немає достатньо корму");
  }

  return batches_array;
}
