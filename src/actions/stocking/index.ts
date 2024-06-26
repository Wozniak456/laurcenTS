'use server'
import { db } from "@/db";
import { calculation_table } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function calculationForLocation(location_id : number, date: string){

  let batch = null
  let calc = null
  let feed_type_id = null
  
  calc = await db.calculation_table.findFirst({
    select:{
      fish_weight: true
    },
    where:{
      documents:{
        location_id: location_id
      },
      date: new Date(date)
    },
    orderBy:{
      id: 'desc'
    },
    take: 1
  })

  //приймаємо рішення чи показуватимемо кнопку редагування на /feeding/view

  if(calc){
    batch = await getBatchesInfo(location_id)
    const feed_type = await getFeedType(calc.fish_weight)
    feed_type_id = feed_type?.id
  }

  const lastTran = await db.itemtransactions.findFirst({
    where:{
      documents:{
        location_id: location_id
      },
      batch_id: batch?.batch_id
    },
    orderBy:{
      id: 'desc'
    },
    take: 1
  })

  let allowedToEdit = false

  if (lastTran?.parent_transaction){
    const connectedTran = await db.itemtransactions.findFirst({
      where:{
        id: lastTran.parent_transaction
      }
    })

    if(connectedTran?.location_id == 87){
      console.log(location_id,' можна редагувати')
      allowedToEdit = true
    }
  }


  return{batch, calc, feed_type_id, location_id, allowedToEdit}
}


export async function setTransitionDayForLocation(location_id: number){
    
    const records = await get14CalculationForPool(location_id)
    
    if (records){
      let currType = await getFeedType(records[0].fish_weight)
      let dayIndex = 0

      for (let i = 1; i < records.length; i++) {

        if (dayIndex > 0 && dayIndex <= 4){
          await db.calculation_table.update({
            where:{
              id: records[i].id
            },
            data:{
              transition_day: dayIndex
            }
          })

          dayIndex ++
          continue;
        }

        const feedType = await getFeedType(records[i].fish_weight);
        
        if (feedType?.id !== currType?.id){
            currType = feedType

            await db.calculation_table.update({
              where:{
                id: records[i].id
              },
              data:{
                transition_day: 1
              }
            })
            
            dayIndex = 2 // індекс наступного дня
        }
        
      }
  }  
}
  
async function getFeedType(fish_weight : number | undefined) {
    if(fish_weight !== undefined){
      
      const startFeedType = await db.feedtypes.findFirst({
        where:{
          feedconnections:{
            from_fish_weight:{
              lte: fish_weight
            },
            to_fish_weight:{
              gte: fish_weight
            }
          }
          
        }
      })
      return startFeedType
    }
}
  
export async function get14CalculationForPool(location_id : number) {
    const calc_table_ids = await db.calculation_table.groupBy({
      by: ['date'],
      _max: {
        id: true,
      },
      where:{
        documents:{
          location_id: location_id
        }
      },
      orderBy:{
        date: 'asc'
      },
      take: 14
    });
  
    const calc_table14 = await db.calculation_table.findMany({
      where:{
        id: {
          in: calc_table_ids.map(record => Number(record._max.id))
        }
      },
      orderBy:{
        id: 'asc'
      }
    }) 
  
    return calc_table14
}


export async function getBatchesInfo(location_id : number){

  const batch  = await db.itemtransactions.findFirst({
    include:{
      itembatches: true
    },
    where:{
      location_id : location_id,
      documents:{
        doc_type_id: 1
      }
    },
    orderBy:{
      id: 'desc'
    }
  });
  

  const result = {
    batch_name: batch?.itembatches.name,
    batch_id: batch?.batch_id,
    qty: batch?.quantity as number
  }

  // console.log(result)

  return result
}