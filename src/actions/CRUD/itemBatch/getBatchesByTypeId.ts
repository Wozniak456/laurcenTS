'use server'
import { db } from "@/db";
import { itembatches } from "@prisma/client";

export async function getBatches(item_type_id: number)
: Promise<itembatches[]> {
  try {
    console.log('getBatches started');
    
    const batches = await db.itembatches.findMany({
      where: {
        items: {
          item_type_id: item_type_id,
        },
      },
    });

    return batches;
  } catch (err: unknown) {
    console.error('Error in getBatches:', err);
    return []
  }
}
