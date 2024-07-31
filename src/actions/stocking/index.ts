'use server'
import { db } from "@/db";
import { calculation_table } from "@prisma/client";
import * as actions from '@/actions'
import { calculationAndFeed } from "@/types/app_types";

export async function calculationForLocation(location_id : number, date: string){

  let batch = null
  let calc = null
  let feed_type
  let item
  
  calc = await db.calculation_table.findFirst({
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
    feed_type = await getFeedType(calc.fish_weight)

    if (feed_type){
      item = await actions.getItemPerType(feed_type.id, location_id)
    }
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
      allowedToEdit = true
    }
  }

  const feed = {
    type_id: feed_type?.id,
    type_name: feed_type?.name,
    item_id: item?.item_id,
    definedPrio: item?.definedPrio
  }

  return{batch, calc, feed, location_id, allowedToEdit}
}

export const poolInfo = async (location_id: number, date: string) => {
  const dateValue = new Date(date)
  dateValue.setHours(23, 59, 59, 999);

  const lastStocking = await db.documents.findFirst({
      select:{
          date_time: true,
          stocking:{
              select:{
                  average_weight: true
              }
          },
          itemtransactions:{
              select:{
                  itembatches:{
                      select:{
                        id: true,
                        name: true
                      }
                  },
                  quantity: true,
                  parent_transaction: true
              },
              where:{
                  quantity:{
                      gte: 0
                  }
              }
          },
      },
      where:{
          location_id: location_id,
          doc_type_id: 1,
          date_time:{
              lte: dateValue
          }
      },
      orderBy:{
          id: 'desc'
      },
      take: 1
  })

  let feedType

  if (lastStocking){
      feedType = await getFeedType(lastStocking?.stocking[0].average_weight)
  }

  const batch = lastStocking?.itemtransactions[0].itembatches
  const qty = lastStocking?.itemtransactions[0].quantity
  const fishWeight = lastStocking?.stocking[0].average_weight
  const updateDate = lastStocking?.date_time.toISOString().split("T")[0];

  let allowedToEdit = false

  if (lastStocking?.itemtransactions[0].parent_transaction){
    const connectedTran = await db.itemtransactions.findFirst({
      where:{
        id: lastStocking?.itemtransactions[0].parent_transaction
      }
    })

    if(connectedTran?.location_id == 87){
      allowedToEdit = true
    }
  }
  
  return({batch, qty, fishWeight, feedType, updateDate, allowedToEdit})
}

//встановлюємо перехід на новий корм
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
  
export async function getFeedType(fish_weight : number | undefined) {
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

  return result
}

//можливо обєднати stockingInfo і getBatchesInfo

export async function createCalcBelow25(fishAmount: number, averageFishMass: number, percentage: number, docId: bigint) {
    
  const numberOfRecords = 10;
  const day = Array.from({ length: numberOfRecords }, (_, i) => i + 1);

  const date = Array.from({ length: numberOfRecords }, (_, i) => {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + i);
      return currentDate;
  });

  const fishAmountInPool = Array(numberOfRecords).fill(fishAmount);

  let generalWeight = Array(numberOfRecords).fill(0.0);
  let fishWeight = Array(numberOfRecords).fill(0.0);
  let feedQuantity = Array(numberOfRecords).fill(0.0);
  let vC = Array(numberOfRecords).fill(0.0);
  let totalWeight = Array(numberOfRecords).fill(0.0);
  let weightPerFish = Array(numberOfRecords).fill(0.0);
  let feedToday = Array(numberOfRecords).fill(0);
  let feedPerDay = Array(numberOfRecords).fill(0.0);
  let feedPerFeeding = Array(numberOfRecords).fill(0.0);

  generalWeight[0] = fishAmount * averageFishMass;
  fishWeight[0] = generalWeight[0] / fishAmountInPool[0];

  for (let i = 0; i < day.length - 1; i++) {
      const fcQuery = await db.datatable_below25.findFirst({
          where: {
              weight: {
                  lte: fishWeight[i],
              },
          },
          orderBy: {
              weight: 'desc',
          },
      });

      if (fcQuery) {
          vC[i] = fcQuery.fc;
          totalWeight[i] = generalWeight[i] + feedQuantity[i] / vC[i];
          weightPerFish[i] = totalWeight[i] / fishAmountInPool[i];

          const feedingLevelQuery = await db.datatable_below25.findFirst({
              where: {
                  weight: {
                      lte: weightPerFish[i],
                  },
              },
              orderBy: {
                  weight: 'desc',
              },
          });

          if (feedingLevelQuery) {
              feedToday[i] = (feedingLevelQuery.feedingLevel / 100) * totalWeight[i];
              feedPerDay[i] = feedToday[i] + (percentage * feedToday[i]);
              feedPerFeeding[i] = feedPerDay[i] / 5;
              generalWeight[i + 1] = totalWeight[i];
              fishWeight[i + 1] = weightPerFish[i];
              feedQuantity[i + 1] = feedPerDay[i];
          }
      }
  }

  const fcQuery = await db.datatable_below25.findFirst({
      where: {
          weight: {
              lte: fishWeight[fishWeight.length - 1],
          },
      },
      orderBy: {
          weight: 'desc',
      },
  });

  if (fcQuery) {
      vC[vC.length - 1] = fcQuery.fc;
      totalWeight[totalWeight.length - 1] = generalWeight[generalWeight.length - 1] + feedQuantity[feedQuantity.length - 1] / vC[vC.length - 1];
      weightPerFish[weightPerFish.length - 1] = totalWeight[totalWeight.length - 1] / fishAmountInPool[fishAmountInPool.length - 1];

      const feedingLevelQuery = await db.datatable_below25.findFirst({
          where: {
              weight: {
                  lte: weightPerFish[weightPerFish.length - 1],
              },
          },
          orderBy: {
              weight: 'desc',
          },
      });

      if (feedingLevelQuery) {
          feedToday[feedToday.length - 1] = (feedingLevelQuery.feedingLevel / 100) * totalWeight[totalWeight.length - 1];
          feedPerDay[feedPerDay.length - 1] = feedToday[feedToday.length - 1] + (percentage * feedToday[feedToday.length - 1]);
          feedPerFeeding[feedPerFeeding.length - 1] = feedPerDay[feedPerDay.length - 1] / 5;
      }
  }
  let dataForTable: calculation_table[] = []
  for (let i = 0; i < day.length; i++) {
      const record = await db.calculation_table.create({
          data: {
              day: day[i],
              date: date[i],
              fish_amount_in_pool: fishAmountInPool[i],
              general_weight: generalWeight[i],
              fish_weight: fishWeight[i],
              feed_quantity: feedQuantity[i],
              v_c: vC[i],
              total_weight: totalWeight[i],
              weight_per_fish: weightPerFish[i],
              feed_today: feedToday[i],
              feed_per_day: feedPerDay[i],
              feed_per_feeding: feedPerFeeding[i],
              doc_id: docId
          },
      }); 
      dataForTable.push(record)
  }
  try {
      return dataForTable
  } catch (error) {
      console.error('Error creating calculation table:', error);
      throw new Error('Error creating calculation table');
  }
}

