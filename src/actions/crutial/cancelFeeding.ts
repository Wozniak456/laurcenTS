"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

export async function checkLaterTransactions(
  locationId: number,
  date: string,
  feedId?: number
) {
  try {
    const checkDate = new Date(date);
    checkDate.setUTCHours(23, 59, 59, 999);

    const laterTransactions = await db.documents.findFirst({
      where: {
        location_id: locationId,
        date_time: {
          gt: checkDate,
        },
        doc_type_id: 9, // Feeding document type
        ...(feedId && {
          itemtransactions: {
            some: {
              itembatches: {
                item_id: feedId,
              },
            },
          },
        }),
      },
      include: {
        itemtransactions: {
          include: {
            itembatches: true,
          },
        },
      },
    });

    return !laterTransactions;
  } catch (error) {
    console.error("Error checking later transactions:", error);
    throw error;
  }
}

export async function cancelFeeding(
  locationId: number,
  date: string,
  feedId?: number
) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Use transaction to ensure all or nothing
    await db.$transaction(async (prisma) => {
      // Find all feeding documents for this location and date
      const documents = await prisma.documents.findMany({
        where: {
          location_id: locationId,
          date_time: {
            gte: startOfDay,
            lte: endOfDay,
          },
          doc_type_id: 9, // Feeding document type
          ...(feedId && {
            itemtransactions: {
              some: {
                itembatches: {
                  item_id: feedId,
                },
              },
            },
          }),
        },
        include: {
          itemtransactions: {
            include: {
              itembatches: true,
            },
          },
        },
      });

      if (documents.length === 0) {
        throw new Error("No feeding documents found for this date");
      }

      // First, delete all generation_feed_amount records for these documents
      const docIds = documents.map((doc) => doc.id);
      await prisma.generation_feed_amount.deleteMany({
        where: {
          doc_id: {
            in: docIds,
          },
        },
      });

      for (const doc of documents) {
        // Delete only specific item transactions if feedId is provided
        if (feedId) {
          // First find all transaction IDs that match our feed item
          const transactionIds = doc.itemtransactions
            .filter((trans) => trans.itembatches?.item_id === feedId)
            .map((trans) => trans.id);

          // Delete those specific transactions
          await prisma.itemtransactions.deleteMany({
            where: {
              id: {
                in: transactionIds,
              },
            },
          });

          // Check if document has any other transactions left
          const remainingTransactions = await prisma.itemtransactions.count({
            where: {
              doc_id: doc.id,
            },
          });

          // Only delete the document if no transactions remain
          if (remainingTransactions === 0) {
            await prisma.documents.delete({
              where: {
                id: doc.id,
              },
            });
          }
        } else {
          // Original behavior - delete all transactions and document
          await prisma.itemtransactions.deleteMany({
            where: {
              doc_id: doc.id,
            },
          });

          await prisma.documents.delete({
            where: {
              id: doc.id,
            },
          });
        }
      }
    });

    // Revalidate necessary paths
    revalidatePath(`/accumulation/view`);
    revalidatePath("/leftovers/view");
    revalidatePath(`/summary-feeding-table/day/${date}`);

    return { success: true };
  } catch (error) {
    console.error("Error canceling feeding:", error);
    throw error;
  }
}
