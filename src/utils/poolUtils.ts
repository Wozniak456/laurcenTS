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

/**
 * Check if there are any posted operations for a pool after a specific date
 * This prevents operations when there are later posted documents
 */
export async function checkPostedOperationsForPool(
  locationId: number,
  date: string
): Promise<{
  hasPostedOperations: boolean;
  reason?: string;
  locationName?: string;
  postedDocuments?: Array<{
    id: bigint;
    doc_type_id: number;
    date_time: Date;
    date_time_posted: Date | null;
    parent_document?: bigint | null;
  }>;
}> {
  try {
    const checkDate = new Date(date);
    checkDate.setUTCHours(23, 59, 59, 999);

    // Get location name first
    const location = await db.locations.findUnique({
      where: { id: locationId },
      select: { name: true },
    });

    const locationName = location?.name || `Location ${locationId}`;

    // Find any documents for this location that were posted after the given date
    // EXCLUDE:
    // 1. Feeding calculation documents (doc_type_id = 7) - these are recalculations, not new operations
    // 2. Child documents (parent_document is not null) - these are derived from parent operations
    // 3. Stocking documents (doc_type_id = 1) that only have transactions with the same location_id
    //    - these are just reorganizing existing fish, not adding new fish
    const postedDocuments = await db.documents.findMany({
      where: {
        location_id: locationId,
        date_time: {
          gt: checkDate, // After the given date
        },
        date_time_posted: {
          not: undefined, // Document has been posted
        },
        // Exclude feeding calculation documents (recalculations)
        doc_type_id: {
          not: 7,
        },
        // Exclude child documents (derived operations)
        parent_document: null,
        // Exclude stocking documents that only reorganize existing fish
        OR: [
          { doc_type_id: { not: 1 } }, // Not a stocking document
          {
            doc_type_id: 1, // Is a stocking document
            AND: {
              // But has transactions with different location_id (meaning new fish added)
              itemtransactions: {
                some: {
                  location_id: { not: locationId },
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        doc_type_id: true,
        date_time: true,
        date_time_posted: true,
        parent_document: true,
      },
      orderBy: {
        date_time: "desc",
      },
    });

    if (postedDocuments.length > 0) {
      return {
        hasPostedOperations: true,
        reason: `Found ${postedDocuments.length} posted document(s) after ${date} (excluding recalculations, child documents, and same-location stockings)`,
        locationName,
        postedDocuments,
      };
    }

    return {
      hasPostedOperations: false,
      locationName,
    };
  } catch (error) {
    console.error("Error checking posted operations for pool:", error);
    return {
      hasPostedOperations: false,
      reason: "Error checking posted operations",
    };
  }
}

/**
 * Check if pool operations are allowed based on posted operations
 * Returns true if operations are allowed, false if blocked
 */
export async function isPoolOperationsAllowed(
  locationId: number,
  date: string
): Promise<{
  allowed: boolean;
  reason?: string;
  locationName?: string;
  postedDocuments?: Array<{
    id: bigint;
    doc_type_id: number;
    date_time: Date;
    date_time_posted: Date | null;
    parent_document?: bigint | null;
  }>;
}> {
  const checkResult = await checkPostedOperationsForPool(locationId, date);

  return {
    allowed: !checkResult.hasPostedOperations,
    reason: checkResult.hasPostedOperations
      ? `${checkResult.locationName}: ${checkResult.reason}`
      : "Operations allowed",
    locationName: checkResult.locationName,
    postedDocuments: checkResult.postedDocuments,
  };
}

/**
 * Check multiple locations for posted operations
 * Used for batch division and other multi-location operations
 */
export async function checkMultipleLocationsForPostedOperations(
  locationIds: number[],
  date: string
): Promise<{
  allAllowed: boolean;
  blockedLocations: Array<{
    locationId: number;
    locationName: string;
    reason: string;
    postedDocuments?: Array<{
      id: bigint;
      doc_type_id: number;
      date_time: Date;
      date_time_posted: Date | null;
      parent_document?: bigint | null;
    }>;
  }>;
}> {
  const results = await Promise.all(
    locationIds.map(async (locationId) => {
      const checkResult = await checkPostedOperationsForPool(locationId, date);
      return {
        locationId,
        locationName: checkResult.locationName || `Location ${locationId}`,
        allowed: !checkResult.hasPostedOperations,
        reason: checkResult.reason,
        postedDocuments: checkResult.postedDocuments,
      };
    })
  );

  const blockedLocations = results
    .filter((result) => !result.allowed)
    .map((result) => ({
      locationId: result.locationId,
      locationName: result.locationName,
      reason: result.reason || "Unknown error",
      postedDocuments: result.postedDocuments,
    }));

  return {
    allAllowed: blockedLocations.length === 0,
    blockedLocations,
  };
}

/**
 * Client-side validation function for pool operations
 * This function can be called from the frontend to check if operations are allowed
 * before opening any modals or forms
 */
export async function validatePoolOperation(
  locationId: number,
  date: string,
  operationType: "stocking" | "split" | "disposal" | "cancel" | "update"
): Promise<{
  allowed: boolean;
  message: string;
  operationType: string;
  locationName?: string;
}> {
  try {
    const validationResult = await isPoolOperationsAllowed(locationId, date);

    if (!validationResult.allowed) {
      const operationNames = {
        stocking: "зариблення",
        split: "розділення",
        disposal: "списання",
        cancel: "відміну зариблення",
        update: "оновлення стану басейна",
      };

      return {
        allowed: false,
        message: `Операція ${operationNames[operationType]} заблокована: ${validationResult.reason}`,
        operationType,
        locationName: validationResult.locationName,
      };
    }

    return {
      allowed: true,
      message: `Операція ${operationType} дозволена`,
      operationType,
      locationName: validationResult.locationName,
    };
  } catch (error) {
    return {
      allowed: false,
      message: `Помилка перевірки: ${
        error instanceof Error ? error.message : "Невідома помилка"
      }`,
      operationType,
    };
  }
}
