"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { getFeedAmountsAndNames } from "./getFeedAmountsAndNames";
import { updatePrevPool } from "./updatePrevPool";
import { FetchingReasons } from "@/types/fetching-reasons";
import { stockPool } from "@/actions";

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
  console.log("fishFetching");
  console.log(formData);

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

  // Виконання транзакції
  const result = await db.$transaction(
    async (prisma) => {
      try {
        // Створення документа вилову
        const fetchDoc = await prisma.documents.create({
          data: {
            location_id: location_id_from,
            doc_type_id: 13,
            date_time: addCurrentTimeToDate(new Date(today)),
            executed_by: executed_by,
            comments: comments,
          },
        });

        if (!fetchDoc) {
          throw new Error("Помилка при створенні документа вилову");
        }

        console.log(`\n документ вилову для ${location_id_from}`, fetchDoc.id);

        for (const { amount, total_weight, reason } of fishingData) {
          if (amount) {
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
            console.log("Транзакція успішно завершена:", result);
          }
          if (reason === FetchingReasons.GrowOut && amount) {
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

            console.log("last_stocking", last_stocking);

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

            await stockPool(formState, formData, prisma);
          }
        }

        const prev_generation = await prisma.batch_generation.findFirst({
          where: { location_id: location_id_from },
          orderBy: { id: "desc" },
          take: 1,
        });

        console.log("prev_generation", prev_generation);

        const first_parent_generation = prev_generation;

        const fetching_quantity = [
          commercial_fishing_amount,
          sorted_fishing_amount,
          growout_fishing_amount,
          more500_fishing_amount,
          less500_fishing_amount,
        ].reduce((acc, qty) => acc + (isNaN(qty) ? 0 : qty), 0);

        console.log("fetching_quantity", fetching_quantity);

        if (first_parent_generation) {
          console.log("ми в if (first_parent_generation)");
          const grouped_first_ancestor = await getFeedAmountsAndNames(
            first_parent_generation?.id,
            prisma
          );
          console.log("grouped_first_ancestor", grouped_first_ancestor);

          const NEW_fish_qty_in_location_from =
            fish_qty_in_location_from -
            (isNaN(growout_fishing_amount) ? 0 : growout_fishing_amount);

          console.log(
            "stocking_quantity",
            fetching_quantity,
            "NEW_fish_qty_in_location_from",
            NEW_fish_qty_in_location_from
          );
          const part =
            (fetching_quantity -
              (isNaN(growout_fishing_amount) ? 0 : growout_fishing_amount)) /
            NEW_fish_qty_in_location_from;
          console.log("переміщаємо :", part, " %");

          await Promise.all(
            grouped_first_ancestor.map(async (record) => {
              const fetch_record = await prisma.generation_feed_amount.create({
                data: {
                  batch_generation_id: record.batch_generation_id,
                  amount: -record.total_amount * part,
                  feed_batch_id: record.feed_batch_id,
                },
              });

              console.log(
                `витягнули частку зЇдженого: ${fetch_record.feed_batch_id}: ${fetch_record.amount}`
              );
            })
          );
        }

        formData.set(
          "fish_amount",
          String(fish_qty_in_location_from - fetching_quantity)
        );
        formData.set("location_id_to", String(location_id_from));
        formData.set("average_fish_mass", String(average_fish_mass));

        console.log(
          "СКІЛЬКИ МИ БУДЕМО ВКИДАТИ В СТАРИЙ БАСЕЙН",
          fish_qty_in_location_from - fetching_quantity
        );

        const info: updatePrevPoolProps = {
          formData: formData,
          formState: formState,
          info: {
            amount_in_pool: fish_qty_in_location_from - fetching_quantity,
            divDocId: fetchDoc.id,
          },
          prisma,
        };

        await updatePrevPool(info);
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

  console.log("Операція пройшла успішно");
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
