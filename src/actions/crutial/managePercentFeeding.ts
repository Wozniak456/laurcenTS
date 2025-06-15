"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

export async function managePercentFeeding(
  formState: { message: string } | undefined,
  formData: FormData
) {
  try {
    //console.log("ми в managePercentFeeding");
    //console.log(formData);

    const location_id: number = parseInt(formData.get("location") as string);
    const percent: number = parseInt(formData.get("percent") as string);
    const validFrom = new Date(formData.get("validFrom") as string);

    await updatePoolByLocationId(location_id, percent, validFrom);

    //console.log(`% відхилення в годуванні для локації ${location_id} оновлена`);
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

async function updatePoolByLocationId(
  locationId: number,
  newPercent: number,
  validFrom: Date
) {
  try {
    // 1. Find the pool_id associated with the given location.id
    const location = await db.locations.findUnique({
      where: {
        id: locationId,
      },
      select: {
        pool_id: true,
      },
    });

    if (!location?.pool_id) {
      //console.log(`No pool associated with location ID ${locationId}`);
      return null;
    }

    const poolIdToUpdate = location.pool_id;
    const employee_id = 3; // TODO: Replace with actual employee id from session when multiuser

    // 1. Check if a record already exists for this pool and valid_from (case: repeat change on same date)
    const existing = await db.percent_feeding_history.findFirst({
      where: {
        pool_id: poolIdToUpdate,
        valid_from: validFrom,
      },
    });
    if (existing) {
      // Update the existing interval for this date
      await db.percent_feeding_history.update({
        where: { id: existing.id },
        data: {
          percent_feeding: newPercent,
          updated_by: employee_id,
          updated_at: new Date(),
        },
      });
      return;
    }

    // 2. Find previous and next intervals for this pool
    const intervals = await db.percent_feeding_history.findMany({
      where: {
        pool_id: poolIdToUpdate,
      },
      orderBy: { valid_from: "asc" },
    });
    const prevInterval = intervals
      .filter((i) => i.valid_from < validFrom)
      .slice(-1)[0];
    const nextInterval = intervals.find((i) => i.valid_from > validFrom);

    // 2. If new value is the same as previous, merge intervals (remove redundant scheduled change)
    if (prevInterval && Number(prevInterval.percent_feeding) === newPercent) {
      // If there is a next interval, extend prevInterval to its valid_from - 1
      let newValidTo = nextInterval ? new Date(nextInterval.valid_from) : null;
      if (newValidTo) {
        newValidTo.setDate(newValidTo.getDate() - 1);
      }
      await db.percent_feeding_history.update({
        where: { id: prevInterval.id },
        data: { valid_to: newValidTo },
      });
      // Remove any scheduled change at validFrom (if exists)
      await db.percent_feeding_history.deleteMany({
        where: {
          pool_id: poolIdToUpdate,
          valid_from: validFrom,
        },
      });
      return;
    }

    // 3. Otherwise, close previous interval, insert new, and copy forward any future scheduled change
    if (prevInterval) {
      const prevValidTo = new Date(validFrom);
      prevValidTo.setDate(prevValidTo.getDate() - 1);
      await db.percent_feeding_history.update({
        where: { id: prevInterval.id },
        data: { valid_to: prevValidTo },
      });
    }
    // Insert the new interval
    await db.percent_feeding_history.create({
      data: {
        pool_id: poolIdToUpdate,
        percent_feeding: newPercent,
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
      await db.percent_feeding_history.update({
        where: { id: nextInterval.id },
        data: {
          valid_from: nextInterval.valid_from,
          valid_to: nextInterval.valid_to,
        },
      });
    }
    return;
  } catch (error) {
    //console.error("Error updating percent_feeding_history:", error);
    throw error;
  }
}
