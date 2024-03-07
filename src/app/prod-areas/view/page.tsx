import { db } from "@/db";
import Link from "next/link";
import {Accordion, Area, Line} from "@/components/accordion";

interface FeedConnection{
  id: number,
  from_fish_weight: number,
  to_fish_weight: number
}

export default async function AreasHome() {
  const feedConnections = await db.feedconnections.findMany()
  
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
                          stocking : true
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
            documents: transaction.documents,
            averageWeight: transaction.documents.stocking.map(stocking => stocking.average_weight)
          }))
        }))
      })),
    }))
  }))
 
  return (
    <div className="container mx-auto px-4 m-4 max-w-[800px]">
      <div className="flex m-2 justify-between items-center">
        <Link href="/prod-areas/new" className="border p-2 rounded ml-auto">
          New
        </Link>
      </div>
       <h1 className="text-2xl font-bold mb-4">Виробничі секції</h1>
      <Accordion sections={areas} feedConnections={feedConnections}/>
      <div>
      </div>
    </div>
  );
}
