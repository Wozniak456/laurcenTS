"use server";
import { getPercentFeedingForDate } from "@/utils/periodic";
import { db } from "@/db";
import { Prisma } from "@prisma/client";

export async function fetchPercentFeeding(locationId: number, date: string) {
  const result = await getPercentFeedingForDate(locationId, new Date(date));
  return result?.percent_feeding ? Number(result.percent_feeding) : 0;
}

export async function fetchPercentFeedingsForLocations(
  locationIds: number[],
  date: string
) {
  // Get all pool_ids for the given locations
  const locations = await db.locations.findMany({
    where: { id: { in: locationIds } },
    select: { id: true, pool_id: true },
  });
  const poolIdToLocId: Record<number, number> = {};
  locations.forEach((loc) => {
    if (loc.pool_id) poolIdToLocId[loc.pool_id] = loc.id;
  });
  const poolIds = locations.map((loc) => loc.pool_id).filter(Boolean);
  if (poolIds.length === 0) return {};

  // Fetch all percent_feeding_history for these pools and date
  const histories = await db.$queryRaw<
    Array<{ pool_id: number; percent_feeding: Prisma.Decimal }>
  >`
    SELECT pool_id, percent_feeding
    FROM percent_feeding_history
    WHERE pool_id IN (${Prisma.join(poolIds)})
    AND valid_from <= ${new Date(date)}
    AND (valid_to IS NULL OR valid_to >= ${new Date(date)})
    ORDER BY valid_from DESC
  `;

  // Map pool_id to percent_feeding, ensuring all values are converted to numbers
  const result: Record<number, number> = {};
  for (const hist of histories) {
    const locId = poolIdToLocId[hist.pool_id];
    if (locId && result[locId] === undefined) {
      // Convert Decimal to number
      result[locId] = Number(hist.percent_feeding);
    }
  }
  // Fill missing locations with 0
  locationIds.forEach((id) => {
    if (result[id] === undefined) result[id] = 0;
  });
  return result;
}
