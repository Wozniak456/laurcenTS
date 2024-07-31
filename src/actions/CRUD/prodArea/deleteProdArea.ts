'use server'
import { db } from "@/db";
import { redirect } from "next/navigation";

export async function deleteProdArea(id: number) {
    await db.productionareas.delete({
        where: {id}
    });
    redirect('/prod-areas/view')
}