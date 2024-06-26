import { db } from "@/db";
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
                        

                        <td className="px-4 py-2 border border-gray-400 text-center">{poolInfo.batchName}</td>
                        <td className="px-4 py-2 border border-gray-400 text-center">{poolInfo.qty}</td> 

                        <td className="px-4 py-2 border border-gray-400 text-center">{poolInfo.fish_weight && poolInfo.fish_weight.toFixed(1)}</td>

                        <td className="px-4 py-2 border border-gray-400 text-center">{poolInfo.feed_type_id}</td>
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
  const feed_connection = await db.feedtypes.findFirst({
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
  return feed_connection?.name
}

async function calculationForLocation(location_id : number, date: string){
  
  const lastStockingRecord = await db.documents.findFirst({
    select:{
      stocking: {
        select:{
          average_weight: true
        }
      },
      itemtransactions: {
        select:{
          quantity: true,
          itembatches:{
            select:{
              name: true
            }
          }
        },
        where:{
          quantity:{
            gte: 0
          }
        }
      }
    },
    where:{
      location_id: location_id,
      doc_type_id: 1,
    },
    orderBy:{
      id: "desc"
    },
    take: 1
  })

  let feed_type_id
  if (lastStockingRecord?.stocking[0].average_weight){
    feed_type_id = await getFeedType(lastStockingRecord?.stocking[0].average_weight)
  }
  
  const batchName = lastStockingRecord?.itemtransactions[0].itembatches.name
  const qty = lastStockingRecord?.itemtransactions[0].quantity
  const fish_weight = lastStockingRecord?.stocking[0].average_weight

  return{batchName, qty, fish_weight, feed_type_id}
  
}

