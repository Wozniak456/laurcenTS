import { db } from "@/db";
import * as stockingActions from '@/actions/stocking'

export default async function WeekSummary() {
     
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

  const now = new Date();
  const datesArray: Date[] = [];

  for (let i = 0; i < 10; i++) {
    const currentDate = new Date();
    currentDate.setDate(now.getDate() + i);
    datesArray.push(currentDate);
  }


  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Week Summary</h2>
      <div className="flex gap-4 flex-wrap">
        {lines.map( line => (
          <div key={line.id} className="mb-4">
              <table className="mb-4">
                <thead>
                  <tr>
                    <th colSpan={line.pools.filter(pool => pool.prod_line_id === line.id).length + 1} className="px-4 py-2 border border-gray-400 text-center bg-blue-100">{line.name}</th>
                  </tr>
                  <tr>
                    <th className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">Корм &rarr;</th>
                    {line.pools.map(async pool => {

                      const poolInfo = await stockingActions.poolInfo(pool.locations[0].id, now.toISOString().split("T")[0])

                      return(
                        <th key={pool.id} className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">
                            {poolInfo.feedType?.name}
                        </th>
                      )
                        
                    })}
                  </tr>
                  <tr>
                    <th className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">Дата</th>
                    {line.pools.filter(pool => pool.prod_line_id === line.id).map(pool => (
                      <th key={pool.id} className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">{pool.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datesArray.map((date, dateIndex) => {
                    return(
                      <tr key={dateIndex}>
                        <td className="px-4 py-2 border border-gray-400 text-center font-normal whitespace-nowrap text-sm">{date.toISOString().split("T")[0]}</td>
                        {line.pools.map(async (pool, poolIndex) => {

                          const calc = await stockingActions.calculationForLocation(pool.locations[0].id, date.toISOString().split("T")[0])

                          // console.log(calc)

                          return(
                            <td key={poolIndex} className="px-4 py-2 border border-gray-400 text-center font-normal text-sm">
                              {calc.calc?.feed_per_feeding.toFixed(0)}
                            </td>
                          )
                          
                        })}
                    </tr>
                    )
                  })}
                  
                </tbody>
              </table>
          </div>
        ))}
      </div>
    </div>
  );
  
}