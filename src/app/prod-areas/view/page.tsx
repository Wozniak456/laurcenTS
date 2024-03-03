import { db } from "@/db";
import Link from "next/link";
import {Accordion, Area, Line} from "@/components/accordion";

export default async function AreasHome() {
    const productionAreas = await db.productionareas.findMany({
      include: {
          productionlines: {
            include: {
              pools: true, 
          },
        }
      },
  });
    const areas: Area[] = productionAreas.map(area =>({
      id: area.id,
      name: area.name,
      lines: area.productionlines.map(line => ({
        id: line.id,
        name: line.name,
        pools: line.pools.map(pool => ({
            id: pool.id,
            name: pool.name,
            prod_line_id: pool.prod_line_id,
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
      <Accordion sections={areas}/>
      <div>
      </div>
    </div>
  );
}
