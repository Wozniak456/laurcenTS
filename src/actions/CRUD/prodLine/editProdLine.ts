'use server'
import { db } from "@/db";
import { redirect } from "next/navigation";

export async function editProdLine(id: number, description: string | null ) {
    await db.productionlines.update({
        where: {id},
        data: {description}
    });
    redirect(`/prod-lines/${id}`)
}