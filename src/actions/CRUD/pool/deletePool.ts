'use server'
import { db } from "@/db";
import { redirect } from "next/navigation";

export async function deletePool(id: number) {
    await db.locations.deleteMany({
        where: {pool_id : id}
    });
    await db.pools.delete({
        where: {id}
    });
    redirect('/pools/view')
}