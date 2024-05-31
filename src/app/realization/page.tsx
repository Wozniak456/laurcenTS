import { db } from "@/db";
import StockingComponent from "@/components/stockin111"
import * as actions from '@/actions/stocking/index';
import { poolInfo } from '@/types/app_types'
import {getBatchesInfo} from '@/actions/stocking'

export default async function RealizationPage() {

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
                 
                  let poolInfo : poolInfo = await calculationForLocation(loc.id, today.toISOString().split("T")[0])
                  poolInfo = {
                    ...poolInfo,
                    location_name : loc.name
                  }
                  
                  return(
                    <div key={pool.id} className="shadow-xl mb-4 px-4 py-0.5 bg-blue-100">
                      <StockingComponent locations={locations} batches={batches} poolInfo={poolInfo} disposal_reasons={disposal_reasons} />
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
    batch = await getBatchesInfo(location_id)
    feed_type_id = await getFeedType(calc.fish_weight)
  }

  return{batch, calc, feed_type_id, location_id}
  
}
