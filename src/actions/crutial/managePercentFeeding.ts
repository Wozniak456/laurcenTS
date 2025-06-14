"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

export async function managePercentFeeding(
  formState: { message: string } | undefined,
  formData: FormData
) {
  try {
    console.log("ми в managePercentFeeding");
    console.log(formData);

    const location_id: number = parseInt(formData.get("location") as string);
    const percent: number = parseInt(formData.get("percent") as string);
    const validFrom = new Date(formData.get("validFrom") as string);

    await updatePoolByLocationId(location_id, percent, validFrom);

    console.log(`% відхилення в годуванні для локації ${location_id} оновлена`);
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
      console.log(`No pool associated with location ID ${locationId}`);
      return null;
    }

    const poolIdToUpdate = location.pool_id;
    const employee_id = 3; // TODO: Replace with actual employee id from session when multiuser

    // Find the current active record for this pool
    const prev = await db.percent_feeding_history.findFirst({
      where: {
        pool_id: poolIdToUpdate,
        valid_to: null,
      },
      orderBy: { valid_from: "desc" },
    });

    // If found, close it by setting valid_to to the day before validFrom
    if (prev) {
      const prevValidTo = new Date(validFrom);
      prevValidTo.setDate(prevValidTo.getDate() - 1);
      await db.percent_feeding_history.update({
        where: { id: prev.id },
        data: { valid_to: prevValidTo },
      });
    }

    // If newPercent is 0, do not create a new record
    if (newPercent === 0) {
      console.log(
        `Closed active percent_feeding_history for pool ID ${poolIdToUpdate}, no new record created (percent_feeding=0)`
      );
      return null;
    }

    // Insert a new record into percent_feeding_history
    const newHistory = await db.percent_feeding_history.create({
      data: {
        pool_id: poolIdToUpdate,
        percent_feeding: newPercent,
        valid_from: validFrom,
        created_by: employee_id,
      },
    });

    console.log(
      `Inserted percent_feeding_history for pool ID ${poolIdToUpdate}`
    );
    return newHistory;
  } catch (error) {
    console.error("Error updating percent_feeding_history:", error);
    throw error;
  }
}
