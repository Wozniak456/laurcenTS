"use server";
import { db } from "@/db";
import { createCalcTable } from "./createCalcTable";

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

export async function updatePrevPool({
  info,
  formData,
  formState,
  prisma,
}: updatePrevPoolProps) {
  const activeDb = prisma || db;

  console.log("оновлюємо попередній басейн");
  const location_id: number = parseInt(
    formData.get("location_id_from") as string
  );
  const batch_id: number = parseInt(formData.get("batch_id") as string);
  const av_weight: number = parseFloat(
    formData.get("old_average_fish_mass") as string
  );
  const today: string = formData.get("today") as string;

  //створити документ зариблення залишком
  const stockDoc = await activeDb.documents.create({
    data: {
      location_id: location_id,
      doc_type_id: 1,
      date_time: addCurrentTimeToDate(new Date(today)),
      executed_by: 3,
      parent_document: info.divDocId,
    },
  });
  console.log("документ зариблення залишком", stockDoc);

  //транзакція витягування що там є за документом розподілу
  const fetchTran = await activeDb.itemtransactions.create({
    data: {
      doc_id: stockDoc.id,
      location_id: location_id,
      batch_id: batch_id,
      quantity: -info.amount_in_pool,
      unit_id: 1,
    },
  });
  console.log(
    "транзакція витягування що там є за документом розподілу",
    fetchTran
  );

  //транзакція зариблення тої ж кількості за документом зариблення
  const stockTran = await activeDb.itemtransactions.create({
    data: {
      doc_id: stockDoc.id,
      location_id: location_id,
      batch_id: batch_id,
      quantity: info.amount_in_pool,
      unit_id: 1,
    },
  });
  console.log(
    "транзакція зариблення тої ж кількості за документом зариблення",
    stockTran
  );

  // створення batch_generation для цієї операції
  // знайти попередній batch_generation для цієї локації
  const prevBatchGen = await activeDb.batch_generation.findFirst({
    where: {
      location_id: location_id,
    },
    orderBy: { id: "desc" },
  });

  const newBatchGen = await activeDb.batch_generation.create({
    data: {
      location_id: location_id,
      initial_batch_id: batch_id,
      first_parent_id: prevBatchGen?.id,
      transaction_id: stockTran.id,
    },
  });
  console.log("створено batch_generation", newBatchGen);

  //створення запису в stocking
  console.log("av_weight", av_weight);
  const stocking = await activeDb.stocking.create({
    data: {
      doc_id: stockDoc.id,
      average_weight: av_weight,
    },
  });
  console.log("створення запису в stocking", stocking);

  //створення калькуляції
  formData.set("parent_doc", String(stockDoc.id));
  formData.set("fish_amount", String(info.amount_in_pool));
  formData.set("location_id_to", String(location_id));

  console.log("МИ ОНОВИЛИ fish_amount", info.amount_in_pool);

  formData.delete(`average_fish_mass`);
  formData.delete(`old_average_fish_mass`);

  formData.set("average_fish_mass", String(av_weight)); // новий басейн

  return await createCalcTable(formState, formData, prisma);
}
