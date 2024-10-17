'use server'
import { db } from "@/db";

export async function getGenerations(
){
    try{
        return await db.batch_generation.findMany({
            select: {
              id: true,
              location: {
                select: {
                  id: true,
                  name: true,
                },
              },
              itembatches: {
                select: {
                  name: true,
                },
              },
            },
        });

    }catch (err){
        console.log(`error: ${err}`)
        return [];
    }
}