"use server";
import { db } from "@/db";
import { Prisma } from "@prisma/client";

type BatchWithTransactions = Prisma.itembatchesGetPayload<{
  select: {
    id: true;
    name: true;
    items: {
      select: {
        id: true;
        name: true;
      };
    };
    itemtransactions: {
      select: {
        quantity: true;
        location_id: true;
        documents: {
          select: {
            date_time: true;
            doc_type_id: true;
          };
        };
      };
      orderBy: {
        documents: {
          date_time: "asc";
        };
      };
    };
  };
}>;

export async function getCatfishBatches() {
  try {
    const catfishType = process.env.itemTypeCatfish;

    if (!catfishType) {
      //console.log("process.env.itemTypeCatfish not set");
      throw new Error("process.env.itemTypeCatfish not set");
    }

    const batches = (await db.itembatches.findMany({
      select: {
        id: true,
        name: true,
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
                date_time: true,
                doc_type_id: true,
              },
            },
          },
          orderBy: {
            documents: {
              date_time: "asc",
            },
          },
        },
      },
      where: {
        items: {
          item_type_id: parseInt(catfishType),
        },
      },
    })) as BatchWithTransactions[];

    // Process the batches to calculate quantities
    const processedBatches = batches.map((batch) => {
      const transactions = batch.itemtransactions;

      // Calculate total initial quantity (sum of ALL positive transactions for location 87 with doc_type_id=8)
      const initialQuantity = transactions
        .filter(
          (t) =>
            t.quantity > 0 &&
            t.location_id === 87 &&
            t.documents.doc_type_id === 8
        )
        .reduce((sum, t) => sum + t.quantity, 0);

      // Calculate quantity sent to other locations (sum of negative quantities for location 87)
      const sentQuantity = transactions
        .filter((t) => t.quantity < 0 && t.location_id === 87)
        .reduce((sum, t) => sum + Math.abs(t.quantity), 0);

      // Calculate returned quantity (sum of positive quantities from doc_type_id=12)
      const returnedQuantity = transactions
        .filter((t) => t.quantity > 0 && t.documents.doc_type_id === 12)
        .reduce((sum, t) => sum + t.quantity, 0);

      // Calculate remaining quantity
      const remainingQuantity =
        initialQuantity + returnedQuantity - sentQuantity;

      return {
        ...batch,
        initialQuantity,
        sentQuantity,
        returnedQuantity,
        remainingQuantity,
      };
    });

    return processedBatches;
  } catch (err) {
    //console.log(`error: ${err}`);
    return [];
  }
}
