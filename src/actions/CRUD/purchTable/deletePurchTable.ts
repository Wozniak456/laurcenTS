'use server'
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deletePurchTable(id: bigint) {
    await db.purchaselines.deleteMany({
        where:{
            purchase_id: id
        }
    })

    await db.purchtable.delete({
        where: {id}
    });
    revalidatePath('/purchtable/view')
    redirect(`/purchtable/view`)
}