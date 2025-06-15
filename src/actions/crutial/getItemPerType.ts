"use server";
import { db } from "@/db";

export async function getItemPerType(
  feed_type_id: number,
  location_id: number
) {
  const items = await db.items.findMany({
    where: {
      feed_type_id: feed_type_id,
    },
    orderBy: {
      name: "asc",
    },
  });

  //якщо немає колізій, то повертаємо єдиний корм для виду
  if (items.length == 1) {
    return {
      item_id: items[0].id,
      item_name: items[0].name,
      definedPrio: true,
    };
  }

  //якщо колізія є, повертаємо перший елемент (periodic logic is now handled elsewhere)
  if (items.length > 1) {
    return {
      item_id: items[0].id,
      item_name: items[0].name,
      definedPrio: false,
    };
  }
}
