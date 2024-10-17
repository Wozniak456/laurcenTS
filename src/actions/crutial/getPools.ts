'use server'
import { db } from "@/db";

export async function getPools(
){
    try{
        const poolType = process.env.locationTypePool

        if (!poolType){
            console.log('process.env.locationTypePool not set')
            throw new Error('process.env.locationTypePool not set')
        }

        return await db.locations.findMany({
            where:{
              location_type_id: parseInt(poolType)
            }
        })

    }catch (err){
        console.log(`error: ${err}`)
        return [];
    }
}