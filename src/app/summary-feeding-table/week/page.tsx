import { db } from "@/db";
import * as actions from "@/actions"

export default async function WeekSummary() {
  const calc_table = await db.calculation_table.findMany({
      select: {
        id: true,
        date: true,
        fish_weight: true,
        feed_per_feeding: true,
        doc_id: true,
        documents: {
          include: {
            locations: {
              select: {
                id: true,
                name: true,
                pool_id: true
              }
            },
          },
        },
      }
  });
      
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
    
  const feed_connections = await db.feedconnections.findMany();
  const feed_id = actions.getFeedForFish(feed_connections, 0.8)
  const items = await db.items.findMany();

  const groupedCalcTable: { [date: string]: { [poolId: string]: string } } = {};

  const now = new Date();
  now.setDate(now.getDate() - 1);
  const next9Days = new Date(now);
  next9Days.setDate(now.getDate() + 10);

  calc_table.forEach(record => {
    const recordDate = record.date;
    if (recordDate >= now && recordDate <= next9Days) {
      const date = recordDate.toISOString().split("T")[0];
      if (!groupedCalcTable[date]) {
        groupedCalcTable[date] = {};
      }
      const poolId = record.documents.locations?.pool_id;
      if (poolId !== null && poolId !== undefined) {
        groupedCalcTable[date][poolId] = record.feed_per_feeding.toFixed(0);
      }
    }
  });

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

type StockingDictionary = Record<string, any[]>;
const stockingDictionary: StockingDictionary = {};
  
  lines.forEach(line => {
    line.pools.forEach(pool => {
      const poolName = pool.name;
      pool.locations.forEach(location => {
        location.itemtransactions.forEach(transaction => {
          transaction.documents.stocking.forEach(stock => {
              if (stockingDictionary.hasOwnProperty(poolName)) {
                stockingDictionary[poolName].push(stock.average_weight);
              } else {
                stockingDictionary[poolName] = [stock.average_weight];
              }
          });
        });
      });
    });
  });
  
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
                    {line.pools.filter(pool => pool.prod_line_id === line.id).map(pool => (
                          <th key={pool.id} className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">
                          {
                            
                            (getFeedName(stockingDictionary[pool.name]?.slice(-1)[0])?.match(/\b\d*[,\.]?\d+\s*mm\b/) || []).map((match, index) => (
                              <span key={index}>{match}</span>
                            ))
                          }
                        </th>
                    ))}
                  </tr>
                  <tr>
                    <th className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">Дата</th>
                    {line.pools.filter(pool => pool.prod_line_id === line.id).map(pool => (
                      <th key={pool.id} className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">{pool.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedCalcTable).map(([date, poolData]) => (
                    <tr key={date}>
                      <td className="px-4 py-2 border border-gray-400 text-center font-normal whitespace-nowrap text-sm">{date}</td>
                      {line.pools.filter(pool => pool.prod_line_id === line.id).map(pool => (
                        <td key={`${date}-${pool.id}`} className="px-4 py-2 border border-gray-400 text-center font-normal text-sm">
                          {poolData[pool.id] || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        ))}
      </div>
    </div>
  );
  
}