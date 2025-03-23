"use server";
import { db } from "@/db";
import {
  createCalcBelow25,
  createCalcOver25,
  setTransitionDayForLocation,
} from "@/actions/stocking";

export async function createCalcTable(
  formState: { message: string } | undefined,
  formData: FormData,
  prisma?: any
) {
  const activeDb = prisma || db;
  try {
    console.log("Ми в createCalcTable");
    console.log(formData);
    const fish_amount: number = parseInt(formData.get("fish_amount") as string); // скільки зариблюємо
    const average_fish_mass: number = parseFloat(
      formData.get("average_fish_mass") as string
    );
    const percentage = 0; //number = parseFloat(formData.get('percentage') as string);
    const location_id_to: number = parseInt(
      formData.get("location_id_to") as string
    );
    const parent_doc: number = parseInt(formData.get("parent_doc") as string);
    const today: string = formData.get("today") as string;

    console.log("до звернення до бд");

    // документ створення калькуляції
    const document_for_location_to = await activeDb.documents.create({
      data: {
        doc_type_id: 7, //просто виклик калькуляції
        date_time: new Date(today),
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
