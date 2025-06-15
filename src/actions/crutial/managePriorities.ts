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

    if (!item_id || item_id === 0) {
      // Do not create or update if item_id is not valid
      return;
    }

    // 1. Check if a record already exists for this location/feed_type and valid_from (case: repeat change on same date)
    const existing = await db.priority_history.findFirst({
      where: {
        location_id: location_id,
        valid_from: validFrom,
        items: { feed_type_id: feed_type_id },
      },
    });
    if (existing) {
      // Update the existing interval for this date
      await db.priority_history.update({
        where: { id: existing.id },
        data: {
          item_id: item_id,
          updated_by: employee_id,
          updated_at: new Date(),
        },
      });
      revalidatePath(`/summary-feeding/day/${formData.get("date")}`);
      return;
    }

    // 2. Find previous and next intervals for this location/feed_type
    const intervals = await db.priority_history.findMany({
      where: {
        location_id: location_id,
        items: { feed_type_id: feed_type_id },
      },
      orderBy: { valid_from: "asc" },
    });
    const prevInterval = intervals
      .filter((i) => i.valid_from < validFrom)
      .slice(-1)[0];
    const nextInterval = intervals.find((i) => i.valid_from > validFrom);

    // 2. If new value is the same as previous, merge intervals (remove redundant scheduled change)
    if (prevInterval && prevInterval.item_id === item_id) {
      // If there is a next interval, extend prevInterval to its valid_from - 1
      let newValidTo = nextInterval ? new Date(nextInterval.valid_from) : null;
      if (newValidTo) {
        newValidTo.setDate(newValidTo.getDate() - 1);
      }
      await db.priority_history.update({
        where: { id: prevInterval.id },
        data: { valid_to: newValidTo },
      });
      // Remove any scheduled change at validFrom (if exists)
      await db.priority_history.deleteMany({
        where: {
          location_id: location_id,
          valid_from: validFrom,
          items: { feed_type_id: feed_type_id },
        },
      });
      revalidatePath(`/summary-feeding/day/${formData.get("date")}`);
      return;
    }

    // 3. Otherwise, close previous interval, insert new, and copy forward any future scheduled change
    if (prevInterval) {
      const prevValidTo = new Date(validFrom);
      prevValidTo.setDate(prevValidTo.getDate() - 1);
      await db.priority_history.update({
        where: { id: prevInterval.id },
        data: { valid_to: prevValidTo },
      });
    }
    // Insert the new interval
    await db.priority_history.create({
      data: {
        location_id: location_id,
        item_id: item_id,
        priority: 1,
        valid_from: validFrom,
        valid_to: nextInterval
          ? new Date(
              nextInterval.valid_from.setDate(
                nextInterval.valid_from.getDate() - 1
              )
            )
          : null,
        created_by: employee_id,
      },
    });
    // If there is a next interval, re-insert it to start from its original valid_from
    if (nextInterval) {
      await db.priority_history.update({
        where: { id: nextInterval.id },
        data: {
          valid_from: nextInterval.valid_from,
          valid_to: nextInterval.valid_to,
        },
      });
    }
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
