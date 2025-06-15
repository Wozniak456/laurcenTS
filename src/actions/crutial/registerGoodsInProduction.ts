"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function combineDateAndTime(datePart: Date, timePart: Date) {
  if (!datePart || !timePart) return Date(); //Check for nulls.

  const combinedDate = new Date(
    datePart.getFullYear(),
    datePart.getMonth(),
    datePart.getDate(),
    timePart.getHours(),
    timePart.getMinutes(),
    timePart.getSeconds(),
    timePart.getMilliseconds()
  );

  return combinedDate;
}

function parseUkrainianDate(dateString: string) {
  const parts = dateString.split(".").map(Number); //split by dots and convert to numbers.
  if (parts.length === 3) {
    const [day, month, year] = parts;
    // Months in JavaScript Date objects are 0-indexed (January is 0)
    return new Date(year, month - 1, day);
  }
  return null; // Handle invalid date strings
}

export async function registerGoodsInProduction(
  formState: { message: string },
  formData: FormData
) {
  //console.log("registerGoodsInProduction", formData);
  try {
    const header_id: number = parseInt(formData.get("header_id") as string);
    const vendor_id: number = parseInt(formData.get("vendor_id") as string);
    const purch_date_string: string = formData.get("purch_date") as string;

    const datePart = parseUkrainianDate(purch_date_string);
    const timePart = new Date();
    const purch_date = combineDateAndTime(
      datePart ? datePart : timePart,
      timePart
    );
    // Виконання транзакції
    const result = await db.$transaction(async (prisma) => {
      try {
        //console.log("Purch date: ", purch_date);
        // Створення документа
        const document = await prisma.documents.create({
          data: {
            location_id: 87, // склад
            doc_type_id: 8, // Реєстрація партії
            executed_by: 3,
            date_time: purch_date,
          },
        });

        //console.log("створився документ", document.id);

        await prisma.purchtable.update({
          where: { id: header_id },
          data: {
            doc_id: document.id,
          },
        });

        //console.log("оновився doc_id");

        const lines = await prisma.purchaselines.findMany({
          select: {
            id: true,
            item_id: true,
            quantity: true,
            unit_id: true,
          },
          where: {
            purchase_id: header_id,
          },
        });

        for (const line of lines) {
          const batch_name_key = `batch_name_${line.id}`;
          const expire_date_key = `expire_date_${line.id}`;
          const packing_key = `packing_${line.id}`;
          const price_key = `price_${line.id}`;

          const batch_name = formData.get(batch_name_key) as string;
          const expire_date = formData.get(expire_date_key) as string;
          const packing: number = parseFloat(
            formData.get(packing_key) as string
          );
          const price: number = parseFloat(formData.get(price_key) as string);

          const batch = await prisma.itembatches.create({
            data: {
              name: batch_name,
              item_id: line.item_id,
              created_by: 3,
              expiration_date: new Date(expire_date),
              packing: packing,
              price: price,
            },
          });

          //console.log("створилась партія", batch.id);

          const transaction = await prisma.itemtransactions.create({
            data: {
              doc_id: document.id,
              location_id: 87, // склад,
              batch_id: batch.id,
              quantity: line.quantity,
              unit_id: line.unit_id,
            },
          });

          //console.log("створилась транзакція", transaction.id);

          await prisma.purchaselines.update({
            where: { id: line.id },
            data: {
              item_transaction_id: transaction.id,
            },
          });

          //console.log("оновився рядок", batch.id);
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
      console.error("Помилка виконання:", err.message);
      return { message: err.message }; // Повертає текст "Транзакція не виконана"
    } else {
      console.error("Невідома помилка:", err);
      return { message: "Щось пішло не так!" };
    }
  }
  revalidatePath("/purchtable/view");
  // revalidatePath('/leftovers/view');
  redirect("/purchtable/view");
}
