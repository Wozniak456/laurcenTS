'use server'
import { getFishBatches } from "@/sql/getFishBatchesQuery";

export async function getCatfishBatches(
) {
  try {
    const catfishType = process.env.itemTypeCatfish

    if (!catfishType) {
      console.log('process.env.itemTypeCatfish not set')
      throw new Error('process.env.itemTypeCatfish not set')
    }

    const batches = await getFishBatches(Number(catfishType));

    return batches

  } catch (err) {
    console.log(`error: ${err}`)
    return [];
  }
}