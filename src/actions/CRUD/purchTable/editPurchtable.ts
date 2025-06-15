"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface createPurchTableFormState {
  errors: {
    delivery_date?: string[];
    vendor_id?: string[];
    vendor_doc_number?: string[];
    _form?: string[];
  };
}

export async function editPurchtable(
  formState: createPurchTableFormState,
  formData: FormData
): Promise<createPurchTableFormState> {
  //        try{
  //console.log("editPurchtable", formData);
  const id: number = parseInt(formData.get("header_id") as string);

  const delivery_date_str = formData.get("delivery_date") as string;
  const date_time: Date | undefined = delivery_date_str
    ? new Date(delivery_date_str)
    : undefined;

  const vendor_id: number = parseInt(formData.get("vendor_id") as string);
  const vendor_doc_number = formData.get("vendor_doc_id") as string;

  const result = await db.$transaction(async (prisma) => {
    try {
      const header = await prisma.purchtable.update({
        where: { id },
        data: {
          date_time,
          vendor_id,
          vendor_doc_number,
        },
      });
      //        }
      //        catch(err: unknown){
      //            return{errors:{}}
      //        }
    } catch (innerError: any) {
      // console.error('Помилка у транзакції:');
      throw new Error(
        `Транзакція не виконана: ${innerError.message || "невідома помилка"}`
      ); // Кидаємо помилку для відкату
    }
  });
  revalidatePath("/purchtable/view");
  redirect("/purchtable/view");
}
