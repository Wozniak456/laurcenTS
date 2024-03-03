import { db } from "@/db";
import Link from "next/link";

export default async function PurchtableHome() {
  const purchtable = await db.purchtable.findMany();

    const renderedtable  = purchtable.map((purchRecord) => {
        return(
        <Link 
            key={purchRecord.id} 
            href={`/purchtable/${purchRecord.id}`}
            className="flex justify-between items-center p-2 border rounded"
        > 
            <div>{purchRecord.id.toString()}</div>
            <div>View</div>
        </Link>
        )
  })

  return (
    <div>
      <div className="flex m-2 justify-between items-center">
        <h1 className="text-xl font-bold">Records of purchtable</h1>
        <Link href="/purchtable/new" className="border p-2 rounded">
          New
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {renderedtable}
      </div>
    </div>
  );
}
