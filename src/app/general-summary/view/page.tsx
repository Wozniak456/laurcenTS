import { db } from "@/db";
import Link from "next/link";
import StockingComponent from "@/components/stockin111"
import { Area } from "@/components/accordion"
import React from "react";
import { table } from "console";
import SummaryBatches from "@/components/sum-batches"

export default async function GeneralSummary() {
  const calc_table = await db.calculation_table.findMany({
    select: {
      id: true,
      date: true,
      day: true,
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

  const sectionsWithLinesAndPools = await db.productionareas.findMany({
    include: {
      productionlines: {
        include: {
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
      }
    }
  });
  
  const areas: Area[] = sectionsWithLinesAndPools.map(area =>({
    id: area.id,
    name: area.name,
    lines: area.productionlines.map(line => ({
      id: line.id,
      name: line.name,
      pools: line.pools.map(pool => ({
        id: pool.id,
        name: pool.name,
        prod_line_id: pool.prod_line_id,
        locations: pool.locations.map(location => ({
          id: location.id,
          name: location.name,
          itemtransactions: location.itemtransactions.map(transaction =>({
            id: transaction.id,
            quantity: transaction.quantity,
            itembatches: {
              id: transaction.itembatches.id,
              name: transaction.itembatches.name
            },
            documents: {
              id: transaction.documents.id,
              doc_type_id: transaction.documents.doc_type_id,
              stocking: transaction.documents.stocking
            },
            averageWeight: transaction.documents.stocking.map(stocking => stocking.average_weight)
          }))
        }))
      })),
    }))
  }))

  const fishCountByBatch: { [date: string]: { [batchName: string]: number } } = {};


  const dateDictionary: { [dayNumber: number]: Date } = {};

  calc_table.forEach((item) => {
    if (!(item.day in dateDictionary)) {
      dateDictionary[item.day] = item.date;
    }
  });

  const dataDictionary: Record<string, any> = {};

  // Проходимось по всім даним та збираємо інформацію в словник
  Object.entries(dateDictionary).forEach(([dateNum, date]) => {
      areas.forEach(area => {
          area.lines.forEach(line => {
              line.pools.forEach(pool => {
                  const hasTransactions = pool.locations.some(loc =>
                      loc.itemtransactions.some(tran =>
                          calc_table.some(table =>
                              table.date.toISOString().split("T")[0] === date.toISOString().split("T")[0] &&
                              table.documents &&
                              table.documents.location_id === loc.id
                          )
                      )
                  );
  
                  if (hasTransactions) {
                      pool.locations.forEach(loc => {
                          const transactionsForLocation = loc.itemtransactions.filter(tran => {
                              const stockingData = tran.documents?.stocking;
                              return stockingData && stockingData.length > 0;
                          });
  
                          transactionsForLocation.forEach(tran => {
                              const dateString = date.toISOString().split("T")[0];
                              const poolName = pool.name;
                              const batchName = tran.itembatches.name;
                              const quantity = tran.quantity;
                              const fishWeight = calc_table
                                  .filter(table => table.date.toISOString().split("T")[0] === dateString &&
                                      table.documents && table.documents.location_id === loc.id)
                                  .map(table => table.fish_weight.toFixed(2));
  
                              if (!dataDictionary[dateString]) {
                                  dataDictionary[dateString] = {};
                              }
                              if (!dataDictionary[dateString][poolName]) {
                                  dataDictionary[dateString][poolName] = [];
                              }
                              dataDictionary[dateString][poolName].push({ batchName, quantity, fishWeight });
                          });
                      });
                  }
              });
          });
      });
  });
  const feed_connections = await db.feedconnections.findMany()
  const items = await db.items.findMany()

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

  return (
    <div className="flex flex-wrap justify-between mt-4">
      {Object.entries(dateDictionary).map(([dateNum, date]) => (
        <div key={dateNum}>
        <table key={dateNum}>
          <thead>
            <tr>
              <th colSpan={5} className="px-4 py-2 border border-gray-400 text-center font-normal whitespace-nowrap text-sm">{date.toISOString().split("T")[0]}</th>
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
            {areas.map(area => (
              area.lines.map(line => (
                <React.Fragment key={line.id}>
                  <tr>
                    <th colSpan={5} className="px-4 py-2 border border-gray-400 text-center">{line.name}</th>
                  </tr>
                  {line.pools.map(pool => {
                    const hasTransactions = pool.locations.some(loc =>
                      loc.itemtransactions.some(tran =>
                        calc_table.some(table =>
                          table.date.toISOString().split("T")[0] === date.toISOString().split("T")[0] &&
                          table.documents &&
                          table.documents.location_id === loc.id
                        )
                      )
                    );
  
                    if (!hasTransactions) {
                      return null;
                    }
  
                    return pool.locations.map(loc => {
                      const transactionsForLocation = loc.itemtransactions.filter(tran => {
                        const stockingData = tran.documents?.stocking;
                        return stockingData && stockingData.length > 0;
                      });
  
                      return transactionsForLocation.map(tran => (
                        <tr key={tran.id} className="text-sm">
                          
                          <td className="px-4 py-2 border border-gray-400 text-center">{pool.name}</td>
                          <td className="px-4 py-2 border border-gray-400 text-center">{tran.itembatches.name}</td>
                          <td className="px-4 py-2 border border-gray-400 text-center">{tran.quantity}</td>
                          {calc_table
                            .filter(table => table.date.toISOString().split("T")[0] === date.toISOString().split("T")[0] && table.documents && table.documents.location_id === loc.id)
                            .map((table, index) => (
                              <React.Fragment key={index}>
                                <td key={index} className="px-4 py-2 border border-gray-400 text-center">{table.fish_weight.toFixed(2)}</td>
                                {getFeedName(table.fish_weight)
                                      ?.match(/\b\d*[,\.]?\d+\s*mm\b/)
                                      ?.map((match, index) => (
                                        <td key={index} className="px-4 py-2 border border-gray-400 text-center">{match}</td>
                                      ))}
                                
                              </React.Fragment>
                            ))}
                            
                        </tr>
                      ));
                    });
                  })}
                </React.Fragment>
              ))
            ))}
          </tbody>
        </table>
        <SummaryBatches dataDictionary={dataDictionary} date={date.toISOString().split("T")[0]} />
        </div>
        
      ))}
    </div>
  );
}