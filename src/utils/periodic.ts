import { db } from "@/db";
import { Prisma } from "@prisma/client";

// Fetch the active priority for a given location, item, and date
export async function getPriorityForDate(
  location_id: number,
  item_id: number,
  date: string | Date
) {
  // Ensure date is a Date object in UTC
  let dateObj: Date;
  if (typeof date === "string") {
    dateObj = new Date(date + "T00:00:00Z");
  } else {
    dateObj = date;
  }
  // Debug log for all locations
  console.log("[DEBUG] getPriorityForDate", {
    location_id,
    item_id,
    date: dateObj,
    iso: dateObj.toISOString(),
  });

  const result = await db.priority_history.findFirst({
    where: {
      location_id: location_id,
      item_id: item_id,
      valid_from: { lte: dateObj },
      OR: [{ valid_to: null }, { valid_to: { gte: dateObj } }],
    },
    orderBy: { valid_from: "desc" },
  });
  if (location_id === 40) {
    console.log("[DEBUG] getPriorityForDate result", result);
  }
  return result;
}

// Fetch the active percent_feeding for a given location and date
export async function getPercentFeedingForDate(
  location_id: number,
  date: string | Date
) {
  // Ensure date is a Date object in UTC
  let dateObj: Date;
  if (typeof date === "string") {
    dateObj = new Date(date + "T00:00:00Z");
  } else {
    dateObj = date;
  }
  // Debug log for all locations
  console.log("[DEBUG] getPercentFeedingForDate", {
    location_id,
    date: dateObj,
    iso: dateObj.toISOString(),
  });

  // Find the pool_id for the location
  const location = await db.locations.findUnique({
    where: { id: location_id },
    select: { pool_id: true },
  });
  if (!location?.pool_id) return null;
  const result = await db.percent_feeding_history.findFirst({
    where: {
      pool_id: location.pool_id,
      valid_from: { lte: dateObj },
      OR: [{ valid_to: null }, { valid_to: { gte: dateObj } }],
    },
    orderBy: { valid_from: "desc" },
  });
  if (location_id === 40) {
    console.log("[DEBUG] getPercentFeedingForDate result", result);
  }
  if (!result) return null;

  // Convert Decimal to number before returning
  return {
    ...result,
    percent_feeding: Number(result.percent_feeding),
  };
}

// Fetch the active priority item for a given location and date
export async function getActivePriorityItemForDate(
  location_id: number,
  date: string | Date
) {
  let dateObj: Date;
  if (typeof date === "string") {
    dateObj = new Date(date + "T00:00:00Z");
  } else {
    dateObj = date;
  }
  console.log("[DEBUG] getActivePriorityItemForDate", {
    location_id,
    date: dateObj,
    iso: dateObj.toISOString(),
  });
  const result = await db.priority_history.findFirst({
    where: {
      location_id: location_id,
      valid_from: { lte: dateObj },
      OR: [{ valid_to: null }, { valid_to: { gte: dateObj } }],
    },
    orderBy: { valid_from: "desc" },
    include: { items: true }, // get item info
  });
  console.log("[DEBUG] getActivePriorityItemForDate result", result);
  return result;
}

// Fetch all active priorities for all locations and feed types for a given date
export async function getActivePrioritiesForDate(date: string | Date) {
  let dateObj: Date;
  if (typeof date === "string") {
    dateObj = new Date(date + "T00:00:00Z");
  } else {
    dateObj = date;
  }

  // Get all active priorities for the date, including item info (to get feed_type_id)
  const all = await db.priority_history.findMany({
    where: {
      valid_from: { lte: dateObj },
      OR: [{ valid_to: null }, { valid_to: { gte: dateObj } }],
    },
    orderBy: [
      { location_id: "asc" },
      { item_id: "asc" },
      { valid_from: "desc" },
    ],
    include: {
      items: { select: { id: true, feed_type_id: true, name: true } },
    },
  });

  // Build a nested map: { [location_id]: { [feed_type_id]: priorityRecord } }
  const map: Record<number, Record<number, (typeof all)[0]>> = {};
  for (const prio of all) {
    const locId = prio.location_id;
    const feedTypeId = prio.items.feed_type_id;
    if (feedTypeId == null) continue; // skip if feed_type_id is null or undefined
    if (!map[locId]) map[locId] = {};
    // Only set if not already set (so we keep the latest valid_from per pair)
    if (!map[locId][feedTypeId]) {
      map[locId][feedTypeId] = prio;
    }
  }
  return map;
}
