"use client";

import React, {
  ChangeEvent,
  ChangeEventHandler,
  use,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import RowForFeeding from "./RowForFeeding";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { fetchPercentFeeding } from "@/actions/periodicServer";
import { fetchFeedingRow } from "@/actions/feeding";
import { feedBatch } from "@/actions";

interface DaySummaryProps {
  data: FeedingInfo[];
  areas: {
    id: number;
    name: string;
    productionlines: {
      id: number;
      name: string;
      pools: {
        id: number;
        name: string;
        locations: {
          id: number;
          name: string;
        }[];
      }[];
    }[];
  }[];
  today: string;
  times: {
    id: number;
    time: string;
  }[];
  feeds: {
    id: number;
    name: string;
    feedtypes: {
      id: number;
      name: string;
    } | null;
  }[];
  percentFeedingMap: Record<number, number>;
  feedBatchAction: typeof feedBatch;
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

interface Feeding {
  feedType: string;
  feedName?: string;
  feedId?: number;
  feedings?: { [time: string]: { feeding?: string; editing?: string } };
}

export default function DaySummaryContent({
  data,
  areas,
  today,
  times,
  feeds,
  percentFeedingMap,
  feedBatchAction,
}: DaySummaryProps) {
  // Restore scroll position after reload
  useEffect(() => {
    const savedPosition = sessionStorage.getItem("scrollPosition");
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition));
      sessionStorage.removeItem("scrollPosition"); // Clear after use
    }
  }, []);

  // useEffect(() => {
  //   data.map((data1) => {
  //     console.log("loc: ", data1.locId, data1.feedings);
  //     // console.log(data1.feedings?.length)
  //   });
  // }, [data]);

  const getRowCount = (() => {
    const renderedRows = new Map<number, number>();

    return (data: { feedings?: Array<any> }, locId: number) => {
      const rowCount = data.feedings?.length; // Отримуємо кількість рядків з data.feedings

      if (rowCount && rowCount > 1) {
        if (!renderedRows.has(locId)) {
          renderedRows.set(locId, rowCount);
          return rowCount; // Повертаємо кількість рядків
        }
        return 0; // Вже відрендерено
      }
      return 1; // Якщо тільки один рядок, повертаємо 1
    };
  })();

  const [showTextForPool, setShowTextForPool] = useState<number | null>(null);
  const [addedNewFeed, setAddedNewFeed] = useState<number | undefined>(
    undefined
  );
  const [feedingsData, setFeedingsData] = useState(data);

  // Function to update only a single row's feedings in state
  const handleRowUpdate = async (
    locId: number,
    feedId: number,
    newFeedings: any
  ) => {
    // If newFeedings is empty or falsy, fetch the latest planned feedings from the backend
    if (!newFeedings || Object.keys(newFeedings).length === 0) {
      // Fetch the latest planned feedings for this row from the backend
      const today = feedingsData.find((r) => r.locId === locId)?.date || "";
      const feedingsObj =
        feedingsData.find((r) => r.locId === locId)?.feedings?.[0]?.feedings ||
        {};
      const times = Object.keys(feedingsObj);
      const refreshedRow = await fetchFeedingRow({
        date: today,
        location_id: locId,
        item_id: feedId,
        times: times.map((time) => ({ id: 0, time: `${time}:00` })),
      });
      setFeedingsData((prev) =>
        prev.map((row) =>
          row.locId === locId
            ? {
                ...row,
                feedings:
                  refreshedRow &&
                  refreshedRow.feedings &&
                  refreshedRow.feedings.length > 0
                    ? [refreshedRow.feedings].flat()
                    : row.feedings, // Do NOT reset to empty, keep previous feedings
              }
            : row
        )
      );
      return;
    }
    // Otherwise, update the feedings for the specified feedId
    setFeedingsData((prev) =>
      prev.map((row) =>
        row.locId === locId
          ? {
              ...row,
              feedings: row.feedings?.map((feeding) =>
                feeding.feedId === feedId
                  ? { ...feeding, feedings: newFeedings }
                  : feeding
              ),
            }
          : row
      )
    );
  };

  // Функція для додавання нового корму до feedings
  const handleAddFeedClick = (locId: number, feedId: number) => {
    const newFeed = feeds.find((feed) => feed.id === feedId);
    if (newFeed) {
      const updatedData = feedingsData.map((feedingInfo) => {
        if (feedingInfo.locId === locId) {
          // Check if this feed already exists in the location's feedings
          const isDuplicate = feedingInfo.feedings?.some(
            (feeding) =>
              feeding.feedId === newFeed.id || // Check by feed ID
              (feeding.feedType === newFeed.feedtypes?.name &&
                feeding.feedName === newFeed.name) // Check by name and type as fallback
          );

          if (isDuplicate) {
            // If duplicate found, don't add and keep existing feedings
            return feedingInfo;
          }

          const updatedFeedings = [...(feedingInfo.feedings || [])];
          updatedFeedings.push({
            feedType: newFeed.feedtypes?.name ?? "",
            feedName: newFeed.name,
            feedId: newFeed.id,
            feedings: Object.fromEntries(
              times.map(({ time }) => {
                const hours = Number(time.split(":")[0]);
                return [hours.toString(), { feeding: "0", editing: "" }];
              })
            ),
          });
          return {
            ...feedingInfo,
            feedings: updatedFeedings,
            rowCount: updatedFeedings.length, // Оновлюємо rowCount
          };
        }
        return feedingInfo;
      });

      setFeedingsData(updatedData);
      setShowTextForPool(locId);
      setAddedNewFeed(undefined);
    }
  };

  return (
    <>
      {areas
        .filter((area) =>
          area.productionlines.some((line) =>
            line.pools.some((pool) =>
              pool.locations.some((loc) =>
                data.some((row) => row.locId === loc.id)
              )
            )
          )
        )
        .map((area) => (
          <div key={area.id} className="mb-8">
            <div className="max-w-[1650px] mx-auto">
              <div className="text-lg font-bold bg-blue-200 p-2 mb-2 rounded">
                {area.name}
              </div>
            </div>
            {area.productionlines
              .filter((line) =>
                line.pools.some((pool) =>
                  pool.locations.some((loc) =>
                    data.some((row) => row.locId === loc.id)
                  )
                )
              )
              .map((line) => (
                <table
                  key={line.id}
                  className="border-collapse border w-full max-w-[1600px] mx-auto mb-4 text-sm"
                >
                  <thead>
                    <tr>
                      <th
                        colSpan={2 * times.length + 3}
                        className="px-4 py-2 bg-blue-100"
                      >
                        {line.name}
                      </th>
                      <th className="px-4 py-2 bg-blue-100">
                        {today.slice(5)}
                      </th>
                    </tr>
                    <tr>
                      <th className="border p-2 col-bassein sticky left-0 z-10 bg-white">
                        Басейн
                      </th>
                      <th className="border p-2 col-feedtype">Вид корму</th>
                      <th className="border p-2 col-feedname">Назва корму</th>
                      {times.map((time, index) => (
                        <React.Fragment key={index}>
                          <th className="border p-2 col-time">{time.time}</th>
                          <th className="border col-correction">Коригування</th>
                        </React.Fragment>
                      ))}
                      <th className="border p-2 col-action">Годувати</th>
                    </tr>
                  </thead>
                  <tbody>
                    {line.pools.map((pool) =>
                      pool.locations.map((loc, index) => {
                        const dataForPool = feedingsData.find(
                          (row) => row.locId === loc.id
                        );
                        const feedings = dataForPool?.feedings;
                        return (
                          <React.Fragment key={index}>
                            {feedings?.map((feeding, feedingIndex) => {
                              return (
                                <RowForFeeding
                                  key={feedingIndex}
                                  locInfo={{
                                    id: loc.id,
                                    name: loc.name,
                                  }}
                                  rowData={feeding}
                                  times={times}
                                  rowCount={
                                    feedingIndex === 0 && dataForPool
                                      ? getRowCount(dataForPool, loc.id)
                                      : 0
                                  }
                                  today={today}
                                  batch={dataForPool?.batch}
                                  allLocationFeedings={feedings}
                                  percentFeeding={
                                    percentFeedingMap[loc.id] ?? 0
                                  }
                                  onRowUpdate={handleRowUpdate}
                                  feedBatchAction={feedBatchAction}
                                  areaId={area.id}
                                />
                              );
                            })}

                            {feedings?.length && feedings.length > 0 ? (
                              <tr>
                                <td className="text-center text-md bg-gray-100">
                                  <Popover
                                    placement="bottom"
                                    showArrow
                                    offset={10}
                                  >
                                    <PopoverTrigger>
                                      <button className="py-0" color="primary">
                                        Додати корм
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[240px]">
                                      <div className="my-2 flex flex-col gap-2 w-full">
                                        <Select
                                          label="Корм"
                                          placeholder="Оберіть корм"
                                          className="max-w-xs"
                                          onChange={(e) =>
                                            setAddedNewFeed(
                                              Number(e.target.value)
                                            )
                                          }
                                        >
                                          {feeds
                                            .filter((feed) => {
                                              // Get current location's feedings
                                              const locationFeedings =
                                                feedings || [];
                                              // Check if this feed is already used
                                              return !locationFeedings.some(
                                                (feeding) =>
                                                  feeding.feedId === feed.id ||
                                                  (feeding.feedType ===
                                                    feed.feedtypes?.name &&
                                                    feeding.feedName ===
                                                      feed.name)
                                              );
                                            })
                                            .map((feed) => (
                                              <SelectItem
                                                key={feed.id}
                                                value={feed.id}
                                              >
                                                {feed.name}
                                              </SelectItem>
                                            ))}
                                        </Select>
                                        {addedNewFeed ? (
                                          <Button
                                            onClick={() =>
                                              handleAddFeedClick(
                                                loc.id,
                                                addedNewFeed
                                              )
                                            }
                                          >
                                            Додати
                                          </Button>
                                        ) : null}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </td>
                              </tr>
                            ) : null}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              ))}
          </div>
        ))}
    </>
  );
}
