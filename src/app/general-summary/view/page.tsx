import { db } from "@/db";
import { Area } from "@/components/accordion"
import React from "react";
import SummaryBatches from "@/components/sum-batches"

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

  const feed_connections = await db.feedconnections.findMany()
  const items = await db.items.findMany()

  function getFeed(average_weight: number): { id: number, name: string } | null {
    const connection = feed_connections.find(connection => {
        return average_weight >= connection.from_fish_weight && average_weight <= connection.to_fish_weight;
    });

    if (connection) {
        const feed_item = items.find(item => connection.feed_id === item.id);
        if (feed_item) {
            const nameMatch = feed_item.name?.match(/\b\d*[,\.]?\d+\s*mm\b/);
            const name = nameMatch ? nameMatch[0] : ""; 
            return { id: feed_item.id, name: name };
        }
    }
    
    return null; 
}

  const locationsWithLatestBatch = await db.locations.findMany({
    where: { location_type_id: 2 }, // Фільтр за типом локації
    include: {
      itemtransactions: {
        orderBy: { id: 'desc' }, // Сортуємо транзакції за спаданням id
        take: 1,
        include: { itembatches: true, documents: true } 
      }
    }
  });

  // locationsWithLatestBatch.map(location => ({
  //   locationName: location.name,
  //   batchName: location.itemtransactions[0]?.itembatches.name || '' // Отримуємо ім'я партії або пустий рядок
  // }));

//   locationsWithLatestBatch.forEach(location => {
//     console.log(`Location: ${location.name}`);
//     if (location.itemtransactions.length > 0) {
//         const latestBatch = location.itemtransactions[0]?.itembatches;
//         console.log(`Latest Batch: ${latestBatch ? latestBatch.name : 'No batches found'}.`);
//     } else {
//         console.log('No transactions found for this location');
//     }
// });

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
                  pool.locations.map(loc => (
                    <tr>
                    <td className="px-4 py-2 border border-gray-400 text-center">{loc.name}</td>
                    <td className="px-4 py-2 border border-gray-400 text-center">{locationsWithLatestBatch.find(location => location.id === loc.id)?.itemtransactions.map(tran => tran.itembatches.name)}</td>
                    
                    <td className="px-4 py-2 border border-gray-400 text-center">{locationsWithLatestBatch.find(location => location.id === loc.id)?.itemtransactions.map(tran => tran.quantity)}</td>
                    <td className="px-4 py-2 border border-gray-400 text-center">
                    {/* {loc.itemtransactions.map(tran => {
                      const validTables = tran.documents.calculation_table.filter(table => 
                        table.date.toISOString().split("T")[0] === date
                      );
                        if (validTables.length > 0) {
                          console.log(loc.name, validTables)
                          const maxDocId = Math.max(...validTables.map(table => Number(table.doc_id)));
                          //console.log(maxDocId)
                          const fishWeight = validTables.find(table => Number(table.doc_id) === maxDocId)?.fish_weight;
                          return fishWeight;
                        } else {
                          return null; // or whatever fallback value you prefer
                        }
                      })} */}
                    </td>

                    <td className="px-4 py-2 border border-gray-400 text-center">{loc.name}</td>
                  </tr>
                  ))
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