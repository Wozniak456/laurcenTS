"use server";
import { db } from "@/db";

export const isFilled = async (location_id: number, date: string) => {
  const dateValue = new Date(date);
  dateValue.setUTCHours(23, 59, 59, 999);

  // Calculate total fish quantity for the location up to the given date
  // This is the correct approach that sums ALL transactions, not just the last document
  const sumResult = await db.itemtransactions.aggregate({
    _sum: {
      quantity: true,
    },
    where: {
      location_id: location_id,
      documents: {
        date_time: {
          lte: dateValue,
        },
      },
      itembatches: {
        items: {
          item_type_id: 1, // Fish only
        },
      },
    },
  });

  const totalFishQuantity = sumResult._sum.quantity || 0;

  // console.log(location_id, totalFishQuantity)

  // Return true if there are fish in the location (total quantity > 0)
  return totalFishQuantity > 0;
};
