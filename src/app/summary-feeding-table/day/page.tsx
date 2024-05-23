import { db } from "@/db";
import * as actions from "@/actions"
import React from "react";
import DaySummaryContent from "@/components/day-summary"
//import { Line, CalcTable, Transaction } from "@/components/day-summary";
import { calculation_table, feedconnections } from "@prisma/client";

interface calculationAndFeedName{
  calculation?: calculation_table | undefined,
  feed? : {
    id?: number,
    name?: string
  }
}

type PoolsAndCalculation = Record<number, calculationAndFeedName>;

export default async function DaySummary() {   
  
  const currentDate: Date = new Date();
  currentDate.setDate(currentDate.getDate());

  const lines = await db.productionlines.findMany({
    include: {
      pools: {
        select:{
          id: true,
          name: true
        }
      }
    }
  });

  const times = await db.time_table.findMany();
  const items = await db.items.findMany({
    where:{
      item_type_id: 3 // корм
    }
  })  

  // let poolsAndCalculation : PoolsAndCalculation = {};
  // let transitionDay: Record<number, number> = {}

  async function getCalcForAllPools() {
    let poolsAndTodayCalculation: PoolsAndCalculation = {};
    let transitionDayForPools: Record<number, number | null> = {}
    let prevCalculation: PoolsAndCalculation = {};
  
    for (const line of lines) {
      for (const pool of line.pools) {
        const tables = await get14CalculationForPool(pool.id);
        const todayTable = tables.find(table => table.date.toISOString().split("T")[0] === currentDate.toISOString().split("T")[0]);
        const feed = await getFeedType(todayTable?.fish_weight);

       

        const transitionDay = await findTransitionDay(tables)
        
        const calculation: calculationAndFeedName = 
          { calculation: todayTable, feed: {id: feed?.feedtypes?.id, name: feed?.feedtypes?.name} }
        
        poolsAndTodayCalculation[pool.id] = calculation;
        if(transitionDay !== null){
          transitionDayForPools[pool.id] = transitionDay
        }
        else{
          transitionDayForPools[pool.id] = null
        }

        
        if(transitionDay !== null){
          
          const dateBeforeTransition = new Date(currentDate);
          dateBeforeTransition.setDate(dateBeforeTransition.getDate() - transitionDay - 1)

          const prevTable = tables.find(table => 
            table.date.toISOString().split("T")[0] === dateBeforeTransition.toISOString().split("T")[0]
          )

          const prevFeed = await getFeedType(prevTable?.fish_weight)

          prevCalculation[pool.id] = {
            calculation: prevTable,
            feed: {
              id: prevFeed?.feedtypes?.id,
              name: prevFeed?.feedtypes?.name
            }
          }
        }
      }
    }
  
    return {poolsAndTodayCalculation, transitionDayForPools, prevCalculation};
  }

 
  const {poolsAndTodayCalculation, transitionDayForPools, prevCalculation } = await getCalcForAllPools();
  
  return (
    <div>
      <h1 className="m-4 font-bold">Сьогодні: {currentDate.toISOString().split("T")[0]}</h1>
      {lines.map(line => (
      <table key={line.id} className="border-collapse border w-full mb-4">
         <thead>
           <tr>
              <th
                colSpan={2 + 3 * times.length}
                className="px-4 py-2 bg-blue-100">
                {line.name}
              </th>
            </tr>
            <tr>
              <th className="border p-2">№ басейну</th>
              <th className="border p-2">Вид корму</th>
              <th className="border p-2">Назва корму</th>
              {times.map((time, index) => (
                <React.Fragment key={index}>
                  <th className="border p-2">{time.time}</th>
                  <th className="border p-2">Коригування</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
        <tbody>
          {line.pools.map( pool => {
            return(
              <DaySummaryContent key={pool.id}
              currentDate={currentDate} 
              pool={pool} 
              todayCalculation={poolsAndTodayCalculation[pool.id]} 
              prevCalculation={prevCalculation[pool.id]} 
              transitionDay={transitionDayForPools[pool.id]} 
              times={times}
              items={items}
              />
            )  
          })}
        </tbody>
      </table>
    ))}
    </div>
    );
}


async function findTransitionDay(calc_table14: calculation_table[]) {
  const today = new Date();
  today.setDate(today.getDate());
  let transition = false

  for (const table of calc_table14) {
    if (table.is_transition_start === true) {
      const transitionDay = Math.floor((today.getTime() - table.date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (transitionDay >= 0 && transitionDay <= 3) {
        
        return transitionDay;
      } 
      transition = true
      break
    }
  }
  //якщо не знайшли встановлений перехід, то перевіряємо весь масив і встановлюємо факт переходу, якщо такий є
  if (!transition){
    const transitionDate = await setTransitionDay(calc_table14);
    if (transitionDate && transitionDate instanceof Date) {
      const transitionDay = Math.floor((today.getTime() - transitionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (transitionDay >= 0 && transitionDay <= 3) {
        return transitionDay;
      } 
    }
  }
  
  return null
}

async function setTransitionDay(calc_table14: calculation_table[]){
  if (calc_table14.length === 0 || !calc_table14[0].fish_weight) {
    return null;
  }

  const startType = await getFeedType(calc_table14[0].fish_weight)
 

  for(const table of calc_table14){
    const currType = await getFeedType(table.fish_weight)
    
    if(currType?.feedtypes?.name !== startType?.feedtypes?.name){

      await db.calculation_table.update({
        where: { id: table.id },
        data: { is_transition_start: true }
      });
      return table.date
    }
  }
  return null
 }

async function getFeedType(fish_weight : number | undefined) {
  if(fish_weight !== undefined){
    
    const startFeedType = await db.feedconnections.findFirst({
      select:{
        feedtypes: {
          select:{
            id: true,
            name: true
          }
        }
      },
      where:{
        from_fish_weight:{
          lte: fish_weight
        },
        to_fish_weight:{
          gte: fish_weight
        }
      }
    })
    return startFeedType
  }
  // return null
  
}

async function get14CalculationForPool(poolid : number) {
  const calc_table_ids = await db.calculation_table.groupBy({
    by: ['date'],
    _max: {
      id: true,
    },
    where:{
      documents:{
        locations:{
          pool_id: poolid
        }
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