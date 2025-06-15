"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deletePurchLine(id: number) {
  //console.log(id);
  const result = await db.$transaction(async (prisma) => {
    try {
      await prisma.purchaselines.delete({
        where: { id },
      });
    } catch (innerError: any) {
      // console.error('Помилка у транзакції:');
      throw new Error(
        `Транзакція не виконана: ${innerError.message || "невідома помилка"}`
      ); // Кидаємо помилку для відкату
    }
  });
  revalidatePath("/purchtable/view");
  redirect(`/purchtable/view`);
}
