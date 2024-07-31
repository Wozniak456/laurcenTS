'use server'
import { db } from "@/db";
import { redirect } from "next/navigation";

export async function editProdArea(id: number, description: string | null ) {
    await db.productionareas.update({
        where: {id},
        data: {description}
    });
    redirect(`/prod-areas/${id}`)
}