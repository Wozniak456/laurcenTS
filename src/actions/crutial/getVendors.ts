'use server'
import { db } from "@/db";

export async function getVendors(
){
    try{
        return await db.vendors.findMany({
            select: {
              id: true,
              name: true,
              items: {
                select: {
                  id: true,
                  feedtypes: {
                    select: {
                      name: true,
                      feedconnections: {
                        select: {
                          from_fish_weight: true,
                          to_fish_weight: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });

    }catch (err){
        console.log(`error: ${err}`)
        return [];
    }
}