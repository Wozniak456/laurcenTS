'use server'
import { db } from "@/db";

export async function getCatfishBatches(
){
    try{
        const catfishType = process.env.itemTypeCatfish

        if (!catfishType){
            console.log('process.env.itemTypeCatfish not set')
            throw new Error('process.env.itemTypeCatfish not set')
        }

        const batches = await db.itembatches.findMany({
          select:{
            id: true, 
            name: true,
            items: {
              select:{
                id: true, 
                name: true
              }
            }
          },
          where:{
            items:{
              item_type_id: parseInt(catfishType)
            }
          }
        })

        console.log(typeof(batches))

        return batches

    }catch (err){
        console.log(`error: ${err}`)
        return [];
    }
}