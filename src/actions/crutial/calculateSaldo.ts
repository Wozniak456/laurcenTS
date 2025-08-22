"use server";
import { db } from "@/db";

interface FilterSpecifier {
  gt?: number;
  lt?: number;
  gte?: number;
  lte?: number;
}
interface Saldos {
  [batchId: string]: {
    qty: number;
    // itemId: number,
    feed_type_name: string;
    itemName: string;
    batchName: string;
    inventory_counting_qty?: number; // New field for inventory counting
  };
}

export const calculateSaldo = async (
  startDate: Date | undefined,
  endDate: Date | undefined,
  quantityFilter: FilterSpecifier | undefined
): Promise<Saldos> => {
  // console.log('endDate', endDate)
  const result = await db.itemtransactions.groupBy({
    by: ["batch_id"],
    where: {
      locations: {
        location_type_id: 1,
      },
      documents: {
        date_time: {
          gte: startDate,
          lte: endDate,
        },
      },
      quantity: quantityFilter,
      NOT: {
        itembatches: {
          items: {
            feed_type_id: null,
          },
        },
      },
    },
    _sum: {
      quantity: true,
    },
  });

  const newView = await db.itembatches.findMany({
    include: {
      items: {
        include: {
          feedtypes: true,
        },
      },
    },
    where: {
      id: {
        in: result.map((result) => result.batch_id),
      },
    },
  });

  // Get inventory counting data for document type 15
  const inventoryCountingData = await db.itemtransactions.groupBy({
    by: ["batch_id"],
    where: {
      documents: {
        doc_type_id: 15, // Inventory counting document type
        date_time: {
          gte: startDate,
          lte: endDate,
        },
      },
      locations: {
        location_type_id: 1, // Warehouse location
      },
    },
    _sum: {
      quantity: true,
    },
  });

  const mergedResults = newView.map((item: any) => {
    const sumItem = result.find((r: any) => r.batch_id === item.id);
    const inventoryItem = inventoryCountingData.find(
      (r: any) => r.batch_id === item.id
    );
    return {
      ...item,
      _sum: sumItem ? sumItem._sum.quantity : 0,
      inventory_counting_qty: inventoryItem ? inventoryItem._sum.quantity : 0,
    };
  });

  const saldoData: Saldos = {};

  mergedResults.forEach((batch: any) => {
    saldoData[batch.id.toString()] = {
      qty: batch._sum,
      feed_type_name: batch.items.feedtypes.name,
      itemName: batch.items.name,
      batchName: batch.name,
      inventory_counting_qty: batch.inventory_counting_qty,
    };
  });

  return saldoData;
};
