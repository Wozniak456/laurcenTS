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
import { fetchPercentFeeding } from "@/actions/periodicServer";
import DailyFeedWeightClient from "./daily-feed-weight-client";
import { fetchPercentFeedingsForLocations } from "@/actions/periodicServer";

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

// Utility to convert Decimal values to numbers
function toPlainNumberMap(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      typeof v === "object" && v !== null && typeof v.toNumber === "function"
        ? v.toNumber()
        : Number(v),
    ])
  );
}

export default async function DailyFeedWeight({
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

  // Collect all unique location IDs
  const locationIds = Array.from(new Set(groupedData.map((row) => row.locId)));
  const percentFeedingMapRaw = await fetchPercentFeedingsForLocations(
    locationIds,
    date
  );
  const percentFeedingMap = toPlainNumberMap(percentFeedingMapRaw);

  return (
    <DailyFeedWeightClient
      groupedData={groupedData}
      items={items}
      date={date}
      percentFeedingMap={percentFeedingMap}
      aggregatedData={aggregatedData}
    />
  );
}
