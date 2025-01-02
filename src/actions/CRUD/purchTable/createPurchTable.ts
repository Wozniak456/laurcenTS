"use server";
import { db } from "@/db";
import { redirect } from "next/navigation";
import type { purchtable } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
// import { auth } from '@/auth'
import paths from "@/paths";

interface createPurchTableFormState {
  errors: {
    delivery_date?: string[];
    vendor_id?: string[];
    vendor_doc_number?: string[];
    _form?: string[];
  };
}

export async function createPurchTable(
  formState: createPurchTableFormState,
  formData: FormData
): Promise<createPurchTableFormState> {
  //        try{
  console.log(formData);

  const createdString = formData.get("delivery_date") as string;
  const vendor_id: number = parseInt(formData.get("vendor_id") as string);
  const vendor_doc_number = formData.get("vendor_doc_id") as string;

  const date_time = new Date(createdString);

  // const session = await auth()
  // if(!session || !session.user){
  //     return{
  //         errors:{
  //             _form: ["Для здійснення цієї дії Ви маєте бути авторизовані!"]
  //         }
  //     }
  // }
  const result = await db.$transaction(async (prisma) => {
    try {
      const purchRecord = await prisma.purchtable.create({
        data: {
          date_time,
          vendor_id,
          vendor_doc_number,
        },
      });
    } catch (innerError: any) {
      // console.error('Помилка у транзакції:');
      throw new Error(
        `Транзакція не виконана: ${innerError.message || "невідома помилка"}`
      ); // Кидаємо помилку для відкату
    }
  });

  //        }
  //        catch(err: unknown){
  //            return{errors:{}}
  //        }

  revalidatePath("/purchtable/view");

  redirect("/purchtable/view");
}
