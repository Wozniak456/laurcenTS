import { db } from "@/db";
import Link from "next/link";

export default async function LinesHome() {
  const lines = await db.productionlines.findMany();

  const renderedLines  = lines.map((line) => {
    return(
      <Link 
        key={line.id} 
        href={`/prod-lines/${line.id}`}
        className="flex justify-between items-center p-2 border rounded"
      > 
        <div>{line.name}</div>
        <div>View</div>
      </Link>
    )
  })

  return (
    <div>
      <div className="flex m-2 justify-between items-center">
        <h1 className="text-xl font-bold">Production lines</h1>
        <Link href="/prod-lines/new" className="border p-2 rounded">
          New
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {renderedLines}
      </div>
    </div>
  );
}
