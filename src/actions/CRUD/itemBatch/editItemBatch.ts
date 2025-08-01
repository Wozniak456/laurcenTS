"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
// import { redirect } from "next/navigation";

export async function editItemBatch(
  formState: { message: string },
  formData: FormData
) {
  try {
    //console.log('editItemBatch', formData)
    const batch_id: number = parseInt(formData.get("batch_id") as string);
    const item_id: number = parseInt(formData.get("item_id") as string);
    const dateStr = formData.get("date") as string;
    const qty: number = parseInt(formData.get("qty") as string);
    const doc_id: number = parseInt(formData.get("doc_id") as string);
    const tran_id: number = parseInt(formData.get("tran_id") as string);

    // Update transaction quantity if provided
    if (qty) {
      await db.itemtransactions.update({
        where: {
          id: tran_id,
        },
        data: {
          quantity: qty,
        },
      });
    }
    // Update batch date and/or name if date or item_id is provided
    if (item_id || dateStr) {
      const itemBatch = await db.itembatches.findFirst({
        where: {
          id: batch_id,
        },
      });

      if (itemBatch) {
        let item_id_to_insert = item_id || itemBatch.item_id;
        let date_to_insert = dateStr ? new Date(dateStr) : itemBatch.created;

        // If date or item_id changed, update both created and name
        if (dateStr || item_id) {
          const name = await getBatchName(
            item_id_to_insert as number,
            date_to_insert as Date
          );

          await db.itembatches.update({
            where: {
              id: batch_id,
            },
            data: {
              created: date_to_insert,
              item_id: item_id_to_insert,
              name: name,
            },
          });
        }
      }
    }
    // return{message :'Оновлено!'}
  } catch (err: unknown) {
    //console.log('ми в catch Error editItemBatch')
    if (err instanceof Error) {
      if (err.message.includes("Unique constraint failed")) {
        return {
          message: `Партія з цією назвою вже існує`,
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
  revalidatePath(`/batches/${formData.get("batch_id")}`);
  revalidatePath("/batches/view");
  redirect(`/batches/${formData.get("batch_id")}`);
}

async function getBatchName(item_id: number, date: Date) {
  const parts = date
    .toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .split(".");
  return `${parts[0].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${
    parts[2]
  }/C`;
}
