import { db } from "@/db";
import * as actions from "@/actions"
import React from "react";
import DaySummaryContent from "@/components/day-summary"
import { Line, CalcTable } from "@/components/day-summary";

export default async function DaySummary() {   
    // const calc_tabledb = await db.calculation_table.findMany({
    //     select: {
    //         id: true,
    //         date: true,
    //         fish_weight: true,
    //         feed_per_feeding: true,
    //         doc_id: true,
    //         documents: {
    //             include: {
    //             locations: {
    //                 select: {
    //                 id: true,
    //                 name: true,
    //                 pool_id: true
    //                 }
    //             },
    //             },
    //         },
    //     }
    //   });
    

    

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
        locations: pool.locations.map(location => ({
          id: location.id,
          itemtransactions: location.itemtransactions.map(transaction => ({
            id: transaction.id,
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

    const feedDictionary: { [averageWeight: number]: string } = {};

    function getFeedName(average_weight: number){
      const connection = feed_connections.find(connection => {
        return average_weight >= connection.from_fish_weight && average_weight <= connection.to_fish_weight;
      });
      let feed_item
      if (connection){
        feed_item = items.find(item => (
          connection.feed_id === item.id
        ))
      }
      return feed_item ? feed_item.name : "";
    }

    for (const line of lines) {
        for (const pool of line.pools) {
            for (const location of pool.locations) {
                for (const transaction of location.itemtransactions) {
                    for (const stock of transaction.documents.stocking) {
                        const averageWeight = stock.average_weight;
                        if (!(averageWeight in feedDictionary)) {
                            feedDictionary[averageWeight] = getFeedName(averageWeight);
                        }
                    }
                }
            }
        }
    }

      
    return (
        <DaySummaryContent lines={lines_new} times={times} feed_dict={feedDictionary} calc_table={calc_table} />
      );
}
