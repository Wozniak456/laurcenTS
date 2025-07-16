"use server";

import { db } from "@/db";

/**
 * Count pools that have active fish (quantity > 0)
 * A pool is considered active if it has stocking and fish items summary > 0
 */
export async function getActivePoolsCount(date?: string): Promise<number> {
  const targetDate = date || new Date().toISOString().split("T")[0];
  const dateValue = new Date(targetDate);
  dateValue.setUTCHours(23, 59, 59, 999);

  try {
    // Get pool location type from environment
    const poolType = process.env.locationTypePool;
    if (!poolType) {
      throw new Error("process.env.locationTypePool not set");
    }

    // Use a single query to count active pools efficiently
    const activePoolsResult = await db.itemtransactions.groupBy({
      by: ["location_id"],
      where: {
        locations: {
          location_type_id: parseInt(poolType),
        },
        documents: {
          date_time: {
            lte: dateValue,
          },
        },
        itembatches: {
          items: {
            item_type_id: 1, // Fish items
          },
        },
      },
      _sum: {
        quantity: true,
      },
    });

    // Count locations that have positive fish quantity
    const activePoolsCount = activePoolsResult.filter(
      (result) => (result._sum.quantity || 0) > 0
    ).length;

    return activePoolsCount;
  } catch (error) {
    console.error("Error counting active pools:", error);
    return 0;
  }
}

/**
 * Get both total pools count and active pools count for comparison
 */
export async function getPoolsComparison(date?: string): Promise<{
  totalPools: number;
  activePools: number;
}> {
  const targetDate = date || new Date().toISOString().split("T")[0];
  const dateValue = new Date(targetDate);
  dateValue.setUTCHours(23, 59, 59, 999);

  try {
    const poolType = process.env.locationTypePool;
    if (!poolType) {
      throw new Error("process.env.locationTypePool not set");
    }

    // Get total pools count
    const totalPools = await db.locations.count({
      where: {
        location_type_id: parseInt(poolType),
      },
    });

    // Get active pools count
    const activePools = await getActivePoolsCount(date);

    return {
      totalPools,
      activePools,
    };
  } catch (error) {
    console.error("Error getting pools comparison:", error);
    return {
      totalPools: 0,
      activePools: 0,
    };
  }
}
