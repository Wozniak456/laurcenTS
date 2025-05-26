"use server";
import { db } from "@/db";
import {
  createCalcBelow25,
  createCalcOver25,
  setTransitionDayForLocation,
  poolInfo,
} from "@/actions/stocking";

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

export async function createCalcTable(
  formState: { message: string } | undefined,
  formData: FormData,
  prisma?: any
) {
  const activeDb = prisma || db;
  try {
    console.log("Ми в createCalcTable");
    console.log(formData);
    const location_id_to: number = parseInt(
      formData.get("location_id_to") as string
    );
    const parent_doc: number = parseInt(formData.get("parent_doc") as string);
    const today: string = formData.get("today") as string;

    const pool = await poolInfo(location_id_to, today);
    const fish_amount: number = pool?.qty || 0;
    const average_fish_mass: number = parseFloat(
      formData.get("average_fish_mass") as string
    );
    const percentage = 0; //number = parseFloat(formData.get('percentage') as string);

    console.log("до звернення до бд");

    // документ створення калькуляції
    const document_for_location_to = await activeDb.documents.create({
      data: {
        doc_type_id: 7, //просто виклик калькуляції
        date_time: addCurrentTimeToDate(new Date(today)),
        location_id: location_id_to,
        executed_by: 3,
        parent_document: parent_doc,
      },
    });

    console.log("після звернення до бд");

    if (!document_for_location_to) {
      throw new Error("Помилка при створенні документа калькуляції");
    }

    console.log(
      "створено документ з doc_type_id: 7",
      document_for_location_to.id
    );

    const doc_id = document_for_location_to.id;

    if (average_fish_mass < 25) {
      await createCalcBelow25(
        fish_amount,
        average_fish_mass,
        percentage,
        doc_id,
        today,
        prisma
      );
      await setTransitionDayForLocation(location_id_to, prisma);
    } else {
      await createCalcOver25(
        fish_amount,
        average_fish_mass,
        percentage,
        doc_id,
        today,
        prisma
      );
      await setTransitionDayForLocation(location_id_to, prisma);
    }
  } catch (err: unknown) {
    return { message: "Усі поля мають бути заповнені числами!" };
  }
}
