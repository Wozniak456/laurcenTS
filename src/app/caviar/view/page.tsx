import { db } from "@/db";
import Link from "next/link";

export default async function CaviarHome() {
    const caviars = await db.itembatches.findMany({
        where: {
            items: {
                item_type_id: 2
            }
        },
        include: {
            items: true
        }
    });

    const renderedCaviar  = caviars.map((caviar) => {
        return(
        <Link 
            key={caviar.id} 
            href={`/caviar/${caviar.id}`}
            className="flex justify-between items-center p-2 border rounded"
        > 
            <div>{caviar.name}</div>
            <div>View</div>
        </Link>
        )
  })

  return (
    <div>
      <div className="flex m-2 justify-between items-center">
        <h1 className="text-xl font-bold">Caviar</h1>
        <Link href="/caviar/new" className="border p-2 rounded">
          New
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {renderedCaviar}
      </div>
    </div>
  );
}
