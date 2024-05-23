import { db } from "@/db";
import { Area } from "@/components/accordion"
import React from "react";
import SummaryBatches from "@/components/sum-batches"
import { calculation_table } from "@prisma/client";

export default async function GeneralSummary() {
  const lines = await db.productionlines.findMany({
    include: {
      pools:{
        include:{
          locations:{
            include:{
              itemtransactions: {
                include: {
                  itembatches: true,
                  documents: {
                    include:{
                      calculation_table: true,
                      stocking: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  
  const dateArray = Array.from({ length: 10 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split("T")[0];
  });

  return (
    <div className="flex flex-wrap justify-between mt-4">
      {dateArray.map((date, index) => (
        <table key={index} className="mb-4">
          <thead>
            <tr>
              <th colSpan={5} className="px-4 py-2 border border-gray-400 text-center font-normal whitespace-nowrap text-sm">{date}</th>
            </tr>
            <tr>
              <th className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">Басейн</th>
              <th className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">Партія</th>
              <th className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">К-ть</th>
              <th className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">Вага</th>
              <th className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">Корм</th>
            </tr>
          </thead>
          <tbody>
            {lines.map(line => (
              <React.Fragment key={line.id}>
                <tr>
                  <td colSpan={5} className="px-4 py-2 border border-gray-400 text-center">{line.name}</td>
                </tr>
                {line.pools.map(pool => (
                  pool.locations.map(async loc => {
                    const poolInfo = await calculationForLocation(loc.id, date)

                    return(
                      <tr key={loc.id}>
                        <td className="px-4 py-2 border border-gray-400 text-center">{loc.name}</td>
                        

                        <td className="px-4 py-2 border border-gray-400 text-center">{poolInfo && poolInfo.batch ? poolInfo.batch.batch_name : ""}</td>
                        <td className="px-4 py-2 border border-gray-400 text-center">{poolInfo && poolInfo.batch ? poolInfo.batch.qty : ""}</td> 

                        <td className="px-4 py-2 border border-gray-400 text-center">{poolInfo && poolInfo.calc ? poolInfo.calc.fish_weight.toFixed(1) : ""}</td>

                        <td className="px-4 py-2 border border-gray-400 text-center">{poolInfo && poolInfo.calc ? poolInfo.feed_type_id : ""}</td>
                      </tr>
                    )
                    
                  })
                ))}
                
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ))}
        {/* <SummaryBatches dataDictionary={dataDictionary} date={date} /> */}
    </div>
  );
}

async function getFeedType(fish_weight : number) {
  const feed_connection = await db.feedconnections.findFirst({
    where:{
      from_fish_weight:{
        lte: fish_weight
      },
      to_fish_weight:{
        gte: fish_weight
      }
    }
  })

  if (feed_connection){
    const feed_type = await db.feedtypes.findFirst({
      where:{
        id: feed_connection.feed_type_id
      }
    })
    return feed_type?.name
  }
}

async function calculationForLocation(location_id : number, date: string){

  let batch = null
  let calc = null
  let feed_type_id = null
  
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

  if(calc){
    const batchesInfo = await getBatchesInfo(location_id)
    batch = batchesInfo[0]
    feed_type_id = await getFeedType(calc.fish_weight)
  }

  return{batch, calc, feed_type_id}
  
}

type batch_qty = {
  batch_name: string | undefined,
  qty: number
}

async function getBatchesInfo(location_id : number) : Promise<batch_qty[]>{

  const batches  = await db.itemtransactions.groupBy({
    by: ['batch_id'],
    where:{
      itembatches:{
        items:{
          item_type_id: 1 // риби
        }
      },
      location_id : location_id
    },
    _sum:{
      quantity: true
    },
    having:{
      quantity:{
        _sum:{
          gt: 0
        }
      }
    }
  });

  const result : batch_qty[] = await Promise.all(batches.map(async (batch: any) => {
    const batchInfo = await db.itembatches.findFirst({
      where:{
        id: batch.batch_id
      }
    })
    return(
      { batch_name: batchInfo?.name,
        qty: batch._sum.quantity as number
      })
  }));

  return result
}