"use server";

import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { stockPool } from "../crutial/stockPool";
import { getFeedBatchByItemId } from "../crutial/getFeedBatchByItemId";
import { isPoolOperationsAllowed } from "@/utils/poolUtils";

export async function initialStocking(
  formState: { message: string } | undefined,
  formData: FormData
): Promise<{ message: string } | undefined> {
  const today: string = formData.get("today") as string;
  try {
    //console.log("initialStocking");
    //console.log(formData);
    let location_id_from: number = parseInt(
      formData.get("location_id_from") as string
    );

    const location_id_to: number = parseInt(
      formData.get("location_id_to") as string
    );

    const batch_id = formData.get("batch_id") as string;
    const fish_amount_str = formData.get("fish_amount") as string;
    const fish_amount: number = fish_amount_str ? parseInt(fish_amount_str) : 0;
    const average_fish_mass_str = formData.get("average_fish_mass") as string;
    const average_fish_mass: number = average_fish_mass_str
      ? parseInt(average_fish_mass_str)
      : 0;

    const executed_by = 3;

    // Check if pool operations are allowed (no posted operations after this date)
    const operationsCheck = await isPoolOperationsAllowed(
      location_id_to,
      today
    );
    if (!operationsCheck.allowed) {
      return {
        message: `Операція заблокована: ${operationsCheck.reason}`,
      };
    }

    if (!batch_id) {
      await stockPool(formState, formData);
    }

    const feeds = await db.items.findMany({
      where: {
        item_type_id: 3, // корм
      },
    });

    feeds.forEach(async (item) => {
      const feedAmountStr = formData.get(`feed_${item.id}`) as string;
      const feedAmount = feedAmountStr ? parseFloat(feedAmountStr) : 0;

      const props = {
        location_id: location_id_to,
        executed_by: executed_by,
        item_id: item.id,
        qty: feedAmount,
        today: today,
      };

      //console.log("props", props);
      if (feedAmount && feedAmount > 0) await oneFeeding(props);
    });
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
  revalidatePath("/accumulation/view");
}

type feedingProps = {
  location_id: number;
  executed_by: number;
  item_id: number;
  qty: number;
  today: string;
};

async function oneFeeding(props: feedingProps) {
  const date = new Date(props.today);

  // Check if pool operations are allowed for feeding
  const operationsCheck = await isPoolOperationsAllowed(
    props.location_id,
    props.today
  );
  if (!operationsCheck.allowed) {
    throw new Error(`Feeding blocked: ${operationsCheck.reason}`);
  }

  const feedDoc = await db.documents.create({
    data: {
      location_id: props.location_id,
      doc_type_id: 9,
      date_time: date,
      executed_by: props.executed_by,
    },
  });

  const batches_id = await getFeedBatchByItemId(props.item_id, props.qty);

  //console.log("партія корму: ", batches_id);

  let left_to_feed = props.qty / 1000;

  for (const batch of batches_id) {
    if (batch._sum.quantity) {
      if (batch._sum.quantity >= left_to_feed) {
        const fetchTran = await db.itemtransactions.create({
          data: {
            doc_id: feedDoc.id,
            location_id: 87,
            batch_id: batch.batch_id,
            quantity: -left_to_feed,
            unit_id: 2,
          },
        });

        const feedTran = await db.itemtransactions.create({
          data: {
            doc_id: feedDoc.id,
            location_id: props.location_id,
            batch_id: batch.batch_id,
            quantity: left_to_feed,
            unit_id: 2,
          },
        });

        //Знайти останню собівартість і останнє покоління

        const latestGeneration = await db.batch_generation.findFirst({
          include: {
            itemtransactions: true,
          },
          where: {
            location_id: props.location_id,
          },
          orderBy: {
            id: "desc",
          },
          take: 1,
        });

        //console.log("latestGeneration", latestGeneration);

        //console.log(
        // `Витягнули зі складу: ${fetchTran.id} і вкинули в басейн: ${feedTran.id}`
        //);
        // console.log(`Собівартість змінилася, ${cost_record}`)

        left_to_feed = 0;
        break; // Виходимо з циклу, бо всю необхідну кількість взято
      } else {
        // Якщо потрібно використовувати ще одну партію
        const fetchTran = await db.itemtransactions.create({
          data: {
            doc_id: feedDoc.id,
            location_id: 87,
            batch_id: batch.batch_id,
            quantity: -batch._sum.quantity,
            unit_id: 2,
          },
        });

        const feedTran = await db.itemtransactions.create({
          data: {
            doc_id: feedDoc.id,
            location_id: props.location_id,
            batch_id: batch.batch_id,
            quantity: batch._sum.quantity,
            unit_id: 2,
          },
        });

        //console.log(
        //`Витягнули зі складу: ${fetchTran.id} і вкинули в басейн: ${feedTran.id}`
        //);
        left_to_feed -= batch._sum.quantity; // Віднімаємо використану кількість
        //console.log("left_to_feed = ", left_to_feed);
      }
    }
  }

  if (left_to_feed > 0) {
    //console.log(
    //`Не вдалося знайти достатню кількість корму для годування. Залишилося ${left_to_feed}.`
    //);
  }
}
