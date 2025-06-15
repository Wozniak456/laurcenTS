import { db } from "@/db";
import { FetchingReasons } from "@/types/fetching-reasons";
import FetchingInfoTable from "@/components/fetching-summary-table";
import { getWeekOfYear } from "@/actions";
import moment from "moment";
import { format } from "date-fns";
import {
  Prisma,
  documents,
  locations,
  itemtransactions,
  fetching,
} from "@prisma/client";

type FetchingInfo = {
  locationName: string;
  locationId: number;
  commercialFishingAmount: number;
  commercialFishingWeight: number;
  sortedAmount: number;
  sortedWeight: number;
  growOutAmount: number;
  growOutWeight: number;
  moreThan500Amount: number;
  moreThan500Weight: number;
  lessThan500Amount: number;
  lessThan500Weight: number;
  weekNum: number;
  weekPeriod?: string;
};

interface FetchingRecord {
  id: bigint;
  fetching_reason: string;
  total_weight: number;
  tran_id: bigint;
  weekNumber: number;
}

interface ItemTransactionWithFetching extends itemtransactions {
  fetching: FetchingRecord[];
}

interface DocumentWithTransactions extends documents {
  itemtransactions: ItemTransactionWithFetching[];
}

interface LocationWithDocuments extends locations {
  documents: DocumentWithTransactions[];
}

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

interface LocationFetchingInfo {
  locationId: number;
  locationName: string;
  totalWeight: number;
  fetchingReasons: Record<string, number>;
}

interface LocationWithDocuments extends locations {
  documents: DocumentWithTransactions[];
}

interface FetchingData {
  id: bigint;
  fetching_reason: string;
  total_weight: number;
  tran_id: bigint;
  weekNumber: number;
}

interface ItemTransaction extends itemtransactions {
  fetching: FetchingData | null;
  locations: locations | null;
}

interface DocumentWithRelations extends documents {
  locations: locations[];
  itemtransactions: ItemTransaction[];
}

export default async function FetchingPage({ searchParams }: PageProps) {
  // Get the week parameter from URL
  const weekParam = searchParams.week as string | undefined;

  let weekNum: number;
  let year: number;
  let weekPeriod: string | undefined;

  if (weekParam) {
    // Validate format YYYY-WW
    const match = weekParam.match(/^(\d{4})-(\d{2})$/);
    if (!match) {
      throw new Error(
        "Invalid week format. Use YYYY-WW format (e.g., 2024-17)"
      );
    }

    const [_, yearStr, weekStr] = match;
    year = parseInt(yearStr);
    weekNum = parseInt(weekStr);

    // Validate week number (1-53)
    if (weekNum < 1 || weekNum > 53) {
      throw new Error("Week number must be between 1 and 53");
    }

    // Calculate the start and end dates of the week
    const startOfWeek = moment().year(year).isoWeek(weekNum).startOf("isoWeek");
    const endOfWeek = moment().year(year).isoWeek(weekNum).endOf("isoWeek");

    weekPeriod = `${startOfWeek.format("DD.MM.YYYY")} - ${endOfWeek.format(
      "DD.MM.YYYY"
    )}`;
  } else {
    const now = new Date();
    year = now.getFullYear();
    weekNum = getWeekOfYear(now);
  }

  // Calculate the start and end dates for the week
  const startDate = moment()
    .year(year)
    .isoWeek(weekNum)
    .startOf("isoWeek")
    .toDate();
  const endDate = moment()
    .year(year)
    .isoWeek(weekNum)
    .endOf("isoWeek")
    .toDate();

  //console.log("Debug - Query Parameters:", {
  //year,
  //weekNum,
  //startDate,
  //endDate,
  //weekPeriod,
  //});

  const fetchingData = (await db.$queryRaw`
    SELECT 
      l.id as location_id,
      l.name as location_name,
      f.fetching_reason,
      SUM(ABS(it.quantity)) as total_quantity,
      SUM(f.total_weight) as total_weight
    FROM locations l
    INNER JOIN documents d ON d.location_id = l.id
    INNER JOIN itemtransactions it ON it.doc_id = d.id
    INNER JOIN fetching f ON f.tran_id = it.id
    WHERE d.doc_type_id = 13
    AND d.date_time >= ${startDate}
    AND d.date_time <= ${endDate}
    GROUP BY l.id, l.name, f.fetching_reason
    ORDER BY l.name, f.fetching_reason
  `) as {
    location_id: number;
    location_name: string;
    fetching_reason: string;
    total_quantity: number;
    total_weight: number;
  }[];

  // Group the data by location
  const locationMap = new Map<number, FetchingInfo>();

  fetchingData.forEach((record) => {
    if (!locationMap.has(record.location_id)) {
      locationMap.set(record.location_id, {
        locationName: record.location_name,
        locationId: record.location_id,
        commercialFishingAmount: 0,
        commercialFishingWeight: 0,
        sortedAmount: 0,
        sortedWeight: 0,
        growOutAmount: 0,
        growOutWeight: 0,
        moreThan500Amount: 0,
        moreThan500Weight: 0,
        lessThan500Amount: 0,
        lessThan500Weight: 0,
        weekNum: weekNum,
        weekPeriod: weekPeriod,
      });
    }

    const info = locationMap.get(record.location_id)!;

    switch (record.fetching_reason) {
      case FetchingReasons.CommercialFishing:
        info.commercialFishingAmount = record.total_quantity;
        info.commercialFishingWeight = record.total_weight;
        break;
      case FetchingReasons.Sorted:
        info.sortedAmount = record.total_quantity;
        info.sortedWeight = record.total_weight;
        break;
      case FetchingReasons.GrowOut:
        info.growOutAmount = record.total_quantity;
        info.growOutWeight = record.total_weight;
        break;
      case FetchingReasons.MoreThan500:
        info.moreThan500Amount = record.total_quantity;
        info.moreThan500Weight = record.total_weight;
        break;
      case FetchingReasons.LessThan500:
        info.lessThan500Amount = record.total_quantity;
        info.lessThan500Weight = record.total_weight;
        break;
    }
  });

  const summaryArray = Array.from(locationMap.values()).filter(
    (info) =>
      info.commercialFishingAmount > 0 ||
      info.sortedAmount > 0 ||
      info.growOutAmount > 0 ||
      info.moreThan500Amount > 0 ||
      info.lessThan500Amount > 0
  );

  //console.log("Debug - Summary Array:", summaryArray);

  return (
    <>
      <FetchingInfoTable
        summary={summaryArray}
        weekNum={weekNum}
        weekPeriod={weekPeriod}
      />
    </>
  );
}
