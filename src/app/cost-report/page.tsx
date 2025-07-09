import React from "react";
import CostReportClient from "./CostReportClient";
import { db } from "@/db";

export const dynamic = "force-dynamic";

export default async function CostReportPage() {
  // Fetch only fish batches (item_type_id: 1)
  const batchesRaw = await db.itembatches.findMany({
    select: {
      id: true,
      name: true,
      items: {
        select: {
          item_type_id: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
  // Filter to only those where items.item_type_id === 1
  const batches = batchesRaw
    .filter((batch) => batch.items?.item_type_id === 1)
    .map((batch) => ({
      id: Number(batch.id),
      name: batch.name,
    }));

  return <CostReportClient batches={batches} />;
}
