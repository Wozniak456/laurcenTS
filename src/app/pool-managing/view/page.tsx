import { db } from "@/db";
import StockingComponent from "@/components/feeding-component"
import * as stockingActions from '@/actions/stocking'

export default async function StockingHome() {
  const today = new Date()
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
                return numA - numB; 
              })
              .map(pool => (
                pool.locations.map(async loc => {

                  const poolInfo = await stockingActions.poolInfo(loc.id, today.toISOString().split("T")[0])

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
