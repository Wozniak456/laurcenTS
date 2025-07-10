import PoolActionsTable from "@/components/PoolActionsTable";
import { db } from "@/db";
import moment from "moment";
import { useSearchParams } from "next/navigation";
import { redirect } from "next/navigation";
import { getPageTitle } from "@/utils/pageTitle";

export const metadata = {
  title: getPageTitle("Дії над басейнами"),
};

// Local type for PoolActionRow to fix type error
type PoolActionRow = {
  parent_doc_id: number;
  source_location_id: number;
  source_date: string;
  source_location_name: string;
  start_qty: number;
  source_batch_name?: string;
  destinations: {
    dest_location_id: number;
    dest_location_name: string;
    dest_quantity: number;
    dest_avg_weight: number;
    action_doc_id: number;
    action_date: string;
    dest_batch_name?: string;
  }[];
};

function getWeekParams(weekParam?: string) {
  let weekNum: number;
  let year: number;
  let weekPeriod: string | undefined;

  if (weekParam) {
    const match = weekParam.match(/^([0-9]{4})-([0-9]{2})$/);
    if (match) {
      year = parseInt(match[1]);
      weekNum = parseInt(match[2]);
    } else {
      year = moment().year();
      weekNum = moment().isoWeek();
    }
  } else {
    year = moment().year();
    weekNum = moment().isoWeek();
  }
  const startOfWeek = moment().year(year).isoWeek(weekNum).startOf("isoWeek");
  const endOfWeek = moment().year(year).isoWeek(weekNum).endOf("isoWeek");
  weekPeriod = `${startOfWeek.format("DD.MM.YYYY")} - ${endOfWeek.format(
    "DD.MM.YYYY"
  )}`;
  return {
    weekNum,
    year,
    weekPeriod,
    start: startOfWeek.format("YYYY-MM-DD"),
    end: endOfWeek.format("YYYY-MM-DD"),
  };
}

export default async function PoolActionsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const weekParam = searchParams?.week;
  const { weekNum, year, weekPeriod, start, end } = getWeekParams(weekParam);

  // 1. Main pool actions query
  const raw = await db.$queryRawUnsafe(
    `
    SELECT 
      dp.id as parent_doc_id,
      dp.location_id as source_location_id,
      dp.date_time::date as source_date,
      d.id as action_doc_id,
      d.location_id as action_location_id,
      d.date_time as action_date,
      itr.location_id as dest_location_id,
      itr.quantity as dest_quantity,
      st.form_average_weight as dest_avg_weight,
      lsrc.name as source_location_name,
      ldst.name as dest_location_name,
      src_batch.batch_id as source_batch_id,
      src_batch.batch_name as source_batch_name,
      dest_batch.batch_id as dest_batch_id,
      dest_batch.batch_name as dest_batch_name
    FROM documents d
    INNER JOIN itemtransactions itr ON itr.doc_id = d.id AND itr.quantity > 0
    LEFT JOIN stocking st ON st.doc_id = d.id
    INNER JOIN documents dp ON dp.id = d.parent_document AND dp.doc_type_id = 2
      AND dp.date_time::date BETWEEN $1::date AND $2::date
    LEFT JOIN locations lsrc ON lsrc.id = dp.location_id
    LEFT JOIN locations ldst ON ldst.id = itr.location_id
    LEFT JOIN LATERAL (
      SELECT ib.id as batch_id, ib.name as batch_name
      FROM itemtransactions it
      JOIN itembatches ib ON ib.id = it.batch_id
      WHERE it.location_id = dp.location_id AND it.quantity > 0
      ORDER BY it.id ASC LIMIT 1
    ) src_batch ON TRUE
    LEFT JOIN LATERAL (
      SELECT ib.id as batch_id, ib.name as batch_name
      FROM itemtransactions it
      JOIN itembatches ib ON ib.id = it.batch_id
      WHERE it.location_id = itr.location_id AND it.quantity > 0
      ORDER BY it.id ASC LIMIT 1
    ) dest_batch ON TRUE
    WHERE d.location_id != dp.location_id
  `,
    start,
    end
  );

  // 2. Starting quantity per source location
  const startQtyRows = await db.$queryRawUnsafe(
    `
    SELECT dp.location_id, SUM(itr.quantity) as start_qty
    FROM documents d
    INNER JOIN itemtransactions itr ON itr.doc_id = d.id AND itr.quantity > 0
    LEFT JOIN stocking st ON st.doc_id = d.id
    INNER JOIN documents dp ON dp.id = d.parent_document AND dp.doc_type_id = 2
      AND dp.date_time::date BETWEEN $1::date AND $2::date
    GROUP BY dp.location_id
  `,
    start,
    end
  );
  const startQtyMap = Object.fromEntries(
    (startQtyRows as any[]).map((row) => [
      row.location_id,
      Number(row.start_qty),
    ])
  );

  // 3. Map and group results
  const grouped: any = {};
  for (const row of raw as any[]) {
    const key = `${row.parent_doc_id}_${row.source_location_id}`;
    if (!grouped[key]) {
      grouped[key] = {
        parent_doc_id: row.parent_doc_id,
        source_location_id: row.source_location_id,
        source_date: row.source_date,
        source_location_name: row.source_location_name,
        start_qty: startQtyMap[row.source_location_id] || 0,
        source_batch_name: row.source_batch_name,
        destinations: [],
      };
    }
    grouped[key].destinations.push({
      dest_location_id: row.dest_location_id,
      dest_location_name: row.dest_location_name,
      dest_quantity: row.dest_quantity,
      dest_avg_weight: row.dest_avg_weight,
      action_doc_id: row.action_doc_id,
      action_date: row.action_date,
      dest_batch_name: row.dest_batch_name,
    });
  }
  const data = Object.values(grouped) as PoolActionRow[];

  // Week navigation URLs
  const getWeekUrl = (offset: number) => {
    let newWeek = weekNum + offset;
    let newYear = year;
    if (newWeek > 53) {
      newWeek = 1;
      newYear += 1;
    }
    if (newWeek < 1) {
      newWeek = 53;
      newYear -= 1;
    }
    const formattedWeek = newWeek.toString().padStart(2, "0");
    return `/pools/actions?week=${newYear}-${formattedWeek}`;
  };

  return (
    <div className="my-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-4">Дії над басейнами</h1>
      <div className="flex flex-col gap-2 my-4">
        <div className="flex justify-between items-center">
          <h1 className="font-bold">Тиждень: {weekNum}</h1>
          <div className="flex gap-2">
            <a href={getWeekUrl(-5)} className="px-2 py-1 bg-gray-100 rounded">
              -5 тижнів
            </a>
            <a href={getWeekUrl(-1)} className="px-2 py-1 bg-gray-100 rounded">
              -1 тиждень
            </a>
            <a href={getWeekUrl(1)} className="px-2 py-1 bg-gray-100 rounded">
              +1 тиждень
            </a>
            <a href={getWeekUrl(5)} className="px-2 py-1 bg-gray-100 rounded">
              +5 тижнів
            </a>
          </div>
        </div>
        {weekPeriod && <h2 className="text-gray-600">Період: {weekPeriod}</h2>}
      </div>
      <PoolActionsTable data={data} weekNum={weekNum} weekPeriod={weekPeriod} />
    </div>
  );
}
