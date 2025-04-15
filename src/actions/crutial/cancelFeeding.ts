"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

export async function checkLaterTransactions(locationId: number, date: string) {
  try {
    const checkDate = new Date(date);
    checkDate.setUTCHours(23, 59, 59, 999);

    const laterTransactions = await db.documents.findFirst({
      where: {
        location_id: locationId,
        date_time: {
          gt: checkDate,
        },
      },
    });

    return !laterTransactions;
  } catch (error) {
    console.error("Error checking later transactions:", error);
    throw error;
  }
}

export async function cancelFeeding(locationId: number, date: string) {
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
        },
        include: {
          itemtransactions: true, // Include related transactions
        },
      });

      if (documents.length === 0) {
        throw new Error("No feeding documents found for this date");
      }

      for (const doc of documents) {
        // Delete item transactions first
        await prisma.itemtransactions.deleteMany({
          where: {
            doc_id: doc.id,
          },
        });

        // Delete generation feed amounts related to this location
        await prisma.generation_feed_amount.deleteMany({
          where: {
            batch_generation: {
              location_id: locationId,
            },
          },
        });

        // Finally delete the document
        await prisma.documents.delete({
          where: {
            id: doc.id,
          },
        });
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
