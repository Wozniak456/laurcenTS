"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { stockPool } from "./stockPool";
import { updatePrevPool } from "./updatePrevPool";
import { checkMultipleLocationsForPostedOperations } from "@/utils/poolUtils";

type updatePrevPoolProps = {
  formData: FormData;
  formState: { message: string } | undefined;
  info: {
    amount_in_pool: number;
    divDocId: bigint;
  };
};

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

export async function batchDivision(
  formState: { message: string } | undefined,
  formData: FormData
): Promise<{ message: string } | undefined> {
  const today: string = formData.get("today") as string;
  try {
    //console.log("ми в batchDivision");
    //console.log(formData);

    const location_from: number = parseInt(
      formData.get("location_id_from") as string
    );
    const batch_id_from: number = parseInt(
      formData.get("batch_id_from") as string
    );
    const fish_qty_in_location_from: number = parseInt(
      formData.get("fish_qty_in_location_from") as string
    );
    // const average_fish_mass : number = parseFloat(formData.get('average_fish_mass') as string);

    // Collect all destination locations for validation
    const destinationLocations: number[] = [];
    let index1 = 0;
    while (true) {
      const location_id_to: number = parseInt(
        formData.get(`location_id_to_${index1}`) as string
      );
      const stocking_fish_amount: number = parseInt(
        formData.get(`stocking_fish_amount_${index1}`) as string
      );

      if (!location_id_to) {
        break;
      }

      destinationLocations.push(location_id_to);
      index1++;
    }

    // Check if all destination locations allow operations
    const validationResult = await checkMultipleLocationsForPostedOperations(
      destinationLocations,
      today
    );

    if (!validationResult.allAllowed) {
      const blockedLocations = validationResult.blockedLocations
        .map((loc) => `${loc.locationName}: ${loc.reason}`)
        .join("; ");
      return {
        message: `Операція заблокована: ${blockedLocations}`,
      };
    }

    let sum = 0;
    let index2 = 0;
    while (true) {
      const location_id_to: number = parseInt(
        formData.get(`location_id_to_${index2}`) as string
      );
      const stocking_fish_amount: number = parseInt(
        formData.get(`stocking_fish_amount_${index2}`) as string
      );

      if (!location_id_to) {
        break;
      }

      sum += stocking_fish_amount;

      index2++;
    }

    //console.log(
    //"fish_qty_in_location_from",
    //fish_qty_in_location_from,
    //"sum",
    //sum
    //);

    if (isNaN(fish_qty_in_location_from) || fish_qty_in_location_from < sum) {
      throw new Error("У басейні немає стільки риби");
    }

    // створюємо документ розділення
    const divDoc = await db.documents.create({
      data: {
        location_id: location_from,
        doc_type_id: 2, // розділення
        date_time: addCurrentTimeToDate(new Date(today)),
        executed_by: 3,
      },
    });

    //console.log(`документ розділення для локації ${location_from}`, divDoc);

    //рахуємо скільки ми хочемо витягнути

    let index0 = 0;
    while (true) {
      const location_id_to: number = parseInt(
        formData.get(`location_id_to_${index0}`) as string
      );
      const stocking_fish_amount: number = parseInt(
        formData.get(`stocking_fish_amount_${index0}`) as string
      );

      if (!location_id_to) {
        break;
      }

      // знаходимо останнє зариблення для нового басейна
      const last_stocking = await db.itemtransactions.findFirst({
        where: {
          location_id: location_id_to,
          documents: {
            doc_type_id: 1,
          },
        },
        include: {
          documents: {
            include: {
              stocking: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      });

      //зариблення. підганяємо вхідні ідентифікатори для функції stockPool

      formData.delete(`location_id_to_${index0}`);
      formData.delete(`stocking_fish_amount_${index0}`);
      formData.delete(`batch_id_from`);

      formData.set("location_id_to", String(location_id_to)); // новий басейн
      formData.set("fish_amount", String(stocking_fish_amount)); // скільки зариблюємо
      formData.set("batch_id", String(batch_id_from)); //партія з попереднього

      formData.set("div_doc_id", String(batch_id_from)); //партія з попереднього

      if (last_stocking) {
        if (last_stocking.quantity >= stocking_fish_amount) {
          //console.log(
          //"у басейні більше, ніж прийшло. ",
          //last_stocking.quantity,
          //">=",
          //stocking_fish_amount
          //);
          formData.set("batch_id_to", String(last_stocking?.batch_id)); //партія з нового
        } else {
          //console.log(
          //"у басейні менше, ніж прийшло. ",
          //last_stocking.quantity,
          //"<",
          //stocking_fish_amount
          //);
          formData.set("batch_id_to", String(batch_id_from)); //партія з старого
        }
      }

      formData.set(
        "fish_amount_in_location_to",
        String(last_stocking?.quantity)
      ); //скільки у новому басейні

      // Set parent_document for use in stockPool
      formData.set("parent_document", String(divDoc.id));

      // Set the correct average_fish_mass for this destination
      let avgWeight = formData.get(`average_fish_mass_${index0}`);
      let calculatedAvgWeight = avgWeight ? parseFloat(avgWeight as string) : 0;
      const lastAvg = last_stocking?.documents?.stocking?.[0]?.average_weight;
      if (
        last_stocking &&
        last_stocking.quantity > 0 &&
        lastAvg !== undefined
      ) {
        const currentQty = last_stocking.quantity;
        const transferQty = stocking_fish_amount;
        const formAvg = avgWeight ? parseFloat(avgWeight as string) : 0;
        const newQty = currentQty + transferQty;
        if (newQty > 0) {
          calculatedAvgWeight =
            (currentQty * lastAvg + transferQty * formAvg) / newQty;
        } else {
          calculatedAvgWeight = formAvg;
        }
      }
      formData.set("average_fish_mass", calculatedAvgWeight.toString()); // weighted value
      formData.set(
        "form_average_weight",
        avgWeight ? avgWeight.toString() : ""
      ); // original form value

      await stockPool(formState, formData);

      // Clean up for next iteration
      formData.delete("average_fish_mass");

      index0++;
    }

    const info: updatePrevPoolProps = {
      formData: formData,
      formState: formState,
      info: {
        amount_in_pool: fish_qty_in_location_from - sum,
        divDocId: divDoc.id,
      },
    };
    //console.log(
    //"СКІЛЬКИ МИ БУДЕМО ВКИДАТИ В СТАРИЙ БАСЕЙН",
    //fish_qty_in_location_from - sum
    //);

    //console.log("що ми передаємо в updatePrevPool", info);
    await updatePrevPool(info);
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

  revalidatePath(`/pool-managing/day/${today}`);
  revalidatePath("/summary-feeding-table/week");
  revalidatePath(`/accumulation/view`);
  // revalidatePath('/leftovers/view')

  return { message: "Розділення успішно виконано!" };
}
