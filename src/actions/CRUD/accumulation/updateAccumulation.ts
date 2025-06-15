"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getFeedBatchByItemId } from "@/actions/crutial/getFeedBatchByItemId";
import { onefeeding } from "@/actions/crutial/oneFeeding";

export async function updateAccumulation(
  formState: { message: string },
  formData: FormData
) {
  //console.log("updateAccu", formData);
  try {
    const location_id = parseInt(formData.get("location_id") as string);

    const items = await db.items.findMany({
      where: {
        item_type_id: 3,
      },
    });

    //Знайти останню собівартість і останнє покоління

    const latestGeneration = await db.batch_generation.findFirst({
      include: {
        itemtransactions: true,
      },
      where: {
        location_id: location_id,
      },
      orderBy: {
        id: "desc",
      },
      take: 1,
    });

    //console.log("остання собівартість", latestGeneration);

    items.forEach(async (item) => {
      const qty: number = parseFloat(formData.get(`item_${item.id}`) as string);
      //console.log("qty from updateAccu", qty);
      const prev_qty: number = parseFloat(
        formData.get(`prev_item_${item.id}`) as string
      );

      // prev_qty може бути NaN

      if (!isNaN(qty)) {
        //console.log("ПРАЦЮЄМО З item: ", item);

        //витягнути з басейна попереднє число
        const returnDoc = await db.documents.create({
          data: {
            location_id: location_id,
            doc_type_id: 12,
            executed_by: 3,
          },
        });

        if (prev_qty) {
          const batches_id = await getFeedBatchByItemId(
            item.id,
            prev_qty * 1000
          );

          //console.log("партія корму, яка повертається", batches_id[0]);

          const fetchTran = await db.itemtransactions.create({
            data: {
              doc_id: returnDoc.id,
              location_id: location_id,
              batch_id: batches_id[0].batch_id,
              quantity: -prev_qty,
              unit_id: 2,
            },
          });
          //console.log("Витягнули з басейна", fetchTran.id);

          const returnTran = await db.itemtransactions.create({
            data: {
              doc_id: returnDoc.id,
              location_id: 87,
              batch_id: batches_id[0].batch_id,
              quantity: prev_qty,
              unit_id: 2,
            },
          });

          //console.log("Кидаємо на склад", returnTran);

          //забираємо із собівартості

          const record = await db.generation_feed_amount.create({
            data: {
              batch_generation_id: latestGeneration?.id as bigint,
              feed_batch_id: batches_id[0].batch_id,
              amount: -prev_qty * 1000,
              doc_id: returnDoc.id,
            },
          });

          //console.log("забираємо із собівартості", record);
        }

        //погодувати
        formData.set("batch_id", String(latestGeneration?.initial_batch_id));
        formData.set("executed_by", "3"),
          formData.set("date_time", String(new Date())),
          formData.set("item_0", String(item.id));
        formData.set("qty", String(qty * 1000));
        formData.delete(`item_${item.id}`);
        formData.delete(`prev_item_${item.id}`);

        //console.log("додали поля для годування");

        await onefeeding(formState, formData);
      }
    });
    //console.log("кінець updateAccu");
  } catch (err: unknown) {
    return { message: "Something went wrong!" };
  }

  revalidatePath("/accumulation/view");
  redirect(`/accumulation/view`);
}
