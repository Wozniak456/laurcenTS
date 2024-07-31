'use server'
import { db } from "@/db";

export const isFilled = async (location_id : number)  => {
    const lastStocking = await db.itemtransactions.findFirst({
        where:{
            documents:{
                doc_type_id: 1 //зариблення
            },
            location_id: location_id,
        },
        orderBy:{
            id: 'desc'
        },
        take: 1
    })

    if (lastStocking && lastStocking?.quantity > 0){
        return true
    }else{
        return false
    }
}