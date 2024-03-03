import { db } from "@/db";
import Link from "next/link";
import type {calculation_table} from '@prisma/client'

export default async function CalculationHome() {
  let distinctRecords : calculation_table[];

  distinctRecords = await db.$queryRaw`
  SELECT id, date, fish_amount_in_pool, general_weight, feed_per_day, feed_per_feeding, doc_id
    FROM calculation_table AS ct
    WHERE (id, doc_id) IN (
      SELECT MIN(id) as min_id, doc_id
      FROM calculation_table
      GROUP BY doc_id)`;

  const renderedCalcTable  = distinctRecords.map((record) => {
    return(
      <Link 
            key={record.id} 
            href={`/calculation/${record.id}`}
            className="flex justify-between items-center p-2 border rounded"
        > 
            <div className="flex gap-8">
              <div>{record.doc_id.toString()}</div>
              <div>{record.date.toISOString().split("T")[0]}</div>
            </div>
            <div>View</div>
        </Link>
    )
  })

  return (
    <div>
      <div className="flex m-2 justify-between items-center">
        <h1 className="text-xl font-bold">Calculations</h1>
        <Link href="/calculation/new" className="border p-2 rounded">
          New
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {renderedCalcTable}
      </div>
    </div>
  );
}
