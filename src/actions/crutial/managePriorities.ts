"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

export async function managePriorities(
  formState: { message: string } | undefined,
  formData: FormData
) {
  try {
    console.log("ми в managePriorities");
    console.log(formData);

    const location_id: number = parseInt(formData.get("location") as string);
    const item_id: number = parseInt(formData.get("feed") as string);
    const feed_type_id: number = await getItemFeedTypeId(item_id);

    //        await db.priorities.deleteMany({
    //            where: {
    //                location_id: location_id
    //            }
    //        });
    await deletePriorityForLocationAndFeedType(location_id, feed_type_id);

    await db.priorities.create({
      data: {
        item_id: item_id,
        location_id: location_id,
        priority: 1,
      },
    });

    console.log(
      `пріоритетність для локації ${location_id} та типу корму ${feed_type_id} оновлена`
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes("Foreign key constraint failed")) {
        return {
          message: "There is no any item or purchaseTitle with such id.",
        };
      } else {
        return {
          message: err.message,
        };
      }
    } else {
      return { message: "Something went wrong!" };
    }
  }
  revalidatePath(`/summary-feeding/day/${formData.get("date")}`);
  // revalidatePath(`/summary-feeding/day/${formData.get('date')}`)
}

async function getItemFeedTypeId(itemId: number): Promise<number> {
  try {
    const item = await db.items.findUnique({
      where: {
        id: itemId,
      },
      select: {
        feed_type_id: true,
      },
    });

    return item?.feed_type_id || -1;
  } catch (error) {
    console.error("Error fetching item feed type ID:", error);
    return -1;
  }
  //   finally {
  //    await db.$disconnect();
  //  }
}

async function deletePriorityForLocationAndFeedType(
  _location_id: number,
  _feed_type_id: number
) {
  try {
    const deleteQuery = `
      DELETE FROM priorities
      WHERE location_id = ${_location_id}
            AND item_id IN (SELECT id FROM items WHERE feed_type_id = ${_feed_type_id});
    `;
    const result = await db.$queryRawUnsafe(deleteQuery);
    console.log("Deleted items:", result);
  } catch (error) {
    console.error("Error deleting items:", error);
  }
  //   finally {
  //    await prisma.$disconnect();
  //  }
}
