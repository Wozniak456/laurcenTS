'use server'
import { db } from "@/db";

export const isFilled = async (location_id : number, date: string)  => {
    const lastStock = await db.documents.findFirst({
        select:{
            itemtransactions:{
                select: {
                    quantity: true
                },
                where:{
                    location_id: location_id
                }
            }
        },
        where:{
            doc_type_id: 1,
            date_time:{
                lte: new Date (date)
            },
            itemtransactions: { some: { location_id: location_id } }
        },
        orderBy: {
            date_time: 'desc'
        }
    })

    if (lastStock?.itemtransactions[0] && lastStock?.itemtransactions[0].quantity > 0){
        return true
    }else{
        return false
    }
}