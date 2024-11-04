'use server'
import { db } from "@/db";
import { items } from "@prisma/client";

export async function getItems(item_type_id: number)
: Promise<items[]> {
  try {
    console.log('getItems started');
    
    const items = await db.items.findMany({
      where: {
        item_type_id: item_type_id
      },
    });

    return items;
  } catch (err: unknown) {
    console.error('Error in getBatches:', err);
    return [];
  }
}
