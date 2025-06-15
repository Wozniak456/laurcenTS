"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

export async function managePriorities(
  formState: { message: string } | undefined,
  formData: FormData
) {
  try {
    const location_id: number = parseInt(formData.get("location") as string);
    const item_id_raw = formData.get("feed");
    const item_id: number | null = item_id_raw
      ? parseInt(item_id_raw as string)
      : null;
    let feed_type_id: number | null = null;
    if (item_id) {
      feed_type_id = await getItemFeedTypeId(item_id);
    } else {
      // Try to get feed_type_id from formData if item_id is not provided
      const feed_type_id_raw = formData.get("feed_type_id");
      feed_type_id = feed_type_id_raw
        ? parseInt(feed_type_id_raw as string)
        : null;
      if (!feed_type_id) {
        throw new Error(
          "feed_type_id is required when item_id is not provided"
        );
      }
    }
    const employee_id = 3; // TODO: Replace with actual employee id from session when multiuser
    const validFrom = new Date(formData.get("validFrom") as string);

    // Find the current active record for this location and feed_type
    const prev = await db.priority_history.findFirst({
      where: {
        location_id: location_id,
        valid_to: null,
        items: {
          feed_type_id: feed_type_id,
        },
      },
      orderBy: { valid_from: "desc" },
    });

    // If found, close it by setting valid_to to the day before validFrom
    if (prev) {
      const prevValidTo = new Date(validFrom);
      prevValidTo.setDate(prevValidTo.getDate() - 1);
      await db.priority_history.update({
        where: { id: prev.id },
        data: { valid_to: prevValidTo },
      });
    }

    // If item_id is 0 or null, do not create a new record
    if (!item_id || item_id === 0) {
      //console.log(
      //`Closed active priority_history for location ${location_id} and feed_type_id ${feed_type_id}, no new record created (item_id=0/null)`
      //);
      return;
    }

    // Insert a new record into priority_history
    await db.priority_history.create({
      data: {
        location_id: location_id,
        item_id: item_id,
        priority: 1,
        valid_from: validFrom,
        created_by: employee_id,
      },
    });

    //console.log(
    //`priority_history: inserted for location ${location_id} and item ${item_id}`
    //);
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
}
