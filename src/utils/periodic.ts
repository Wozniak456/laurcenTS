import { db } from "@/db";
import { Prisma } from "@prisma/client";

// Fetch the active priority for a given location, item, and date
export async function getPriorityForDate(
  location_id: number,
  item_id: number,
  date: Date
) {
  return await db.priority_history.findFirst({
    where: {
      location_id: location_id,
      item_id: item_id,
      valid_from: { lte: date },
      OR: [{ valid_to: null }, { valid_to: { gte: date } }],
    },
    orderBy: { valid_from: "desc" },
  });
}

// Fetch the active percent_feeding for a given location and date
export async function getPercentFeedingForDate(
  location_id: number,
  date: Date
) {
  // Find the pool_id for the location
  const location = await db.locations.findUnique({
    where: { id: location_id },
    select: { pool_id: true },
  });
  if (!location?.pool_id) return null;
  const result = await db.percent_feeding_history.findFirst({
    where: {
      pool_id: location.pool_id,
      valid_from: { lte: date },
      OR: [{ valid_to: null }, { valid_to: { gte: date } }],
    },
    orderBy: { valid_from: "desc" },
  });

  if (!result) return null;

  // Convert Decimal to number before returning
  return {
    ...result,
    percent_feeding: Number(result.percent_feeding),
  };
}
