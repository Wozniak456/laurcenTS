import { db } from "@/db";
import Link from "next/link";
import StockingComponent from "@/components/stockin111"
import { Area } from "@/components/accordion"

export default async function StockingHome() {
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
              doc_type_id: transaction.documents.doc_type_id, // Отримання doc_type_id
              stocking: transaction.documents.stocking
            },
            averageWeight: transaction.documents.stocking.map(stocking => stocking.average_weight)
          }))
        }))
      })),
    }))
  }))

  const locations = await db.locations.findMany()
  
  // const areas_with_content = await db.productionareas.findMany({
  //   include:{
  //     productionlines:{
  //       include:{
  //         pools: true
  //       }
  //     }
  //   }
  // })

  const batches = await db.itembatches.findMany()

  return (
    <div>
      {areas.map(area => (
        <div key={area.id} className="mb-4 p-4">
          <div className="text-3xl font-bold">{area.name}</div>
          {area.lines.map(line => (
            <div key={line.id} className=" mb-4 p-4">
              <div className="text-xl font-bold">{line.name}</div>
              {line.pools
              .slice()
              .sort((a, b) => {
                const numA = parseInt(a.name.split('/')[0].slice(1)); // відкидаємо перший символ "Б" і перетворюємо на число
                const numB = parseInt(b.name.split('/')[0].slice(1)); // відкидаємо перший символ "Б" і перетворюємо на число
                return numA - numB; // порівнюємо числа
              })
              .map(pool => {
                return (
                  <div key={pool.id} className="shadow-xl mb-4 p-4 bg-blue-100">
                    <StockingComponent pool={pool} locations={locations} batches={batches} areas={areas} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
