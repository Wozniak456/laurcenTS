import { db } from "@/db";
import * as actions from "@/actions"
import React from "react";
import DaySummaryContent from "@/components/day-summary"
//import { Line, CalcTable, Transaction } from "@/components/day-summary";
import { calculation_table } from "@prisma/client";
import { table } from "console";

export default async function DaySummary() {   
  const lines = await db.productionlines.findMany({
    include:{
      pools: {
        include:{
          locations:{
            include:{
              itemtransactions:{
                include: {
                  documents: true
                }
              }
            }
          }
        }
      }
    }
  })

  const feed_connections = await db.feedconnections.findMany();

  const items = await db.items.findMany();

  const times = await db.time_table.findMany();

  const poolAnd14Calc : {[poolId: number] : calculation_table[]} = {}

  await Promise.all(lines.map(async (line) => {
    await Promise.all(line.pools.map(async (pool) => {
      await Promise.all(pool.locations.map(async (loc) => {
        const doc_ids = await db.documents.findMany({
          select: {
            id: true
          },
          where: {
            doc_type_id: 7,
            location_id: loc.id
          }
        });
  
        const groupedData = await db.calculation_table.groupBy({
          by: ['date'],
          _max: {
            id: true
          },
          where: {
            doc_id: {
              in: doc_ids.map(id => id.id)
            }
          },
          orderBy: {
            date: 'desc'
          },
          take: 14,
        });

        const calculationIds = groupedData
        .flatMap(data => data._max.id) // Отримати всі значення id та об'єднати їх в один масив
        .filter(id => id !== null) // Видалити всі значення null
        .map(id => id as number); // Привести до типу number

        const calculations = await db.calculation_table.findMany({
          where: {
            id: {
              in: calculationIds // Використовувати тільки ненульові значення id
            }
          }
        });

        poolAnd14Calc[pool.id] = calculations;
      }));
    }));
  }));

  async function processCalculationTables(calculation14Tables: calculation_table[]): Promise<void> {
    const transition_start = calculation14Tables.find(table => table.is_transition_start);
    if (!transition_start){
      let feed = getFeed(calculation14Tables[0]?.fish_weight);
      
      for (let i = 1; i < calculation14Tables.length; i++) {
        const table = calculation14Tables[i];
        if (!table) continue; // Пропустити неіснуючі записи таблиці
        
        const tableFeed = getFeed(table.fish_weight);
        const transition = feed?.name !== tableFeed?.name;
    
        if (transition) {
          // Оновити is_transition_start у першому записі, де відрізняється tableFeed
          await db.calculation_table.update({
            where: { id: table.id },
            data: { is_transition_start: true }
          });
          
          break; // Вийти з циклу після оновлення першого запису
        }
      }
    }    
  }

  function getFeed(average_weight: number | undefined): { id: number, name: string } | null {
    if (average_weight !== undefined){
      const connection = feed_connections.find(connection => {
        return average_weight >= connection.from_fish_weight && average_weight <= connection.to_fish_weight;
      });
  
      if (connection) {
          const feed_item = items.find(item => connection.feed_id === item.id);
          if (feed_item) {
              const nameMatch = feed_item.name?.match(/\b\d*[,\.]?\d+\s*mm\b/);
              const name = nameMatch ? nameMatch[0] : ""; 
              return { id: feed_item.id, name: name };
          }
      }
    }
    return null; 
  }

  Object.entries(poolAnd14Calc).forEach(([key, table]) => {
    processCalculationTables(table);
  });

  const currentDate: Date = new Date();

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
              {times.map((time, index) => (
                <React.Fragment key={index}>
                  <th className="border p-2">{time.time}</th>
                  <th className="border p-2">Коригування</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
        <tbody>
          {line.pools.map(pool => {
            const fish_weight = poolAnd14Calc[pool.id].find(table => table.date.toISOString().split("T")[0] === currentDate.toISOString().split("T")[0])?.fish_weight

            const feed = getFeed(fish_weight)
            return(
              <DaySummaryContent currentDate={currentDate} pool={pool} poolAnd14Calc={poolAnd14Calc[pool.id]} times={times} feed_connections={feed_connections} items={items}/>
            )  
          })}
        </tbody>
      </table>
    ))}
    </div>
    );
}

