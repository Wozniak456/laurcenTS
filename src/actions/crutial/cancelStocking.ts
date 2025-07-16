"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

/**
 * Check if stocking can be cancelled for a location
 * Returns true if:
 * 1. Stocking came directly from warehouse (location_id_from = 87)
 * 2. No transactions exist after the stocking date (not just feeding)
 */
export async function canCancelStocking(
  locationId: number,
  today: string
): Promise<{
  canCancel: boolean;
  reason?: string;
  stockingDocId?: bigint;
}> {
  try {
    // Parse the date string and create date range for the entire day
    const todayDate = new Date(today);
    const startOfDay = new Date(todayDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(todayDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // 1. Find the latest stocking document for this location
    const latestStocking = await db.documents.findFirst({
      where: {
        location_id: locationId,
        doc_type_id: 1, // Stocking document type
        date_time: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        itemtransactions: {
          where: {
            quantity: { gt: 0 }, // Positive stocking transaction
          },
          include: {
            itembatches: {
              include: {
                items: true,
              },
            },
          },
        },
      },
      orderBy: {
        date_time: "desc",
      },
    });

    if (!latestStocking) {
      return {
        canCancel: false,
        reason: "No stocking found for this location",
      };
    }

    // 2. Check if stocking came from warehouse (location_id_from = 87)
    const negativeTransaction = await db.itemtransactions.findFirst({
      where: {
        doc_id: latestStocking.id,
        quantity: { lt: 0 }, // Negative transaction (from warehouse)
      },
    });

    if (!negativeTransaction) {
      return {
        canCancel: false,
        reason: "Stocking did not come from warehouse",
      };
    }

    // Check if the negative transaction is from warehouse (location_id = 87)
    if (negativeTransaction.location_id !== 87) {
      return {
        canCancel: false,
        reason: "Stocking did not come directly from warehouse",
      };
    }

    // 3. Check if there are any transactions after the stocking date
    const transactionsAfterStocking = await db.documents.findFirst({
      where: {
        location_id: locationId,
        date_time: {
          gt: latestStocking.date_time, // After the stocking date
        },
        // Exclude documents that are children of the stocking document
        parent_document: {
          not: latestStocking.id,
        },
      },
    });

    if (transactionsAfterStocking) {
      return {
        canCancel: false,
        reason: "Transactions exist after the stocking date",
      };
    }

    return {
      canCancel: true,
      stockingDocId: latestStocking.id,
    };
  } catch (error) {
    console.error("Error checking if stocking can be cancelled:", error);
    return {
      canCancel: false,
      reason: "Error checking cancellation conditions",
    };
  }
}

/**
 * Cancel stocking for a location
 * Removes all transactions related to the stocking document
 */
export async function cancelStocking(
  locationId: number,
  today: string
): Promise<{ success: boolean; message: string }> {
  try {
    const checkResult = await canCancelStocking(locationId, today);

    if (!checkResult.canCancel) {
      return {
        success: false,
        message: checkResult.reason || "Cannot cancel stocking",
      };
    }

    const stockingDocId = checkResult.stockingDocId;
    if (!stockingDocId) {
      return { success: false, message: "Stocking document not found" };
    }

    // Use transaction to ensure all operations succeed or fail together
    await db.$transaction(async (prisma) => {
      // Get all transactions for this document first
      const transactions = await prisma.itemtransactions.findMany({
        where: { doc_id: stockingDocId },
        select: { id: true },
      });

      const transactionIds = transactions.map((t) => t.id);

      // 1. Delete batch_generation records
      await prisma.batch_generation.deleteMany({
        where: {
          transaction_id: { in: transactionIds },
        },
      });

      // 2. Delete calculation_table records that reference the stocking document and child documents
      const childDocIds = await prisma.documents.findMany({
        where: {
          parent_document: stockingDocId,
        },
        select: { id: true },
      });

      const allDocIds = [stockingDocId, ...childDocIds.map((d) => d.id)];

      await prisma.calculation_table.deleteMany({
        where: {
          doc_id: {
            in: allDocIds,
          },
        },
      });

      // 3. Delete child documents (documents that have this stocking as parent)
      await prisma.documents.deleteMany({
        where: {
          parent_document: stockingDocId,
        },
      });

      // 4. Delete stocking record
      await prisma.stocking.deleteMany({
        where: {
          doc_id: stockingDocId,
        },
      });

      // 5. Delete all itemtransactions for this document
      await prisma.itemtransactions.deleteMany({
        where: {
          doc_id: stockingDocId,
        },
      });

      // 6. Delete the stocking document
      await prisma.documents.delete({
        where: {
          id: stockingDocId,
        },
      });
    });

    revalidatePath(`/pool-managing/day/${today}`);

    return {
      success: true,
      message: "Stocking cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling stocking:", error);
    return {
      success: false,
      message: "Error cancelling stocking. Please try again.",
    };
  }
}
