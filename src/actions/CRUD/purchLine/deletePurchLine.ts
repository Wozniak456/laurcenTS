'use server'
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deletePurchLine(id: number) {
    console.log(id)
    await db.purchaselines.delete({
        where: { id }
    });
    revalidatePath('/purchtable/view')
    redirect(`/purchtable/view`);
}

