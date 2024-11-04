'use server'
import { db } from "@/db";
import { items } from "@prisma/client";

export async function getItemById(item_id: number)
: Promise<items | null> {
  try {
    console.log('getItemById started');
    
    const item = await db.items.findFirst({
      where: {
        id: item_id
      },
    });
    console.log('item', item)

    return item;
  } catch (err: unknown) {
    console.error('Error in getBatches:', err);
    return null;
  }
}
