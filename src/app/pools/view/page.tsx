import { db } from "@/db";
import Link from "next/link";

export default async function PoolsHome() {
  const pools = await db.pools.findMany();

  const renderedPools  = pools.map((pool) => {
    return(
      <Link 
        key={pool.id} 
        href={`/pools/${pool.id}`}
        className="flex justify-between items-center p-2 border rounded"
      > 
        <div>{pool.name}</div>
        <div>View</div>
      </Link>
    )
  })

  return (
    <div>
      <div className="flex m-2 justify-between items-center">
        <h1 className="text-xl font-bold">Pools</h1>
        <Link href="/pools/new" className="border p-2 rounded">
          New
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {renderedPools}
      </div>
    </div>
  );
}
