"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { stockPool } from "./stockPool";
import { redirect } from "next/navigation";
import { isPoolOperationsAllowed } from "@/utils/poolUtils";

function addCurrentTimeToDate(date: Date) {
  if (!(date instanceof Date)) {
    throw new Error("Input must be a Date object.");
  }

  const now = new Date();

  date.setHours(now.getHours());
  date.setMinutes(now.getMinutes());
  date.setSeconds(now.getSeconds());
  date.setMilliseconds(now.getMilliseconds());

  return date;
}

// реєстрація списання
export async function disposal(
  formState: { message: string } | undefined,
  formData: FormData
) {
  const today: string = formData.get("today") as string;
  try {
    //console.log("ми в disposal");
    //console.log(formData);

    const location_id_from: number = parseInt(
      formData.get("location_id_from") as string
    );
    const fish_amount_in_pool: number = parseInt(
      formData.get("fish_amount_in_pool") as string
    );
    const batch_id: number = parseInt(formData.get("batch_id") as string);
    const reason_id: number = parseInt(formData.get("reason") as string);
    const qty: number = parseInt(formData.get("qty") as string);
    const average_weight_str = formData.get("average_fish_mass") as string;

    // Check if pool operations are allowed (no posted operations after this date)
    const operationsCheck = await isPoolOperationsAllowed(
      location_id_from,
      today
    );
    if (!operationsCheck.allowed) {
      return {
        message: `Операція заблокована: ${operationsCheck.reason}`,
      };
    }

    //створення документа списання
    const disposalDoc = await db.documents.create({
      data: {
        location_id: location_id_from,
        doc_type_id: 11,
        date_time: addCurrentTimeToDate(new Date(today)),
        executed_by: 3,
      },
    });

    //console.log("документ списання", disposalDoc.id);

    //створення запису із вказанням деталей списання
    const disposalRecord = await db.disposal_table.create({
      data: {
        doc_id: disposalDoc.id,
        reason_id: reason_id,
        qty: qty,
        batch_id: batch_id,
        date: addCurrentTimeToDate(new Date(today)),
        location_id: location_id_from,
      },
    });
    //console.log("запис із вказанням деталей списання", disposalRecord.id);

    //створення транзакції списання
    const disposalTran = await db.itemtransactions.create({
      data: {
        doc_id: disposalDoc.id,
        location_id: location_id_from,
        batch_id: batch_id,
        quantity: -qty,
        unit_id: 1,
      },
    });

    //console.log("транзакція списання", disposalTran.id);

    formData.set("fish_amount_in_pool", String(fish_amount_in_pool - qty));
    formData.set("location_id_to", String(location_id_from));
    formData.set("fish_amount", String(fish_amount_in_pool - qty));

    await stockPool(formState, formData);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        message: err.message,
      };
    } else {
      return { message: "Something went wrong!" };
    }
  }
  revalidatePath(`/pool-managing/day/${today}`);
  revalidatePath("/summary-feeding-table/week");
  // revalidatePath(`/accumulation/view`)
  redirect(`/pool-managing/day/${today}`);
}
