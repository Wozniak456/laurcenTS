'use server'
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteItem(id: number) {

    await db.items.delete({
        where: {id}
    });

    revalidatePath('/vendors/view')
    revalidatePath('/summary-feeding-table/week')
    revalidatePath('/purchtable/view')
    revalidatePath('/accumulation/view')
    redirect(`/vendors/view`)
}