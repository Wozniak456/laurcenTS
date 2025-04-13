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
    process.stdout.write(
      "\n================== FEED BATCH STARTED ==================\n"
    );

    const fish_batch_id: number = parseInt(formData.get("batch_id") as string);
    const executed_by: number = parseInt(formData.get("executed_by") as string);
    const date_time = formData.get("date_time") as string;
    const location_id: number = parseInt(formData.get("location_id") as string);
    const item_id: number = parseInt(formData.get("item_id") as string);

    process.stdout.write(
      `Input parameters: ${JSON.stringify(
        {
          fish_batch_id,
          executed_by,
          date_time,
          location_id,
          item_id,
        },
        null,
        2
      )}\n`
    );

    const times = await db.time_table.findMany({
      orderBy: {
        id: "asc",
      },
    });

    process.stdout.write(`Time slots: ${JSON.stringify(times, null, 2)}\n`);

    // Calculate total quantity needed for the day
    let totalQtyNeeded = 0;
    const timeQtyDebug: Record<string, number> = {};

    times.forEach((time) => {
      const hours = parseInt(time.time.split(":")[0]);
      const qty = parseFloat(formData.get(`time_${hours}`) as string);
      timeQtyDebug[`time_${hours}`] = qty;
      if (!isNaN(qty)) {
        totalQtyNeeded += qty;
      }
    });

    process.stdout.write(
      `Time quantities: ${JSON.stringify(timeQtyDebug, null, 2)}\n`
    );
    process.stdout.write(`Total quantity needed: ${totalQtyNeeded}\n`);

    if (totalQtyNeeded <= 0) {
      process.stdout.write("No valid quantities found - exiting\n");
      return { message: "No valid feeding quantities provided" };
    }

    // Check if we have enough stock
    const availableBatches = await getFeedBatchByItemId(
      item_id,
      totalQtyNeeded,
      db
    );
    const totalAvailable = availableBatches.reduce(
      (sum, batch) => sum + (batch._sum.quantity || 0),
      0
    );

    if (totalAvailable < totalQtyNeeded / 1000) {
      return {
        message: `Not enough stock available. Required: ${totalQtyNeeded}kg, Available: ${
          totalAvailable * 1000
        }kg`,
      };
    }

    let index = 0;

    // Виконання транзакції
    const result = await db.$transaction(async (prisma) => {
      try {
        for (const time of times) {
          const hours = parseInt(time.time.split(":")[0]);
          const qty: number = parseFloat(
            formData.get(`time_${hours}`) as string
          );
          process.stdout.write(
            `Processing time slot ${hours}:00 with qty: ${qty}\n`
          );

          if (isNaN(qty) || qty <= 0) {
            process.stdout.write(
              `Skipping time slot ${hours}:00 - invalid quantity: ${qty}\n`
            );
            continue;
          }

          const date = new Date(date_time);
          // Format the date as YYYY-MM-DD HH:00:00 without milliseconds
          const formattedDate = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(
            2,
            "0"
          )}T${String(hours).padStart(2, "0")}:00:00.000Z`;

          process.stdout.write(`\nProcessing time ${hours}:00\n`);

          // Find the latest document for this location and date
          const startOfDay = new Date(date_time);
          startOfDay.setUTCHours(0, 0, 0, 0);
          const endOfDay = new Date(date_time);
          endOfDay.setUTCHours(23, 59, 59, 999);

          const latestDoc = await prisma.documents.findFirst({
            where: {
              location_id: location_id,
              date_time: {
                gte: startOfDay,
                lt: endOfDay,
              },
            },
            orderBy: {
              date_time: "desc",
            },
          });

          // If a later document exists, use its time + 1ms
          if (latestDoc && latestDoc.date_time > date) {
            date.setTime(latestDoc.date_time.getTime() + 1);
          }

          let qtyForWholeDay = qty;

          if (index === 0) {
            qtyForWholeDay = 0;
            times.forEach((time) => {
              const howMuchToAdd = parseFloat(
                formData.get(
                  `time_${parseInt(time.time.split(":")[0])}`
                ) as string
              );
              process.stdout.write(`Adding quantity: ${howMuchToAdd}\n`);
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
              date_time: formattedDate,
              executed_by: executed_by,
              comments: "Годівля",
            },
          });

          process.stdout.write(
            `Created document: ${JSON.stringify(
              {
                id: String(feedDoc.id),
                date_time: feedDoc.date_time,
                comments: feedDoc.comments,
              },
              null,
              2
            )}\n`
          );

          let left_to_feed = qty / 1000;

          for (const batch of batches_id) {
            if (batch._sum.quantity) {
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

                process.stdout.write(
                  `Created transactions: ${JSON.stringify(
                    {
                      fetchTransactionId: String(fetchTran.id),
                      feedTransactionId: String(feedTran.id),
                      recordId: String(record.id),
                    },
                    null,
                    2
                  )}\n`
                );

                left_to_feed = 0;
                break;
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

                process.stdout.write(
                  `Витягнули зі складу: ${fetchTran.id} і вкинули в басейн: ${feedTran.id}\n`
                );
                process.stdout.write(`Собівартість змінилася, ${record}\n`);

                left_to_feed -= batch._sum.quantity; // Віднімаємо використану кількість
                process.stdout.write(`left_to_feed = ${left_to_feed}\n`);
              }
            }
          }

          if (left_to_feed > 0) {
            process.stdout.write(
              `Не вдалося знайти достатню кількість корму для годування. Залишилося ${left_to_feed}.\n`
            );
          }

          process.stdout.write("Витягнули зі складу \n");

          index++;
        }
      } catch (innerError: any) {
        process.stdout.write(
          `Transaction error: ${innerError.message || "невідома помилка"}\n`
        );
        throw new Error(
          `Транзакція не виконана: ${innerError.message || "невідома помилка"}`
        );
      }
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      {
        process.stdout.write(err.message + "\n");
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
