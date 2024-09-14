'use server'

import { db } from "@/db"
import * as actions from "@/actions"
import * as stockingActions from '@/actions/stocking'


//акумуляція по зїдженому корму та ціною корму
export const getTotalAmount = async (generationId : bigint, itemId: number) => {
    const data = await actions.getFeedAmountsAndNames(generationId);

    const amount =  data
      .filter((entry) => entry.item_id === itemId)
      .reduce((total, entry) => total + entry.total_amount, 0);

    const price = data
      .filter((entry) => entry.item_id === itemId && entry.price !== null)
      .reduce((total, entry) => total + (entry.price ?? 0) / 1000 * entry.total_amount, 0);

    return { amount, price };
};

//замінити на calculationForLocation
// export async function getTodayCalculation(location_id : number, today : Date) : Promise<calculationAndFeed> {
//   try{
//     const calculation = await db.calculation_table.findFirst({
//       where:{
//         documents:{
//           location_id: location_id
//         },
//         date: today
//       },
//       orderBy: {
//         id: 'desc'
//       }
//     })
  
//     let feed_type
//     let item
    
//     if (calculation){
//       feed_type = await getFeedType(calculation.fish_weight)
  
//       if (feed_type){
//         item = await getItemPerType(feed_type.id, location_id)
//       }
//     }

//     return {
//       calculation: calculation,
//       feed: {
//         type_id: feed_type?.id,
//         type_name: feed_type?.name,
//         item_id: item?.item_id,
//         definedPrio: item?.definedPrio
//       }
//     }

//   }
//   catch(error){
//     console.error("Error fetching batch data:", error);
//     return {
//       calculation: null,
//       feed: undefined
//   };
//   }
  
// }

const getLocationSummary = (async (location_id: number, today: Date) => {
  const todayCalc = await stockingActions.calculationForLocation(location_id, today.toISOString().split("T")[0]) 
  const prevCalc = await stockingActions.getPrevCalc(location_id, todayCalc);
  return {todayCalc, prevCalc}
})

type LocationSummary = {
  uniqueItemId: number;
  totalFeed: number;
};

type locationForFeedWeight = {
  id: number;
  pools: {
      id: number;
      locations: {
          id: number;
          name: string;
      }[];
  }[];
}[]

export const getAllSummary = async (lines: locationForFeedWeight, today: Date) => {
  const locationSummary: { [itemId: number]: LocationSummary } = {};

  await Promise.all(
    lines.map(async line => {
      await Promise.all(
        line.pools.map(async pool => {
          await Promise.all(
            pool.locations.map(async loc => {

              const isPoolFilled = await isFilled(loc.id)

              if (isPoolFilled == true){
                  const { todayCalc, prevCalc } = await getLocationSummary(loc.id, today);

              // Обробка todayCalc
              if (todayCalc && todayCalc.feed && todayCalc.calc && todayCalc.feed.item_id) {
                  const itemId = todayCalc.feed.item_id;
                  let feedPerFeeding = todayCalc.calc.feed_per_feeding;
                  
                  // let feedingEdited

                  if(todayCalc.calc.transition_day){
                      feedPerFeeding = feedPerFeeding * (1 - todayCalc.calc.transition_day * 0.2)
                  }

                  if (!locationSummary[itemId]) {
                      locationSummary[itemId] = {
                      totalFeed: feedPerFeeding,
                      uniqueItemId: itemId,
                      };
                      // console.log(`Додаємо ${feedPerFeeding} до корму: ${itemId}`)
                  } else {
                      locationSummary[itemId].totalFeed += feedPerFeeding;
                      // console.log(`Додаємо ${feedPerFeeding} до корму: ${itemId}`)
                  }
              }

              // Обробка prevCalc
              if (prevCalc && prevCalc.feed && prevCalc.calc && prevCalc.feed.item_id && todayCalc && todayCalc.feed && todayCalc.calc) {
                  const itemId = prevCalc.feed.item_id;
                  let feedPerFeeding = todayCalc.calc.feed_per_feeding;

                  if(todayCalc.calc.transition_day){
                      feedPerFeeding = feedPerFeeding * (todayCalc.calc.transition_day * 0.2)
                  }
                  
                  if (todayCalc.calc.transition_day){
                      if (!locationSummary[itemId]) {
                          locationSummary[itemId] = {
                          totalFeed: feedPerFeeding,
                          uniqueItemId: itemId,
                          };
                      } else {
                          locationSummary[itemId].totalFeed += feedPerFeeding;
                      }
                  }
              }
              }
            })
          );
        })
      );
    })
  );

  console.log('locationSummary', locationSummary)

  return locationSummary;
};

// басейн заповнений?
export const isFilled = async (location_id : number)  => {
  const lastStocking = await db.itemtransactions.findFirst({
      where:{
          documents:{
              doc_type_id: 1 //зариблення
          },
          location_id: location_id,
      },
      orderBy:{
          id: 'desc'
      },
      take: 1
  })

  if (lastStocking && lastStocking?.quantity > 0){
      return true
  }else{
      return false
  }
}