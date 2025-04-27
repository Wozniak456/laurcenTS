"use client";
import LocationComponent from "@/components/DailyFeedWeight/location-info";
import * as feedingActions from "@/actions/feeding";
import * as stockingActions from "@/actions/stocking";
import * as actions from "@/actions";
import {
  calculationAndFeed,
  calculationAndFeedExtended,
} from "@/types/app_types";
import PriorityForm from "@/components/DailyFeedWeight/priority-form";
import PercentFeedingForm from "@/components/DailyFeedWeight/percent-feeding-form";
import { Modal, ModalContent } from "@nextui-org/react";
import React, { useState } from "react";

type LocationSummary = {
  uniqueItemId: number;
  totalFeed: number;
};

type subRow = {
  qty?: number;
  feed: {
    id?: number;
    name?: string;
  };
  item: {
    id?: number;
    name?: string;
  };
};

type Row = {
  location?: {
    id: number;
    name: string;
    percent_feeding?: number;
  };
  rows?: subRow[];
};

interface Feeding {
  feedType: string;
  feedName?: string;
  feedId?: number;
  feedings?: { [time: string]: { feeding?: string; editing?: string } };
}

interface FeedingInfo {
  date: string;
  locId: number;
  locName: string;
  rowCount?: number;
  feedings?: Feeding[];
  batch?: {
    id: number;
    name: string;
  };
}

interface DailyFeedWeightProps {
  data: FeedingInfo[];
  items: {
    id: number;
    name: string;
    feedtypes: {
      id: number;
      name: string;
    } | null;
  }[];
  date: string;
}

export default function DailyFeedWeight({
  data,
  items,
  date,
}: DailyFeedWeightProps) {
  /*console.log(
    "Lines data received in DailyFeedWeight:",
    JSON.stringify(lines, null, 2)
  );*/
  const aggregatedData: { [key: string]: number } = {};

  // Group data by locId and locName to merge feedings for the same location
  const groupedData: FeedingInfo[] = [];
  const locMap = new Map<string, FeedingInfo>();

  data.forEach((row) => {
    if (!row.locId || !row.locName) return;
    const key = `${row.locId}__${row.locName}`;
    if (!locMap.has(key)) {
      // Clone the row and initialize feedings array
      locMap.set(key, { ...row, feedings: [...(row.feedings ?? [])] });
    } else {
      // Merge feedings into the existing entry
      const existing = locMap.get(key)!;
      existing.feedings = [
        ...(existing.feedings ?? []),
        ...(row.feedings ?? []),
      ];
      // Optionally, update rowCount if needed
      if (row.rowCount && existing.rowCount) {
        existing.rowCount += row.rowCount;
      } else if (row.rowCount) {
        existing.rowCount = row.rowCount;
      }
      // For other properties (batch, date, etc.), keep the first occurrence (do nothing)
    }
  });
  groupedData.push(...Array.from(locMap.values()));

  // Deduplicate feedings by feedType and feedName within each location
  groupedData.forEach((row) => {
    if (!row.feedings) return;
    const feedingMap = new Map<string, Feeding>();
    row.feedings.forEach((feeding) => {
      const key = `${feeding.feedType}__${feeding.feedName}`;
      if (!feedingMap.has(key)) {
        // Clone the feeding object
        feedingMap.set(key, {
          ...feeding,
          feedings: { ...(feeding.feedings ?? {}) },
        });
      } else {
        // Merge feedings maps (by time slot)
        const existing = feedingMap.get(key)!;
        existing.feedings = {
          ...existing.feedings,
          ...(feeding.feedings ?? {}),
        };
      }
    });
    row.feedings = Array.from(feedingMap.values());
  });

  // Build summary table: only use the first feeding value per item per location
  groupedData.forEach((row) => {
    (row.feedings ?? []).forEach((feeding: Feeding) => {
      const itemName = feeding.feedName;
      let firstFeeding = "";
      if (feeding.feedings) {
        const first = Object.values(feeding.feedings).find(
          (f) =>
            f.feeding !== undefined && f.feeding !== null && f.feeding !== ""
        );
        if (first && first.feeding)
          firstFeeding = parseFloat(first.feeding).toFixed(2);
      }
      if (itemName !== undefined && firstFeeding !== "") {
        if (!aggregatedData[itemName]) {
          aggregatedData[itemName] = parseFloat(firstFeeding);
        } else {
          aggregatedData[itemName] += parseFloat(firstFeeding);
        }
      }
    });
  });

  const [openPriority, setOpenPriority] = useState<null | {
    itemName: string;
    qty: number;
  }>(null);
  const [openPercent, setOpenPercent] = useState<null | {
    locationName: string;
    locationId: number;
    percent: number | null;
  }>(null);

  return (
    <>
      <div className="flex justify-between my-4 mx-8">
        <h1 className="text-lg font-bold">Наважка на 1 годування</h1>
        <h1 className="text-lg font-bold">Зведена таблиця</h1>
      </div>

      <div className="flex justify-around min-h-screen content-start">
        <table className="w-5/7 bg-white rounded-lg shadow-lg">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border p-4">Басейн</th>
              <th className="border p-4">% відх.</th>
              <th className="border p-4">Калк. к-сть, г</th>
              <th className="border p-4">Розр. к-сть, г</th>
              <th className="border p-4">Тип корму</th>
              <th className="border p-4">Корм</th>
            </tr>
          </thead>
          <tbody>
            {groupedData.map((row) =>
              row.feedings && row.feedings.length > 0 ? (
                <LocationComponent key={row.locId} row={row} items={items} />
              ) : null
            )}
          </tbody>
        </table>

        <table className="w-2/9 bg-white rounded-lg shadow-lg self-start">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border p-4">Корм</th>
              <th className="border p-4">Кількість</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(aggregatedData).map(([itemName, qty]) => (
              <tr key={itemName}>
                <td
                  className="px-4 h-10 border border-gray-400 cursor-pointer hover:underline"
                  onClick={() => setOpenPriority({ itemName, qty })}
                >
                  {itemName}
                </td>
                <td className="px-4 h-10 border border-gray-400  text-right">
                  {qty.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* PriorityForm Modal */}
      <Modal
        isOpen={!!openPriority}
        onClose={() => setOpenPriority(null)}
        placement="top-center"
      >
        <ModalContent>
          {() =>
            openPriority && (
              <PriorityForm
                location={undefined}
                items={items}
                item={{
                  qty: openPriority.qty,
                  feed: { name: openPriority.itemName },
                  item: { name: openPriority.itemName },
                }}
              />
            )
          }
        </ModalContent>
      </Modal>
      {/* PercentFeedingForm Modal (for summary table, you may want to add a clickable cell for percent if you show it) */}
      {/* Example: <td onClick={() => setOpenPercent({ locationName, locationId, percent })}>...</td> */}
      {/* <Modal isOpen={!!openPercent} onClose={() => setOpenPercent(null)} placement="top-center">
        <ModalContent>
          {() =>
            openPercent && (
              <PercentFeedingForm
                location={{
                  id: openPercent.locationId,
                  name: openPercent.locationName,
                  percent_feeding: openPercent.percent,
                }}
              />
            )
          }
        </ModalContent>
      </Modal> */}
    </>
  );
}
