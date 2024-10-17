import { db } from "@/db";
import StockingComponent from "@/components/feeding-component"
import * as stockingActions from '@/actions/stocking'
import * as actions from '@/actions'

export const dynamic = 'force-dynamic'

export default async function StockingHome() {

  const today = new Date()

  const areas = await actions.getAreas()

  const locations = await actions.getPools()

  const batches = await actions.getCatfishBatches()
  
  const disposal_reasons = await db.disposal_reasons.findMany()

  const weekNum = actions.getWeekOfYear(today)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-sm">
      <div className="flex justify-end w-full">
        <p>Тиждень: {weekNum}</p>
      </div>
      {areas.map(area => (
        <div key={area.id} className="w-full">
          <div className="text-3xl font-bold">{area.name}</div>
          {area.productionlines.map(line => (
            <div key={line.id} className="">
              <div className="text-xl font-bold my-4">{line.name}</div>
              {line.pools
              
              .sort((a, b) => {
                const numA = parseInt(a.name.split('/')[0].slice(1)); // відкидаємо перший символ "Б" і перетворюємо на число
                const numB = parseInt(b.name.split('/')[0].slice(1)); // відкидаємо перший символ "Б" і перетворюємо на число
                return numA - numB; 
              })

              .map(pool => (
                pool.locations.map(async loc => {

                  //інформація про басейн на момент дати на компютері
                  let poolInfo = await stockingActions.poolInfo(loc.id, today.toISOString().split("T")[0])

                  poolInfo = {
                    ...poolInfo,
                    wasFetchedThisWeek : await wasFetchedThisWeek(loc.id, weekNum)
                  }

                  return(
                    <div key={pool.id} className="shadow-xl mb-4 px-4 py-0.5 bg-blue-100">
                      <StockingComponent locations={locations} location={loc} batches={batches} poolInfo={poolInfo} disposal_reasons={disposal_reasons} weekNum={weekNum} />
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


async function wasFetchedThisWeek (location_id: number, weekNum: number){
  const fetch = await db.fetching.findMany({
    include:{
      itemtransactions:{
        include:{
          documents: true,
        }
      }
    },
    where:{
      itemtransactions:{
        documents:{
          location_id: location_id
        }
      },
      weekNumber: weekNum
    }
  })

  if(fetch.length > 0){
    return true
  } else{
    return false
  }
}