export async function createCalcOver25(fishAmount: number, averageFishMass: number, percentage: number, docId: bigint) {
  try {

      const numberOfRecords = 10;
      const day = Array.from({ length: numberOfRecords }, (_, i) => i + 1);

      const date = Array.from({ length: numberOfRecords }, (_, i) => {
          const currentDate = new Date();
          currentDate.setDate(currentDate.getDate() + i + 1);
          return currentDate;
      });

      const fishAmountInPool = Array(numberOfRecords).fill(fishAmount);

      let generalWeight = Array(numberOfRecords).fill(0.0);
      let fishWeight = Array(numberOfRecords).fill(0.0);
      let feedQuantity = Array(numberOfRecords).fill(0.0);
      let fcr = Array(numberOfRecords).fill(0.0);
      let gesch_bezetting = Array(numberOfRecords).fill(0.0);
      let gesch_gewicht = Array(numberOfRecords).fill(0.0);
      let feedPerDay = Array(numberOfRecords).fill(0.0);
      let feedPerFeeding = Array(numberOfRecords).fill(0.0);

      
      let gesch_uitval : number[] = [
          1.0000, 1.0000, 0.9903, 0.9846, 0.9806, 0.9775, 0.9749, 0.9728, 0.9709, 0.9692
      ];

      generalWeight[0] = fishAmount * averageFishMass / 1000;

      let feedQuery
      for (let i = 0; i < day.length; i++) {

          fishWeight[i] = generalWeight[i]/fishAmountInPool[i] * 1000

          const fcrQuery = await db.datatable_over25.findFirst({
              where: {
                  av_weight: {
                      lte: fishWeight[i],
                  },
              },
              orderBy: {
                  weight: 'desc',
              },
          });

          fcr[i] = fcrQuery?.voederconversie 

          gesch_bezetting[i] = generalWeight[i] + feedQuantity[i] / fcr[i]

          generalWeight[i + 1] =  gesch_bezetting[i]

          gesch_gewicht[i] = gesch_bezetting[i] / ((100 - gesch_uitval[i])/100*fishAmountInPool[i])*1000

          feedQuery = await db.datatable_over25.findFirst({
              where: {
                  av_weight: {
                      lte: gesch_gewicht[i],
                  },
              },
              orderBy: {
                  weight: 'desc',
              },
          });

          if (feedQuery){
              feedPerDay[i] = feedQuery?.voederniveau / 100 * gesch_bezetting[i] / 1.11
              feedPerFeeding[i] = feedPerDay[i] / 5
              feedQuantity[i + 1] = feedPerDay[i]
          }
          
      }    

      for (let i = 0; i < day.length; i++) {
          const record = await db.calculation_table.create({
              data: {
                  day: day[i],
                  date: date[i],
                  fish_amount_in_pool: fishAmountInPool[i],
                  general_weight: generalWeight[i],
                  fish_weight: fishWeight[i],
                  feed_quantity: feedQuantity[i],
                  feed_per_day: feedPerDay[i] * 1000,
                  feed_per_feeding: feedPerFeeding[i] * 1000,
                  doc_id: docId
              },
          }); 
      }
  } catch (error) {
      throw new Error('Error creating calculation table');
  }
}

//отримання калькуляції до попереднього корму
export async function getPrevCalc(location_id : number, calc : calculationAndFeed | null) {
  const records14 = await get14CalculationForPool(location_id)

  if (calc !== null){
    let index = records14.findIndex(record => record.id === calc.calc?.id)

    while(true){
      if( index <= 0){
        return null
      }
      
      if ( records14[index - 1].transition_day === null){

        const feed_type = await getFeedType(records14[index - 1].fish_weight)

        let item
        
        if (feed_type){
          item = await actions.getItemPerType(feed_type.id, location_id)
        }
         
        return {
          calc: records14[index - 1],
          feed: {
            type_id: feed_type?.id,
            type_name: feed_type?.name,
            item_id: item?.item_id,
            definedPrio: item?.definedPrio
          }
        }
      }

      index--
    }
  }
}