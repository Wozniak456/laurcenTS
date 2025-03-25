"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { stockPool } from "./stockPool";

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

export async function updateCurrentPoolState(
  formState: { message: string } | undefined,
  formData: FormData
) {
  const today: string = formData.get("today") as string;

  try {
    console.log("ми в updateCurrentPoolState");
    console.log(formData);

    let batch_id_before: number = parseInt(
      formData.get("batch_id_before") as string
    );
    let fish_amount_before: number = parseInt(
      formData.get("fish_amount_before") as string
    );
    const average_fish_mass_before: number = parseInt(
      formData.get("average_fish_mass_before") as string
    );
    const location_id_to: number = parseInt(
      formData.get("location_id_to") as string
    );
    const batch_id_from: number = parseInt(formData.get("batch_id") as string);
    const fish_amount: number = parseInt(formData.get("fish_amount") as string);

    if (!batch_id_before && !fish_amount_before && !average_fish_mass_before) {
      throw new Error("");
    }

    //перевірка чи вистачає потрібного корму на складі
    const fish_amount_on_warehouse = await db.itemtransactions.groupBy({
      by: ["batch_id"],
      where: {
        location_id: 87,
        batch_id: batch_id_from,
      },
      _sum: {
        quantity: true,
      },
    });

    const fishQuantityOnWarehouse =
      fish_amount_on_warehouse[0]?._sum?.quantity || 0; //100

    let newFishQuantityOnWarehouse = fishQuantityOnWarehouse; //100

    if (!batch_id_before) {
      console.log("ПАРТІЯ НЕ ЗМІНИЛАСЯ");
      console.log(
        "fish_amount_before: ",
        fish_amount_before,
        "fishQuantityOnWarehouse: ",
        fishQuantityOnWarehouse
      );
      newFishQuantityOnWarehouse = fish_amount_before + fishQuantityOnWarehouse; //300
    }

    console.log("newFishQuantityOnWarehouse", newFishQuantityOnWarehouse);

    if (fish_amount > newFishQuantityOnWarehouse) {
      console.log(
        "fish_amount > newFishQuantityOnWarehouse: ",
        fish_amount > newFishQuantityOnWarehouse
      );
      throw new Error("Недостатня кількість на складі");
    }

    if (!batch_id_before) {
      batch_id_before = batch_id_from;
    }

    if (!fish_amount_before) {
      fish_amount_before = fish_amount;
    }

    //повертаємо до складу те, що було перед зміною

    const arriveDoc = await db.documents.create({
      data: {
        location_id: location_id_to,
        doc_type_id: 12, //повернення до складу
        executed_by: 3,
        date_time: addCurrentTimeToDate(new Date(today)),
      },
    });

    //витягуємо з басейна

    const fetchTran = await db.itemtransactions.create({
      data: {
        doc_id: arriveDoc.id,
        location_id: location_id_to,
        batch_id: batch_id_before,
        quantity: -fish_amount_before,
        unit_id: 1,
      },
    });

    //повертаємо на склад

    const arriveTran = await db.itemtransactions.create({
      data: {
        doc_id: arriveDoc.id,
        location_id: 87,
        batch_id: batch_id_before,
        quantity: fish_amount_before,
        unit_id: 1,
        parent_transaction: fetchTran.id,
      },
    });

    formData.set("location_id_from", "87");

    await stockPool(formState, formData);

    // return({message: 'hello'})
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
}
