import { db } from "@/db";
import * as actions from "@/actions"
import React from "react";
import DaySummaryContent from "@/components/day-summary"
import { Line, CalcTable, Transaction } from "@/components/day-summary";
import { calculation_table } from "@prisma/client";

export default async function DaySummary() {   

    const calc_tabledb = await db.calculation_table.findMany({
      include: {
          documents: {
              include: {
              locations: true
              },
          },
      },
    });

    const calc_table: CalcTable[] = calc_tabledb.map(table => ({
      id: table.id,
      day: table.day,
      date: table.date,
      fish_weight: table.fish_weight,
      feed_per_feeding: table.feed_per_feeding,
      doc_id: table.doc_id,
      documents: {
          id: table.documents.id,
          date_time: table.documents.date_time,
          executed_by: table.documents.executed_by,
          locations: table.documents.locations ? { 
              id: table.documents.locations.id, 
              name: table.documents.locations.name,
              pool_id: table.documents.locations.pool_id || 0
          } : null
      }
  }));
    
    const lines = await db.productionlines.findMany({
        include:{
            pools: {
                include: {
                  locations: {
                    include: {
                      itemtransactions: {
                        include: {
                          itembatches: true,
                          documents: {
                            include:{
                              stocking : true,
                            },
                          }
                        }
                      }
                    }
                  }
                }
              }
        }
    }) 
    const lines_new: Line[] = lines.map(line =>({
      id: line.id,
      name: line.name,
      pools: line.pools.map(pool => ({
        id: pool.id,
        name: pool.name,
        prod_line_id: pool.prod_line_id,
        locations: pool.locations.map(location => ({
          id: location.id,
          itemtransactions: location.itemtransactions.map(transaction => ({
            id: transaction.id,
            doc_id: transaction.doc_id,
            itembatches: {
              id: transaction.itembatches.id,
              name: transaction.itembatches.name
            },
            documents: {
              id: transaction.documents.id,
              stocking: transaction.documents.stocking.map(stock => ({
                id: stock.id,
                average_weight: stock.average_weight
              }))
            }
          }))
        }))
      }))
    }))

    const feed_connections = await db.feedconnections.findMany();
    const times = await db.time_table.findMany();
    const items = await db.items.findMany();

    const poolAnd13Calc : {[poolId: number] : calculation_table[]} = {}

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
            take: 13,
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

        poolAnd13Calc[pool.id] = calculations;
      }));
    }));
  }));

  async function processCalculationTables(calculation13Tables: calculation_table[]): Promise<void> {
    const transition_start = calculation13Tables.find(table => table.is_transition_start);
    if (transition_start) {
      // console.log('Є перехід');
    } else {
      // console.log('Шукаємо перехід');
      
      // Отримати початкове значення feed з першої таблиці
      let feed = getFeed(calculation13Tables[0]?.fish_weight);
      
      for (let i = 1; i < calculation13Tables.length; i++) {
        const table = calculation13Tables[i];
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
  
  function getFeed(average_weight: number): { id: number, name: string } | null {
    const connection = feed_connections.find(connection => {
        return average_weight >= connection.from_fish_weight && average_weight <= connection.to_fish_weight;
    });
  
    if (connection) {
        const feed_item = items.find(item => connection.feed_id === item.id);
        if (feed_item) {
            const nameMatch = feed_item.name?.match(/\b\d*[,\.]?\d+\s*mm\b/);
            const name = nameMatch ? nameMatch[0] : ""; // Extracting feed name
            return { id: feed_item.id, name: name };
        }
    }
    return null; 
  }
  Object.entries(poolAnd13Calc).forEach(([key, table]) => {
    processCalculationTables(table);
  });

  return (
      <DaySummaryContent lines={lines_new} times={times} feed_connections={feed_connections} calc_table={poolAnd13Calc} items={items}/>
    );
}

