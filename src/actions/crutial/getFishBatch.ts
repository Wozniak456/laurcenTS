'use server'
import { db } from "@/db";

export async function getFishBatch(batch_id: number){
    try{
        const batch = await db.itembatches.findFirst({
            select:{
                id: true,
                name: true,
                created: true,
                items:{
                    select:{
                        id: true,
                        name: true
                    }
                }
            },
            where: { 
                id: batch_id 
            }
        })

        return batch

    }catch (err){
        console.log(`error: ${err}`)
    }
}