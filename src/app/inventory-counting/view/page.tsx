import { db } from "@/db";
import InventoryCountingClient from "./InventoryCountingClient";

export default async function InventoryCountingViewPage() {
  // Fetch all inventory counting documents
  const inventoryCountings = await db.inventory_counting.findMany({
    include: {
      documents: {
        include: {
          employees: {
            include: {
              individual: true,
            },
          },
        },
      },
      inventory_counting_lines: {
        include: {
          feedtypes: true,
          items: true,
          units: true,
          itembatches: {
            include: {
              itemtransactions: {
                include: {
                  documents: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      posting_date_time: "desc",
    },
  });

  // Fetch feed types for the form
  const feedTypes = await db.feedtypes.findMany({
    orderBy: {
      name: "asc",
    },
  });

  // Fetch items grouped by feed type
  const items = await db.items.findMany({
    where: {
      feed_type_id: {
        not: null,
      },
    },
    include: {
      feedtypes: true,
      units: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Fetch batches with their transactions and documents
  const batches = await db.itembatches.findMany({
    include: {
      itemtransactions: {
        include: {
          documents: true,
        },
      },
    },
    orderBy: {
      created: "desc",
    },
  });

  return (
    <InventoryCountingClient
      inventoryCountings={inventoryCountings}
      feedTypes={feedTypes}
      items={items}
      batches={batches}
    />
  );
}
