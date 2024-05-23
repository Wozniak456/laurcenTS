import { db } from "@/db";
import Link from "next/link";
import StockingComponent from "@/components/stockin111"
import { Area } from "@/components/accordion"

export default async function StockingHome() {
  // const sectionsWithLinesAndPools = await db.productionareas.findMany({
  //   include: {
  //     productionlines: {
  //       include: {
  //         pools: {
  //           include: {
  //             locations: {
  //               include: {
  //                 itemtransactions: {
  //                   include: {
  //                     itembatches: {
  //                       include:{
  //                         items: true
  //                       }
  //                     },
  //                     documents: {
  //                       include:{
  //                         stocking : true,
  //                       },
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // });
  
  // const areas: Area[] = sectionsWithLinesAndPools.map(area =>({
  //   id: area.id,
  //   name: area.name,
  //   lines: area.productionlines.map(line => ({
  //     id: line.id,
  //     name: line.name,
  //     pools: line.pools.map(pool => ({
  //       id: pool.id,
  //       name: pool.name,
  //       prod_line_id: pool.prod_line_id,
  //       locations: pool.locations.map(location => ({
  //         id: location.id,
  //         name: location.name,
  //         pool_id: location.pool_id,
  //         itemtransactions: location.itemtransactions.map(transaction =>({
  //           id: transaction.id,
  //           quantity: transaction.quantity,
  //           doc_id: transaction.doc_id,
  //           itembatches: {
  //             id: transaction.itembatches.id,
  //             name: transaction.itembatches.name,
  //             items: transaction.itembatches.items
  //           },
  //           documents: {
  //             id: transaction.documents.id,
  //             doc_type_id: transaction.documents.doc_type_id, // Отримання doc_type_id
  //             stocking: transaction.documents.stocking
  //           },
  //           averageWeight: transaction.documents.stocking.map(stocking => stocking.average_weight)
  //         }))
  //       }))
  //     })),
  //   }))
  // }))

  const areas = await db.productionareas.findMany({
    include:{
      productionlines:{
        include:{
          pools: {
            include:{
              locations: true
            }
          }
        }
      }
    }
  })

  const locations = await db.locations.findMany()

  const batches = await db.itembatches.findMany({
    include:{
      items: true
    },
    where:{
      items:{
        item_type_id: 1
      }
    }
  })

  const today = new Date()

  return (
    <div>
      {areas.map(area => (
        <div key={area.id} className="mb-4 p-4">
          <div className="text-3xl font-bold">{area.name}</div>
          {area.productionlines.map(line => (
            <div key={line.id} className=" mb-4 p-4">
              <div className="text-xl font-bold">{line.name}</div>
              {line.pools
              .slice()
              .sort((a, b) => {
                const numA = parseInt(a.name.split('/')[0].slice(1)); // відкидаємо перший символ "Б" і перетворюємо на число
                const numB = parseInt(b.name.split('/')[0].slice(1)); // відкидаємо перший символ "Б" і перетворюємо на число
                return numA - numB; // порівнюємо числа
              })
              .map(pool => (
                pool.locations.map(async loc => {
                  const poolInfo = await calculationForLocation(loc.id, today.toISOString().split("T")[0])

                  return(
                    <div key={pool.id} className="shadow-xl mb-4 p-4 bg-blue-100">
                      <StockingComponent locations={locations} batches={batches} poolInfo={poolInfo} />
                    </div>
                  )
                })
              ))
              // .map(pool => {
              //   return (
              //     <div key={pool.id} className="shadow-xl mb-4 p-4 bg-blue-100">
              //       <StockingComponent pool={pool} locations={locations} batches={batches} areas={areas} />
              //     </div>
              //   );
              // })
              }
            </div>
          ))}
        </div>
      ))}
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

  if(calc){
    const batchesInfo = await getBatchesInfo(location_id)
    batch = batchesInfo[0]
    feed_type_id = await getFeedType(calc.fish_weight)
  }

  return{batch, calc, feed_type_id, location_id}
  
}

type batch_qty = {
  batch_name: string | undefined,
  batch_id: bigint | undefined,
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
        batch_id: batchInfo?.id,
        qty: batch._sum.quantity as number
      })
  }));

  return result
}