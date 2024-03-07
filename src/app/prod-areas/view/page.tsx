import { db } from "@/db";
import Link from "next/link";
import {Accordion, Area, FeedConnection} from "@/components/accordion";

export default async function AreasHome() {

  const calc_tabledb = await db.calculation_table.findMany()

  const calc_table = calc_tabledb.map(record => ({
    id : record.id,
    day : record.day,
    date : record.date,
    feed_per_day: record.feed_per_day,
    feed_per_feeding: record.feed_per_feeding,
    doc_id : record.doc_id
  }))
  
  const batchesbd = await db.itembatches.findMany()
  
  const batches = batchesbd.map(batch => (
    {
      id: batch.id,
      name: batch.name
    }
  ))

  const feedConnectionsWithItemsbd = await db.feedconnections.findMany({
    include:{
      items_feedconnections_feed_idToitems: true
    }
  });

  const locationsdb = await db.locations.findMany()

  const locations = locationsdb.map( location => (
    {
      id: location.id,
      name: location.name,
      pool_id: location.pool_id
    }
  ))

  const feedConnectionsWithItems: FeedConnection[] = feedConnectionsWithItemsbd.map(connection =>({
    id: connection.id,
    feed_id: connection.feed_id,
    from_fish_weight: connection.from_fish_weight,
    to_fish_weight: connection.to_fish_weight,
    item: {
      id: connection.items_feedconnections_feed_idToitems.id,
      name: connection.items_feedconnections_feed_idToitems.name
    }  
  }))

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
      <Accordion sections={areas} feedConnections={feedConnectionsWithItems} locations={locations} itembatches={batches} calculation={calc_table}/>
      <div>
      </div>
    </div>
  );
}
