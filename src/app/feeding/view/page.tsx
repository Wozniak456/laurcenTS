import { db } from "@/db";
import StockingComponent from "@/components/feeding-component"
import { poolInfo } from '@/types/app_types'
import {getBatchesInfo, calculationForLocation} from '@/actions/stocking'

export default async function StockingHome() {

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

  const disposal_reasons = await db.disposal_reasons.findMany()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-sm">
      {areas.map(area => (
        <div key={area.id} className="mb-4 p-4">
          <div className="text-3xl font-bold">{area.name}</div>
          {area.productionlines.map(line => (
            <div key={line.id} className=" mb-4 p-4">
              <div className="text-xl font-bold">{line.name}</div>
              {line.pools
              
              .sort((a, b) => {
                const numA = parseInt(a.name.split('/')[0].slice(1)); // відкидаємо перший символ "Б" і перетворюємо на число
                const numB = parseInt(b.name.split('/')[0].slice(1)); // відкидаємо перший символ "Б" і перетворюємо на число
                return numA - numB; // порівнюємо числа
              })
              .map(pool => (
                pool.locations.map(async loc => {
                  
                  const self_cost_result = await db.batch_generation.findFirst({
                    include: {
                      cost_record: {
                        orderBy: {
                          id: 'desc'
                        },
                        take: 1,
                      }
                    },
                    where: {
                      location_id: loc.id,
                    },
                    orderBy:{
                      id: 'desc'
                    },
                    take: 1
                  });

                  // let poolInfo : poolInfo = await calculationForLocation(loc.id, today.toISOString().split("T")[0])
                  // poolInfo = {
                  //   ...poolInfo,
                  //   location_name : loc.name,
                  // }

                  const poolInfo = await stockingInfo(loc.id, today.toISOString().split("T")[0])

                  return(
                    <div key={pool.id} className="shadow-xl mb-4 px-4 py-0.5 bg-blue-100">
                      <StockingComponent locations={locations} location={loc} batches={batches} poolInfo={poolInfo} disposal_reasons={disposal_reasons} />
                    </div>
                  )
                })
              ))
              }
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const stockingInfo = async (location_id: number, date: string) => {
  // const dateValue = new Date(date)
  // dateValue.setHours(23, 59, 59, 999);

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
          // date_time:{
          //     lte: dateValue
          // }
      },
      orderBy:{
          id: 'desc'
      },
      take: 1
  })

  console.log('lastStocking', lastStocking)

  let feedType

  if (lastStocking){
      feedType = await getFeedType(lastStocking?.stocking[0].average_weight)
  }

  const batchId = lastStocking?.itemtransactions[0].itembatches.id
  const batchName = lastStocking?.itemtransactions[0].itembatches.name
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
      console.log(location_id,' можна редагувати')
      allowedToEdit = true
    }
  }
  
  return({batchId, batchName, qty, fishWeight, feedType, updateDate, allowedToEdit})
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