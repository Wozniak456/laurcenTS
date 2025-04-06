import { db } from "@/db";
import { FishBatch } from "@/types/app_types"

const getFishBatchesQuery = `
  SELECT
    ib.id AS batch_id,
    ib.name AS batch_name,
    i.id AS item_id,
    i.name AS item_name
  FROM itembatches ib
  JOIN items i ON i.id = ib.item_id
  WHERE i.item_type_id = $1
`;

export async function getFishBatches(catfishType: number): Promise<FishBatch[]> {
  return db.$queryRawUnsafe<FishBatch[]>(
    getFishBatchesQuery.replace("$1", catfishType.toString())
  );
}

