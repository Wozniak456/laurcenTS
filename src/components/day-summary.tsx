"use client";

import React, {
  ChangeEvent,
  ChangeEventHandler,
  use,
  useEffect,
  useMemo,
  useState,
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

interface DaySummaryProps {
  data: FeedingInfo[];
  lines: {
    id: number;
    name: string;
    pools: {
      id: number;
      name: string;
      percent_feeding: number | null;
      locations: {
        id: number;
        name: string;
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
  lines,
  today,
  times,
  feeds,
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
  const [feedingsData, setFeedingsData] = useState(data); // Локальний стан для збереження даних кормів

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
      {lines.map((line) => (
        <table
          key={line.id}
          className="border-collapse border w-full mb-4 text-sm w-5/6"
        >
          <thead>
            <tr>
              <th
                colSpan={2 * times.length + 3}
                className="px-4 py-2 bg-blue-100"
              >
                {line.name}
              </th>
              <th className="px-4 py-2 bg-blue-100">{today.slice(5)}</th>
            </tr>
            <tr>
              <th className="border p-2">Басейн</th>
              <th className="border p-2">Вид корму</th>
              <th className="border p-2 w-24">Назва корму</th>
              {times.map((time, index) => (
                <React.Fragment key={index}>
                  <th className="border p-2">{time.time}</th>
                  <th className="border">Коригування</th>
                </React.Fragment>
              ))}
              <th className="border p-2">Годувати</th>
            </tr>
          </thead>
          <tbody>
            {line.pools.map((pool) =>
              pool.locations.map((loc, index) => {
                const dataForPool = feedingsData.find(
                  (row) => row.locId === loc.id
                );

                console.log(
                  `dataForPool: ${loc.id}. ${dataForPool?.feedings} and percent feeding ${pool?.percent_feeding}`
                );
                const feedings = dataForPool?.feedings;
                return (
                  <React.Fragment key={index}>
                    {feedings?.map((feeding, feedingIndex) => (
                      <RowForFeeding
                        key={feedingIndex}
                        locInfo={{
                          id: loc.id,
                          name: loc.name,
                          percent_feeding: pool?.percent_feeding ?? 0,
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
                        onRefresh={() => {
                          // Save current scroll position to sessionStorage
                          sessionStorage.setItem(
                            "scrollPosition",
                            window.scrollY.toString()
                          );
                          window.location.reload();
                        }}
                      />
                    ))}

                    {feedings?.length && feedings.length > 0 ? (
                      <tr>
                        <td className="text-center text-md bg-gray-100">
                          <Popover placement="bottom" showArrow offset={10}>
                            <PopoverTrigger>
                              <button className="py-0" color="primary">
                                Додати корм
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[240px]">
                              <div className="my-2 flex flex-col gap-2 w-full">
                                {/* <div className="my-2 flex flex-col gap-2 w-full"> */}
                                <Select
                                  label="Корм"
                                  placeholder="Оберіть корм"
                                  className="max-w-xs"
                                  onChange={(e) =>
                                    setAddedNewFeed(Number(e.target.value))
                                  }
                                >
                                  {feeds
                                    .filter((feed) => {
                                      // Get current location's feedings
                                      const locationFeedings = feedings || [];
                                      // Check if this feed is already used
                                      return !locationFeedings.some(
                                        (feeding) =>
                                          feeding.feedId === feed.id ||
                                          (feeding.feedType ===
                                            feed.feedtypes?.name &&
                                            feeding.feedName === feed.name)
                                      );
                                    })
                                    .map((feed) => (
                                      <SelectItem key={feed.id} value={feed.id}>
                                        {feed.name}
                                      </SelectItem>
                                    ))}
                                </Select>
                                {/* </div> */}
                                {addedNewFeed ? (
                                  <Button
                                    onClick={() =>
                                      handleAddFeedClick(loc.id, addedNewFeed)
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
    </>
  );
}
