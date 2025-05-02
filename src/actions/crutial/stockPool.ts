"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { getFeedAmountsAndNames } from "./getFeedAmountsAndNames";
import { createCalcTable } from "./createCalcTable";

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

export async function stockPool(
  formState: { message: string } | undefined,
  formData: FormData,
  prisma?: any // Приймаємо prisma тут
): Promise<{ message: string } | undefined> {
  const today: string = formData.get("today") as string;

  try {
    console.log("stockPool");
    console.log(formData);

    const activeDb = prisma || db;

    let location_id_from: number = parseInt(
      formData.get("location_id_from") as string
    );

    const location_id_to: number = parseInt(
      formData.get("location_id_to") as string
    );
    const batch_id_from: number = parseInt(formData.get("batch_id") as string);
    let batch_id_to: number = parseInt(formData.get("batch_id_to") as string);
    const stocking_quantity: number = parseInt(
      formData.get("fish_amount") as string
    );
    let quantity_in_location_to: number = parseInt(
      formData.get("fish_amount_in_location_to") as string
    );
    const fish_qty_in_location_from: number = parseInt(
      formData.get("fish_qty_in_location_from") as string
    );
    const average_weight_str = formData.get("average_fish_mass") as string;
    const average_weight = parseFloat(average_weight_str.replace(",", "."));

    const executed_by = 3; //number = parseInt(formData.get('executed_by') as string);
    const comments: string = formData.get("comments") as string;

    // const p_tran: number = parseInt(formData.get('p_tran') as string);

    // перевірка, щоб зі складу не взяли більше, ніж є

    if (location_id_from == 87) {
      const fish_amount_on_warehouse = await activeDb.itemtransactions.groupBy({
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
        fish_amount_on_warehouse[0]?._sum?.quantity || 0;

      if (
        fishQuantityOnWarehouse === 0 ||
        stocking_quantity > fishQuantityOnWarehouse
      ) {
        throw new Error("Недостатня кількість на складі");
      }
    }

    //якщо зі складу, то batch_id_to не визначено, якщо з басейна, то batch_id_to = та партія, якої більше
    if (!batch_id_to) {
      batch_id_to = batch_id_from;
    }

    // документ зариблення
    const parent_document = formData.get("division_doc_id");
    const date = addCurrentTimeToDate(new Date(today));

    // Find all documents for this location and date, ordered by time
    const startOfDay = new Date(today);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingDocs = await activeDb.documents.findMany({
      where: {
        location_id: location_id_to,
        date_time: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      orderBy: {
        date_time: "desc",
      },
    });

    // Find any documents with the exact same timestamp or later
    const conflictingDocs = existingDocs.filter(
      (doc: { date_time: Date }) => doc.date_time.getTime() >= date.getTime()
    );

    // If there are any conflicts, set our time to 1ms after the latest one
    if (conflictingDocs.length > 0) {
      const latestTime = Math.max(
        ...conflictingDocs.map((doc: { date_time: Date }) =>
          doc.date_time.getTime()
        )
      );
      date.setTime(latestTime + 1);
    }

    const stockDoc = await activeDb.documents.create({
      data: {
        location_id: location_id_to,
        doc_type_id: 1,
        date_time: date,
        executed_by: executed_by,
        comments: comments,
        parent_document: parent_document
          ? BigInt(parent_document as string)
          : undefined,
      },
    });

    if (!stockDoc) {
      throw new Error("Помилка при створенні документа зариблення");
    }

    console.log(`\n документ зариблення для ${location_id_to}`, stockDoc.id);

    // транзакція для витягування з попереднього басейна stocking_quantity

    const fetchTran = await activeDb.itemtransactions.create({
      data: {
        doc_id: stockDoc.id,
        location_id: location_id_from,
        batch_id: batch_id_from,
        quantity: -stocking_quantity,
        unit_id: 1,
        // parent_transaction: p_tran
      },
    });

    if (!fetchTran) {
      throw new Error(
        "Помилка при створенні транзакції для витягування з попереднього басейна"
      );
    }

    console.log(
      ` Витягуємо з попереднього для ${location_id_to}. Tran: `,
      fetchTran
    );

    //визначаємо яку кількість зариблювати

    let count_to_stock;

    if (quantity_in_location_to) {
      count_to_stock = stocking_quantity + quantity_in_location_to;
    } else {
      count_to_stock = stocking_quantity;
    }

    //знайти дані про останнє покоління з попередньої локації

    const prev_generation = await activeDb.batch_generation.findFirst({
      where: {
        location_id: location_id_from,
      },
      orderBy: {
        id: "desc",
      },
      take: 1,
    });

    console.log("prev_generation", prev_generation);

    const first_parent_generation = prev_generation;

    let second_parent_generation;

    //знайти дані про останнє покоління з нової локації
    if (quantity_in_location_to) {
      const generationTo = await activeDb.batch_generation.findFirst({
        where: {
          location_id: location_id_to,
        },
        orderBy: {
          id: "desc",
        },
        take: 1,
      });

      second_parent_generation = generationTo;
    }

    // транзакція для зариблення нового басейна

    const stockTran = await activeDb.itemtransactions.create({
      data: {
        doc_id: stockDoc.id,
        location_id: location_id_to,
        batch_id: batch_id_to, //
        quantity: count_to_stock,
        unit_id: 1,
        parent_transaction: fetchTran.id,
      },
    });

    if (!stockTran) {
      throw new Error(
        "Помилка при створенні транзакції для зариблення нового басейна"
      );
    }
    console.log(`Зариблюємо ${location_id_to}. Tran: `, stockTran);

    // створити покоління змішування партії
    const generationOfTwoBatches = await activeDb.batch_generation.create({
      data: {
        location_id: location_id_to,
        initial_batch_id: batch_id_to,
        first_parent_id: first_parent_generation?.id,
        second_parent_id: second_parent_generation?.id,
        transaction_id: stockTran.id,
      },
    });

    console.log("????generationOfTwoBatches", generationOfTwoBatches);

    if (first_parent_generation) {
      // знаходимо скільки зїв перший предок
      const grouped_first_ancestor = await getFeedAmountsAndNames(
        first_parent_generation?.id,
        prisma
      );
      console.log("grouped_first_ancestor", grouped_first_ancestor);

      //знаходимо який відсоток ми переміщаємо
      console.log(
        "stocking_quantity",
        stocking_quantity,
        "fish_qty_in_location_from",
        fish_qty_in_location_from
      );
      if (
        location_id_from !== location_id_to &&
        location_id_from &&
        location_id_to
      ) {
        if (!Number.isNaN(fish_qty_in_location_from)) {
          if (fish_qty_in_location_from > 0) {
            const part = stocking_quantity / fish_qty_in_location_from;
            console.log("Calculated part:", part);
            console.log(
              "Number of records to process:",
              grouped_first_ancestor.length
            );
            for (const record of grouped_first_ancestor) {
              console.log("Processing record:", {
                batch_generation_id: record.batch_generation_id,
                total_amount: record.total_amount,
                feed_batch_id: record.feed_batch_id,
                calculated_amount: record.total_amount * part,
              });
              try {
                const fetch_record =
                  await activeDb.generation_feed_amount.create({
                    data: {
                      amount: -record.total_amount * part,
                      batch_generation: {
                        connect: {
                          id: record.batch_generation_id,
                        },
                      },
                      feed_batches: {
                        connect: {
                          id: record.feed_batch_id,
                        },
                      },
                      documents: {
                        connect: {
                          id: stockDoc.id,
                        },
                      },
                    },
                  });
                console.log("Created fetch record:", fetch_record);

                // І вкидання у нову локацію
                const push_record =
                  await activeDb.generation_feed_amount.create({
                    data: {
                      amount: record.total_amount * part,
                      batch_generation: {
                        connect: {
                          id: generationOfTwoBatches.id,
                        },
                      },
                      feed_batches: {
                        connect: {
                          id: record.feed_batch_id,
                        },
                      },
                      documents: {
                        connect: {
                          id: stockDoc.id,
                        },
                      },
                    },
                  });
                console.log("Created push record:", push_record);

                console.log(
                  `витягнули частку з'їдженого: ${fetch_record.feed_batch_id}: ${fetch_record.amount}. І накинули на ${push_record.batch_generation_id}`
                );
              } catch (error) {
                console.error("Error creating feed amount records:", error);
                throw error;
              }
            }
          }
        }
      }

      if (second_parent_generation) {
        console.log("huh2?");
        // знаходимо скільки зїв другий предок, якщо він є
        const grouped_second_ancestor = await getFeedAmountsAndNames(
          second_parent_generation?.id
        );
        console.log("grouped_second_ancestor", grouped_second_ancestor);

        //додаємо записи витягування частини зїдженого з попереднього покоління
        for (const record of grouped_second_ancestor) {
          const fetch_record = await activeDb.generation_feed_amount.create({
            data: {
              amount: -record.total_amount,
              batch_generation: {
                connect: {
                  id: record.batch_generation_id,
                },
              },
              feed_batches: {
                connect: {
                  id: record.feed_batch_id,
                },
              },
              documents: {
                connect: {
                  id: stockDoc.id,
                },
              },
            },
          });
          // і вкидання у нове покоління
          const push_record = await activeDb.generation_feed_amount.create({
            data: {
              amount: record.total_amount,
              batch_generation: {
                connect: {
                  id: generationOfTwoBatches.id,
                },
              },
              feed_batches: {
                connect: {
                  id: record.feed_batch_id,
                },
              },
              documents: {
                connect: {
                  id: stockDoc.id,
                },
              },
            },
          });

          console.log(
            `витягнули частку зЇдженого: ${fetch_record.feed_batch_id}: ${fetch_record.amount}. і накинули на ${push_record.batch_generation_id}`
          );
        }
      }
      console.log("huh3?");
    }

    const stock = await activeDb.stocking.create({
      data: {
        doc_id: stockDoc.id,
        average_weight: average_weight,
      },
    });

    if (!stockTran) {
      throw new Error("Помилка при створенні запису зариблення");
    }

    console.log("Створюємо stocking: ", stock.id);

    // тепер fish_amount це вся риба, яку зариблюємо.
    formData.set("fish_amount", String(count_to_stock));
    formData.set("parent_doc", String(stockDoc.id));

    // })

    await createCalcTable(formState, formData, prisma);

    console.log("Створили calc table");
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
}
