'use server'
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteItem(id: number) {

    await db.items.delete({
        where: {id}
    });

    revalidatePath('/vendors/view')
    redirect(`/vendors/view`)
}