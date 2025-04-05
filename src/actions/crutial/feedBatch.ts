"use server";
import { db } from "@/db";
import { getFeedBatchByItemId } from "./getFeedBatchByItemId";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function feedBatch(
  formState: { message: string },
  formData: FormData
) {
  try {
    console.log("feedBatch");
    console.log(formData);

    const fish_batch_id: number = parseInt(formData.get("batch_id") as string);
    const executed_by: number = parseInt(formData.get("executed_by") as string);
    const date_time = formData.get("date_time") as string;
    const location_id: number = parseInt(formData.get("location_id") as string);
    const item_id: number = parseInt(formData.get("item_id") as string);

    const times = await db.time_table.findMany({
      orderBy: {
        id: "asc",
      },
    });

    let index = 0;

    // Виконання транзакції
    const result = await db.$transaction(async (prisma) => {
      try {
        for (const time of times) {
          const hours = parseInt(time.time.split(":")[0]);
          const qty: number = parseFloat(
            formData.get(`time_${hours}`) as string
          );
          const date = new Date(date_time);
          date.setUTCHours(hours);
          /*
          console.log(
            "we want to feed ",
            location_id,
            " on ",
            date_time,
            " at ",
            hours,
            " and system will save on ",
            date,
            " and current time ",
            date.getHours()
          );
          let abra = 34 / 0;
          */
          //ПЕРЕВІРИТИ НА ПЕРШІЙ ІТЕРАЦІЇ ЧИ ДОСТАТНЬО НА СКЛАДІ КОРМУ НА ВЕСЬ ДЕНЬ
          let qtyForWholeDay = qty;

          if (index === 0) {
            qtyForWholeDay = 0;
            times.forEach((time) => {
              const howMuchToAdd = parseFloat(
                formData.get(
                  `time_${parseInt(time.time.split(":")[0])}`
                ) as string
              );
              console.log("ми додали: ", howMuchToAdd);
              qtyForWholeDay += howMuchToAdd;
            });
          }

          const batches_id = await getFeedBatchByItemId(
            item_id,
            qtyForWholeDay,
            prisma
          );

          const feedDoc = await prisma.documents.create({
            data: {
              location_id: location_id,
              doc_type_id: 9,
              date_time: date,
              executed_by: executed_by,
            },
          });
          console.log("DocId: ", feedDoc.id);
          console.log("партія корму: ", batches_id);

          let left_to_feed = qty / 1000;

          for (const batch of batches_id) {
            if (batch._sum.quantity) {
              // Якщо вистачає корму в першій партії
              if (batch._sum.quantity >= left_to_feed) {
                const fetchTran = await prisma.itemtransactions.create({
                  data: {
                    doc_id: feedDoc.id,
                    location_id: 87,
                    batch_id: batch.batch_id,
                    quantity: -left_to_feed,
                    unit_id: 2,
                  },
                });

                const feedTran = await prisma.itemtransactions.create({
                  data: {
                    doc_id: feedDoc.id,
                    location_id: location_id,
                    batch_id: batch.batch_id,
                    quantity: left_to_feed,
                    unit_id: 2,
                  },
                });

                //Знайти останню собівартість і останнє покоління
                const latestGeneration =
                  await prisma.batch_generation.findFirst({
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

                const record = await prisma.generation_feed_amount.create({
                  data: {
                    batch_generation_id: latestGeneration?.id as bigint,
                    feed_batch_id: batch.batch_id,
                    amount: qty,
                  },
                });

                console.log(
                  `Витягнули зі складу: ${fetchTran.id} і вкинули в басейн: ${feedTran.id}`
                );
                console.log(`Собівартість змінилася, ${record}`);

                left_to_feed = 0;
                break; // Виходимо з циклу, бо всю необхідну кількість взято
              } else {
                // Якщо потрібно використовувати ще одну партію
                const fetchTran = await prisma.itemtransactions.create({
                  data: {
                    doc_id: feedDoc.id,
                    location_id: 87,
                    batch_id: batch.batch_id,
                    quantity: -batch._sum.quantity,
                    unit_id: 2,
                  },
                });

                const feedTran = await prisma.itemtransactions.create({
                  data: {
                    doc_id: feedDoc.id,
                    location_id: location_id,
                    batch_id: batch.batch_id,
                    quantity: batch._sum.quantity,
                    unit_id: 2,
                  },
                });

                //Знайти останню собівартість і останнє покоління
                const latestGeneration =
                  await prisma.batch_generation.findFirst({
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

                const record = await prisma.generation_feed_amount.create({
                  data: {
                    batch_generation_id: latestGeneration?.id as bigint,
                    feed_batch_id: batch.batch_id,
                    amount: qty,
                  },
                });

                console.log(
                  `Витягнули зі складу: ${fetchTran.id} і вкинули в басейн: ${feedTran.id}`
                );
                console.log(`Собівартість змінилася, ${record}`);

                left_to_feed -= batch._sum.quantity; // Віднімаємо використану кількість
                console.log("left_to_feed = ", left_to_feed);
              }
            }
          }

          if (left_to_feed > 0) {
            console.log(
              `Не вдалося знайти достатню кількість корму для годування. Залишилося ${left_to_feed}.`
            );
          }

          console.log("Витягнули зі складу ");

          index++;
        }
      } catch (innerError: any) {
        // console.error('Помилка у транзакції:');
        throw new Error(
          `Транзакція не виконана: ${innerError.message || "невідома помилка"}`
        ); // Кидаємо помилку для відкату
      }
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      {
        console.log(err.message);
        return { message: err.message };
      }
    } else {
      return { message: "Something went wrong!" };
    }
  }
  // revalidatePath(`/summary-feeding-table/day/${formData.get('date_time')}`)
  revalidatePath(`/accumulation/view`);
  revalidatePath("/leftovers/view");
  // return { message: 'успішно' }
  redirect(`/summary-feeding-table/day/${formData.get("date_time")}`);
}
