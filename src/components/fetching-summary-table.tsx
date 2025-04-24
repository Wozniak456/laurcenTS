"use client";
import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  ButtonGroup,
} from "@nextui-org/react";
import ExportButton from "@/components/fetchingTableToPrint";
import { useRouter, useSearchParams } from "next/navigation";

// Тип FetchingInfo
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

interface FetchingInfoTableProps {
  summary: FetchingInfo[];
  weekNum: number;
  weekPeriod?: string;
}

export default function FetchingInfoTable({
  summary,
  weekNum,
  weekPeriod,
}: FetchingInfoTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateToWeek = (offset: number) => {
    const currentWeekParam = searchParams.get("week");
    let year: number;
    let week: number;

    if (currentWeekParam) {
      // If we have a week parameter, parse it
      const [yearStr, weekStr] = currentWeekParam.split("-");
      year = parseInt(yearStr);
      week = parseInt(weekStr);
    } else {
      // If no week parameter, use current week
      year = new Date().getFullYear();
      week = weekNum;
    }

    // Calculate new week
    week += offset;

    // Handle year transitions
    while (week > 53) {
      week -= 53;
      year += 1;
    }
    while (week < 1) {
      week += 53;
      year -= 1;
    }

    // Format week number to always be two digits
    const formattedWeek = week.toString().padStart(2, "0");

    // Navigate to the new week
    router.push(`/fetching/view?week=${year}-${formattedWeek}`);
  };

  return (
    <>
      <div className="flex flex-col gap-2 my-4">
        <div className="flex justify-between items-center">
          <h1 className="font-bold">Тиждень: {weekNum}</h1>
          <ButtonGroup>
            <Button size="sm" variant="flat" onPress={() => navigateToWeek(-5)}>
              -5 тижнів
            </Button>
            <Button size="sm" variant="flat" onPress={() => navigateToWeek(-1)}>
              -1 тиждень
            </Button>
            <Button size="sm" variant="flat" onPress={() => navigateToWeek(1)}>
              +1 тиждень
            </Button>
            <Button size="sm" variant="flat" onPress={() => navigateToWeek(5)}>
              +5 тижнів
            </Button>
          </ButtonGroup>
        </div>
        {weekPeriod && <h2 className="text-gray-600">Період: {weekPeriod}</h2>}
      </div>
      <div className="my-4">
        <ExportButton summary={summary} />
      </div>

      <Table
        aria-label="Fetching Information Summary"
        color="primary"
        selectionMode="none"
      >
        <TableHeader>
          <TableColumn>Басейн</TableColumn>

          <TableColumn className="bg-blue-100">Товарна</TableColumn>
          <TableColumn className="bg-blue-100">кг</TableColumn>
          <TableColumn className="bg-blue-100">сер. вага</TableColumn>

          <TableColumn>Відсортована</TableColumn>
          <TableColumn>кг</TableColumn>
          <TableColumn>сер. вага</TableColumn>

          <TableColumn className="bg-blue-100">Доріст</TableColumn>
          <TableColumn className="bg-blue-100">кг</TableColumn>
          <TableColumn className="bg-blue-100">сер. вага</TableColumn>

          <TableColumn>500+</TableColumn>
          <TableColumn>кг</TableColumn>
          <TableColumn>сер. вага</TableColumn>

          <TableColumn className="bg-blue-100">-500</TableColumn>
          <TableColumn className="bg-blue-100">кг</TableColumn>
          <TableColumn className="bg-blue-100">сер. вага</TableColumn>
        </TableHeader>
        <TableBody>
          {Object.entries(summary).map(([locationName, info]) => (
            <TableRow key={locationName} className="text-center">
              <TableCell>{info.locationName}</TableCell>

              <TableCell className="bg-blue-100">
                {info.commercialFishingAmount}
              </TableCell>
              <TableCell className="bg-blue-100">
                {info.commercialFishingWeight}
              </TableCell>
              {/* <TableCell className="bg-blue-100">{(info.commercialFishingWeight / info.commercialFishingAmount).toFixed(1)}</TableCell> */}
              <TableCell className="bg-blue-100">
                {info.commercialFishingAmount !== 0
                  ? (
                      info.commercialFishingWeight /
                      info.commercialFishingAmount
                    ).toFixed(1)
                  : "0"}
              </TableCell>

              <TableCell>{info.sortedAmount}</TableCell>
              <TableCell>{info.sortedWeight}</TableCell>
              {/* <TableCell>{info.sortedWeight / info.sortedAmount}</TableCell> */}
              <TableCell>
                {info.sortedAmount !== 0
                  ? (info.sortedWeight / info.sortedAmount).toFixed(1)
                  : "0"}
              </TableCell>

              <TableCell className="bg-blue-100">
                {info.growOutAmount}
              </TableCell>
              <TableCell className="bg-blue-100">
                {info.growOutWeight}
              </TableCell>
              {/* <TableCell className="bg-blue-100">{(info.growOutWeight / info.growOutAmount).toFixed(1)}</TableCell> */}
              <TableCell className="bg-blue-100">
                {info.growOutAmount !== 0
                  ? (info.growOutWeight / info.growOutAmount).toFixed(1)
                  : "0"}
              </TableCell>

              <TableCell>{info.moreThan500Amount}</TableCell>
              <TableCell>{info.moreThan500Weight}</TableCell>
              {/* <TableCell>{info.moreThan500Weight / info.moreThan500Amount}</TableCell> */}
              <TableCell>
                {info.moreThan500Amount !== 0
                  ? (info.moreThan500Weight / info.moreThan500Amount).toFixed(1)
                  : "0"}
              </TableCell>

              <TableCell className="bg-blue-100">
                {info.lessThan500Amount}
              </TableCell>
              <TableCell className="bg-blue-100">
                {info.lessThan500Weight}
              </TableCell>
              {/* <TableCell className="bg-blue-100">{(info.lessThan500Weight / info.lessThan500Amount).toFixed(1)}</TableCell> */}
              <TableCell className="bg-blue-100">
                {info.lessThan500Amount !== 0
                  ? (info.lessThan500Weight / info.lessThan500Amount).toFixed(1)
                  : "0"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
