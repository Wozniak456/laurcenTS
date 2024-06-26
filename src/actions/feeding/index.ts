'use server'

import { db } from "@/db"
import { calculationAndFeed } from "@/types/app_types"
import * as actions from "@/actions/index"


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


export async function getPrevCalc(location_id : number, calc : calculationAndFeed | null) {
    
    const records14 = await get14CalculationForPool(location_id)

    if (calc !== null){
      let index = records14.findIndex(record => record.id === calc.calculation?.id)
      // console.log('index', index)
  
      while(true){
        if( index <= 0){
          return null
        }
        
        if ( records14[index - 1].transition_day === null){
  
          const feed_type = await getFeedType(records14[index - 1].fish_weight)
  
          let item
          
          if (feed_type){
            item = await getItemPerType(feed_type.id, location_id)
          }
  
          return {
            calculation: records14[index - 1],
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
  
  export async function getTodayCalculation(location_id : number, today : Date) : Promise<calculationAndFeed> {
    try{
      const calculation = await db.calculation_table.findFirst({
        where:{
          documents:{
            location_id: location_id
          },
          date: today
        },
        orderBy: {
          id: 'desc'
        }
      })
    
      let feed_type
      let item
      
      if (calculation){
        feed_type = await getFeedType(calculation.fish_weight)
    
        if (feed_type){
          item = await getItemPerType(feed_type.id, location_id)
        }
      }

      // console.log(location_id, item)
    
      return {
        calculation: calculation,
        feed: {
          type_id: feed_type?.id,
          type_name: feed_type?.name,
          item_id: item?.item_id,
          definedPrio: item?.definedPrio
        }
      }

    }
    catch(error){
      console.error("Error fetching batch data:", error);
      return {
        calculation: null,
        feed: undefined
    };
    }
    
  }
  
  async function getItemPerType(feed_type_id : number, location_id : number) {
    let definedPrio

    const items = await db.items.findMany({
      where:{
        feed_type_id : feed_type_id
      }
    })
  
    //якщо немає колізій, то повертаємо єдиний корм для виду
    if(items.length == 1){
      return{
        item_id: items[0].id,
        definedPrio: true
      }
    }
  
    //якщо колізія є, то обираємо корм
    if (items.length > 1){
      const prio = await db.priorities.findFirst({
        where:{
          location_id: location_id
        },
        orderBy:{
          id: 'desc'
        }
      })
  
      //якщо для басейну обрано корм, повертаємо його
      if (prio){
        return{
          item_id: prio.item_id,
          definedPrio: true
        }
      }
      //якщо для басейну не обрано корм, повертаємо перший елемент
      else{
        return{
          item_id: items[0].id,
          definedPrio: false
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
    // return null
    
  }
  
  async function get14CalculationForPool(location_id : number) {
    // console.log('location_id', location_id)
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