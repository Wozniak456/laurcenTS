"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { stockPool } from "./stockPool";

export async function updateSmth(
  formState: { message: string } | undefined,
  formData: FormData
) {
  //console.log(formData);
  const date = formData.get("date") as string;
  const location_id: number = parseInt(
    formData.get("location_id_to") as string
  );

  const fish_weight: number = parseFloat(
    formData.get("average_fish_mass") as string
  );

  try {
    //якщо нічого не змінилося
    if (!fish_weight) {
      revalidatePath(`general-summary/${date}`);
    } else {
      const dateValue = new Date(date);
      dateValue.setHours(23, 59, 59, 999);
      //знаходимо документ останнього зариблення
      const lastStocking = await db.documents.findFirst({
        select: {
          date_time: true,
          stocking: {
            select: {
              average_weight: true,
            },
          },
          itemtransactions: {
            select: {
              itembatches: {
                select: {
                  id: true,
                },
              },
              quantity: true,
            },
            where: {
              quantity: {
                gte: 0,
              },
            },
          },
        },
        where: {
          location_id: location_id,
          doc_type_id: 1,
          date_time: {
            lte: dateValue,
          },
        },
        orderBy: {
          id: "desc",
        },
        take: 1,
      });

      formData.set("location_id_from", String(location_id));
      formData.set(
        "batch_id",
        String(lastStocking?.itemtransactions[0].itembatches.id)
      );
      formData.set(
        "fish_amount",
        String(lastStocking?.itemtransactions[0].quantity)
      );
      formData.set(
        "fish_qty_in_location_from",
        String(lastStocking?.itemtransactions[0].quantity)
      );
      formData.set("today", date);
      stockPool(formState, formData);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        message: err.message,
      };
    } else {
      return { message: "Something went wrong!" };
    }
  }
  revalidatePath(`/pool-managing/view`);
  revalidatePath(`/summary-feeding-table/week`);

  revalidatePath(`/accumulation/view`);
  revalidatePath(`general-summary/${date}`);

  // revalidatePath(`/summary-feeding-table/day/2024-08-11`)
  redirect(`/general-summary/${date}`);
}
