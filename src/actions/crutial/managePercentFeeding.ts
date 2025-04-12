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

    await updatePoolByLocationId(location_id, percent);

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

async function updatePoolByLocationId(locationId: number, newPercent: number) {
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
      return null; // Or handle the case where no pool is found
    }

    const poolIdToUpdate = location.pool_id;

    // 2. Use the retrieved pool_id to update the pools table
    const updatedPool = await db.pools.update({
      where: {
        id: poolIdToUpdate, // Assuming 'Id' is the primary key of the pools table
      },
      data: {
        percent_feeding: newPercent,
      },
    });

    console.log(`Updated pool with ID ${poolIdToUpdate}`);
    return updatedPool;
  } catch (error) {
    console.error("Error updating pool:", error);
    throw error;
  }
}
