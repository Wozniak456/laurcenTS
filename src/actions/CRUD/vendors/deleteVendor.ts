'use server'
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteVendor(id: number) {

    await db.items.deleteMany({
        where:{
            vendor_id: id
        }
    })

    await db.vendors.delete({
        where: {id}
    });

    revalidatePath('/vendors/view')
    revalidatePath('/purchtable/view')
    revalidatePath('/accumulation/view')
    redirect(`/vendors/view`)
}