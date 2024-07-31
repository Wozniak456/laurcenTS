'use server'
import { db } from "@/db";

export async function getAllItemsForFeedType(feed_type_id : number){
    const items = await db.items.findMany({
        where:{
            feed_type_id: feed_type_id
        }
    })

    return(
        items.map(item => {
            return({
                item_id: item.id,
                item_name: item.name
            })
        })
    )
}