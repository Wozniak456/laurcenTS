'use server'
import { db } from "@/db";

export async function getFeedBatches(
){
    try{
        const feedType = process.env.itemTypeFeed

        if (!feedType){
            console.log('process.env.itemTypeFeed not set')
            throw new Error('process.env.itemTypeFeed not set')
        }

        return await db.itembatches.findMany({
            where:{
              items:{
                item_type_id: parseInt(feedType)
              }
            }
        })

    }catch (err){
        console.log(`error: ${err}`)
        return [];
    }
}