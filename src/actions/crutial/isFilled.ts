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
            itemtransactions: { 
                some: { location_id: location_id}
            }
        },
        orderBy: {
            date_time: 'desc'
        }
    })
    const stock = lastStock?.itemtransactions.filter(tran => tran.quantity > 0)
    // console.log(location_id, stock)

    if (stock?.length && stock?.length > 0){
        return true
    }else{
        return false
    }
}