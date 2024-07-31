'use server'
import { db } from "@/db";
import { redirect } from "next/navigation";

export async function deletePurchLine(id: number) {
    console.log(id)
    await db.purchaselines.delete({
        where: { id }
    });
    redirect(`/purchtable/view`);
}

