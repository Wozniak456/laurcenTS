import { db } from "@/db";
import Link from "next/link";

export default async function PurchlinesHome() {
  const purchaselines = await db.purchaselines.findMany();

    const renderedpurchaselines  = purchaselines.map((purchaseline) => {
        return(
        <Link 
            key={purchaseline.id} 
            href={`/purchlines/${purchaseline.id}`}
            className="flex justify-between items-center p-2 border rounded"
        > 
            <div>{purchaseline.id.toString()}</div>
            <div>View</div>
        </Link>
        )
  })

  return (
    <div>
      <div className="flex m-2 justify-between items-center">
        <h1 className="text-xl font-bold">Purchase lines</h1>
        <Link href="/purchlines/new" className="border p-2 rounded">
          New
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {renderedpurchaselines}
      </div>
    </div>
  );
}
