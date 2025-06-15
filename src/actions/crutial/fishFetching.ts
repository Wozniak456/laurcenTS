"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { getFeedAmountsAndNames } from "./getFeedAmountsAndNames";
import { updatePrevPool } from "./updatePrevPool";
import { FetchingReasons } from "@/types/fetching-reasons";
import { stockPool } from "@/actions";
import { createCalcTable } from "./createCalcTable";
import { Prisma } from "@prisma/client";

type updatePrevPoolProps = {
  formData: FormData;
  formState: { message: string } | undefined;
  info: {
    amount_in_pool: number;
    divDocId: bigint;
  };
  prisma?: any;
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

export async function fishFetching(
  formState: { message: string } | undefined,
  formData: FormData
): Promise<{ message: string } | undefined> {
  //console.log("fishFetching");
  //console.log(formData);

  const location_id_from: number = parseInt(
    formData.get("location_id_from") as string
  );
  const batch_id_from: number = parseInt(formData.get("batch_id") as string);
  const fish_qty_in_location_from: number = parseInt(
    formData.get("fish_qty_in_location_from") as string
  );
  const commercial_fishing_amount: number = parseInt(
    formData.get("commercial_fishing_amount") as string
  );
  const commercial_fishing_total_weight: number = parseFloat(
    formData.get("commercial_fishing_total_weight") as string
  );
  const sorted_fishing_amount: number = parseInt(
    formData.get("sorted_fishing_amount") as string
  );
  const sorted_fishing_total_weight: number = parseFloat(
    formData.get("sorted_fishing_total_weight") as string
  );
  const growout_fishing_amount: number = parseInt(
    formData.get("growout_fishing_amount") as string
  );
  const growout_fishing_total_weight: number = parseFloat(
    formData.get("growout_fishing_total_weight") as string
  );
  const location_id_to: number = parseInt(
    formData.get("location_id") as string
  );
  const more500_fishing_amount: number = parseInt(
    formData.get("more500_fishing_amount") as string
  );
  const more500_fishing_total_weight: number = parseFloat(
    formData.get("more500_fishing_total_weight") as string
  );
  const less500_fishing_amount: number = parseInt(
    formData.get("less500_fishing_amount") as string
  );
  const less500_fishing_total_weight: number = parseFloat(
    formData.get("less500_fishing_total_weight") as string
  );
  const week_num: number = parseFloat(formData.get("week_num") as string);
  const average_fish_mass: number = parseFloat(
    formData.get("average_fish_mass") as string
  );

  const executed_by = 3;
  const comments: string = formData.get("comments") as string;
  const today: string = formData.get("today") as string;

  const fishingData = [
    {
      amount: commercial_fishing_amount,
      total_weight: commercial_fishing_total_weight,
      reason: FetchingReasons.CommercialFishing,
    },
    {
      amount: sorted_fishing_amount,
      total_weight: sorted_fishing_total_weight,
      reason: FetchingReasons.Sorted,
    },
    {
      amount: growout_fishing_amount,
      total_weight: growout_fishing_total_weight,
      reason: FetchingReasons.GrowOut,
    },
    {
      amount: more500_fishing_amount,
      total_weight: more500_fishing_total_weight,
      reason: FetchingReasons.MoreThan500,
    },
    {
      amount: less500_fishing_amount,
      total_weight: less500_fishing_total_weight,
      reason: FetchingReasons.LessThan500,
    },
  ];

  let growoutProcessed = false;

  // Виконання транзакції
  const result = await db.$transaction(
    async (prisma: Prisma.TransactionClient) => {
      try {
        // Створення документа вилову
        console.time("Create fetchDoc");
        const fetchDoc = await prisma.documents.create({
          data: {
            location_id: location_id_from,
            doc_type_id: 13,
            date_time: addCurrentTimeToDate(new Date(today)),
            executed_by: executed_by,
            comments: comments,
          },
        });
        console.timeEnd("Create fetchDoc");

        if (!fetchDoc) {
          throw new Error("Помилка при створенні документа вилову");
        }

        //console.log(`\n документ вилову для ${location_id_from}`, fetchDoc.id);

        for (const { amount, total_weight, reason } of fishingData) {
          if (!amount) continue;

          if (reason === FetchingReasons.GrowOut) {
            // GROWOUT LOGIC
            if (location_id_from === location_id_to) {
              // Only create a withdrawal transaction, stocking doc, and fetching record
              const fetchTran = await prisma.itemtransactions.create({
                data: {
                  doc_id: fetchDoc.id,
                  location_id: location_id_from,
                  batch_id: batch_id_from,
                  quantity: -amount,
                  unit_id: 1,
                },
              });

              // Create a stocking document for the same pool
              const stockDoc = await prisma.documents.create({
                data: {
                  location_id: location_id_from,
                  doc_type_id: 1,
                  date_time: addCurrentTimeToDate(new Date(today)),
                  executed_by: executed_by,
                  parent_document: fetchDoc.id,
                },
              });

              // Create a positive transaction in the new stocking doc
              const stockTran = await prisma.itemtransactions.create({
                data: {
                  doc_id: stockDoc.id,
                  location_id: location_id_from,
                  batch_id: batch_id_from,
                  quantity: amount,
                  unit_id: 1,
                },
              });

              // Set average_weight and form_average_weight from the form
              const avgWeightGrams =
                (growout_fishing_total_weight / growout_fishing_amount) * 1000;
              await prisma.stocking.create({
                data: {
                  doc_id: stockDoc.id,
                  average_weight: Math.round(avgWeightGrams * 1000) / 1000,
                  form_average_weight: Math.round(avgWeightGrams * 1000) / 1000,
                },
              });

              // Create batch_generation for this stocking event
              const prevBatchGen = await prisma.batch_generation.findFirst({
                where: { location_id: location_id_from },
                orderBy: { id: "desc" },
              });
              await prisma.batch_generation.create({
                data: {
                  location_id: location_id_from,
                  initial_batch_id: batch_id_from,
                  first_parent_id: prevBatchGen?.id,
                  transaction_id: stockTran.id,
                },
              });

              // Create a fetching record referencing the withdrawal transaction
              await prisma.fetching.create({
                data: {
                  tran_id: fetchTran.id,
                  fetching_reason: reason,
                  total_weight: total_weight,
                  weekNumber: week_num,
                },
              });

              // Create feeding calculation (calc table)
              formData.set("parent_doc", String(stockDoc.id));
              formData.set("fish_amount", String(amount));
              formData.set("location_id_to", String(location_id_from));
              formData.set(
                "average_fish_mass",
                String(Math.round(avgWeightGrams * 1000) / 1000)
              );
              await createCalcTable(formState, formData, prisma);

              // Set flag to prevent updatePrevPool
              growoutProcessed = true;
              continue;
            } else {
              // GrowOut to a different pool: create both transactions in fetching doc
              // a) Remove from fetching location
              const fetchTran = await prisma.itemtransactions.create({
                data: {
                  doc_id: fetchDoc.id,
                  location_id: location_id_from,
                  batch_id: batch_id_from,
                  quantity: -growout_fishing_amount,
                  unit_id: 1,
                },
              });
              // b) Put to growout location
              const pushTran = await prisma.itemtransactions.create({
                data: {
                  doc_id: fetchDoc.id,
                  location_id: location_id_to,
                  batch_id: batch_id_from,
                  quantity: growout_fishing_amount,
                  unit_id: 1,
                  parent_transaction: fetchTran.id,
                },
              });
              // Create a fetching record referencing the withdrawal transaction
              await prisma.fetching.create({
                data: {
                  tran_id: fetchTran.id,
                  fetching_reason: reason,
                  total_weight: total_weight,
                  weekNumber: week_num,
                },
              });

              // Now create the stocking document for the growout location with both positive and negative transactions
              // Prepare data for stockPool
              const last_stocking = await prisma.itemtransactions.findFirst({
                where: {
                  location_id: location_id_to,
                  documents: {
                    doc_type_id: 1,
                  },
                },
                orderBy: {
                  id: "desc",
                },
              });

              formData.delete("location_id_to");
              formData.set("location_id_to", String(location_id_to));
              formData.set("fish_amount", String(growout_fishing_amount));
              formData.set("batch_id_to", String(last_stocking?.batch_id));
              formData.set(
                "fish_amount_in_location_to",
                String(last_stocking?.quantity)
              );
              formData.delete("average_fish_mass");
              formData.set(
                "average_fish_mass",
                String(growout_fishing_total_weight / growout_fishing_amount)
              );
              // Set form_average_weight for growout stocking
              if (
                growout_fishing_amount &&
                !isNaN(growout_fishing_amount) &&
                growout_fishing_amount !== 0
              ) {
                formData.set(
                  "form_average_weight",
                  String(
                    (growout_fishing_total_weight / growout_fishing_amount) *
                      1000
                  )
                );
              }
              formData.set("parent_document", String(fetchDoc.id));
              formData.set("doc_type_id", "13"); // fetching doc type for growout stocking

              await stockPool(formState, formData, prisma);
              continue;
            }
          }

          // DEFAULT LOGIC for all other reasons (transaction to location 88)
          console.time(`createFishingTransaction - reason: ${reason}`);
          const result = await createFishingTransaction(
            prisma,
            Number(fetchDoc.id),
            location_id_from,
            88,
            batch_id_from,
            amount,
            1,
            reason,
            total_weight,
            week_num
          );
          //console.log("Транзакція успішно завершена:", result);
          //console.timeEnd(`createFishingTransaction - reason: ${reason}`);
        }
        //console.log("find batch generation - line 188");
        //console.time("findFirst prev_generation");
        const prev_generation = await prisma.batch_generation.findFirst({
          where: { location_id: location_id_from },
          orderBy: { id: "desc" },
          take: 1,
        });
        //console.timeEnd("findFirst prev_generation");

        //console.log("prev_generation", prev_generation);

        const first_parent_generation = prev_generation;

        const fetching_quantity = [
          commercial_fishing_amount,
          sorted_fishing_amount,
          growout_fishing_amount,
          more500_fishing_amount,
          less500_fishing_amount,
        ].reduce((acc, qty) => acc + (isNaN(qty) ? 0 : qty), 0);

        //console.log("fetching_quantity", fetching_quantity);

        if (first_parent_generation) {
          //console.log("ми в if (first_parent_generation)");
          //console.time("getFeedAmountsAndNames");
          const grouped_first_ancestor = await getFeedAmountsAndNames(
            first_parent_generation?.id,
            prisma
          );
          //console.timeEnd("getFeedAmountsAndNames");
          //console.log("grouped_first_ancestor", grouped_first_ancestor);

          const NEW_fish_qty_in_location_from =
            fish_qty_in_location_from -
            (isNaN(growout_fishing_amount) ? 0 : growout_fishing_amount);

          //console.log(
          //"stocking_quantity",
          //fetching_quantity,
          //"NEW_fish_qty_in_location_from",
          //NEW_fish_qty_in_location_from
          //);
          const part =
            (fetching_quantity -
              (isNaN(growout_fishing_amount) ? 0 : growout_fishing_amount)) /
            NEW_fish_qty_in_location_from;
          //console.log("переміщаємо :", part, " %");

          //console.time("Promise.all - generation_feed_amount.create");
          await Promise.all(
            grouped_first_ancestor.map(async (record) => {
              const fetch_record = await prisma.generation_feed_amount.create({
                data: {
                  batch_generation_id: record.batch_generation_id,
                  amount: -record.total_amount * part,
                  feed_batch_id: record.feed_batch_id,
                  doc_id: fetchDoc.id,
                },
              });

              //console.log(
              //`витягнули частку зЇдженого: ${fetch_record.feed_batch_id}: ${fetch_record.amount}`
              //);
            })
          );
          //console.timeEnd("Promise.all - generation_feed_amount.create");
        }

        // Update stocking record for the source pool
        const remainingQuantity = fish_qty_in_location_from - fetching_quantity;
        /*
        if (remainingQuantity > 0) {
          // Calculate total weight removed based on all fishing types
          const totalWeightRemoved =
            ((commercial_fishing_amount || 0) *
              (commercial_fishing_total_weight || 0)) /
              (commercial_fishing_amount || 1) +
            ((sorted_fishing_amount || 0) *
              (sorted_fishing_total_weight || 0)) /
              (sorted_fishing_amount || 1) +
            ((growout_fishing_amount || 0) *
              (growout_fishing_total_weight || 0)) /
              (growout_fishing_amount || 1) +
            ((more500_fishing_amount || 0) *
              (more500_fishing_total_weight || 0)) /
              (more500_fishing_amount || 1) +
            ((less500_fishing_amount || 0) *
              (less500_fishing_total_weight || 0)) /
              (less500_fishing_amount || 1);

          // Calculate new average weight for remaining fish
          const remainingTotalWeight =
            fish_qty_in_location_from * average_fish_mass - totalWeightRemoved;
          const newAverageWeight = remainingTotalWeight / remainingQuantity;

          // Create new stocking record for the source pool
          const newStockingDoc = await prisma.documents.create({
            data: {
              location_id: location_id_from,
              doc_type_id: 1, // doc_type_id for stocking
              date_time: new Date(today),
              executed_by: executed_by,
            },
          });

          // Create stocking record
          await prisma.stocking.create({
            data: {
              doc_id: newStockingDoc.id,
              average_weight: newAverageWeight,
            },
          });

          // Create itemtransaction for the new stocking
          await prisma.itemtransactions.create({
            data: {
              doc_id: newStockingDoc.id,
              location_id: location_id_from,
              batch_id: batch_id_from,
              quantity: remainingQuantity,
              unit_id: 1,
            },
          });
        }
*/
        formData.set(
          "fish_amount",
          String(fish_qty_in_location_from - fetching_quantity)
        );
        formData.set("location_id_to", String(location_id_from));
        formData.set("average_fish_mass", String(average_fish_mass));

        //console.log(
        //"СКІЛЬКИ МИ БУДЕМО ВКИДАТИ В СТАРИЙ БАСЕЙН",
        //fish_qty_in_location_from - fetching_quantity
        //);

        // Before calling updatePrevPool, check if GrowOut was already processed
        if (!growoutProcessed) {
          const info: updatePrevPoolProps = {
            formData: formData,
            formState: formState,
            info: {
              amount_in_pool: fish_qty_in_location_from - fetching_quantity,
              divDocId: fetchDoc.id,
            },
            prisma,
          };
          console.time("updatePrevPool");
          await updatePrevPool(info);
          console.timeEnd("updatePrevPool");
        }
      } catch (innerError: any) {
        // console.error('Помилка у транзакції:');
        throw new Error(
          "Щось пішло не так під час виконання транзакції",
          innerError
        ); // Кидаємо помилку для відкату
      }
    },
    { timeout: 20000 }
  );

  //console.log("Операція пройшла успішно");
  revalidatePath("/fetching/view");
  return { message: "Операція завершена успішно" };
}

async function createFishingTransaction(
  prisma: any,
  fetchDocId: number,
  locationFrom: number,
  locationTo: number,
  batchId: number,
  quantity: number,
  unitId: number,
  reason: FetchingReasons,
  totalWeight: number,
  weekNumber: number
) {
  // Створення транзакції списання
  const fetchTran = await prisma.itemtransactions.create({
    data: {
      doc_id: fetchDocId,
      location_id: locationFrom,
      batch_id: batchId,
      quantity: -quantity,
      unit_id: unitId,
    },
  });

  // Створення транзакції поповнення
  const pushTran = await prisma.itemtransactions.create({
    data: {
      doc_id: fetchDocId,
      location_id: locationTo,
      batch_id: batchId,
      quantity: quantity,
      unit_id: unitId,
      parent_transaction: fetchTran.id,
    },
  });

  // Запис про вилов
  const fetching = await prisma.fetching.create({
    data: {
      tran_id: pushTran.id,
      fetching_reason: reason,
      total_weight: totalWeight,
      weekNumber: weekNumber,
    },
  });

  return { fetchTran, pushTran, fetching };
}
