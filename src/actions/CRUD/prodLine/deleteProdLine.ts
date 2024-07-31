'use server'
import { db } from "@/db";
import { redirect } from "next/navigation";

export async function deleteProdLine(id: number) {
    await db.productionlines.delete({
        where: {id}
    });
    redirect('/prod-lines/view')
}