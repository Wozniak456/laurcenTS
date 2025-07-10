import Link from "next/link";
import React from "react";
import { db } from "@/db";
import DailyFeedWeightPage from "@/components/DailyFeedWeight/daily-feed-weight";
import * as feedingActions from "@/actions/feeding";
import * as stockingActions from "@/actions/stocking";
import * as actions from "@/actions";
import DaySummaryContent from "@/components/day-summary";
import ExportButton from "@/components/dayFeedingTableToPrint";
//import { DateTimeFormatOptions } from "intl";
import { addDays, format } from "date-fns";
import { uk } from "date-fns/locale"; // If you need specific Ukrainian locale formatting
import { request } from "http";
import { fetchPercentFeedingsForLocations } from "@/actions/periodicServer";
import { feedBatch } from "@/actions";
import {
  getActivePriorityItemForDate,
  getActivePrioritiesForDate,
} from "@/utils/periodic";
import { getAreas } from "@/actions/crutial/getAreas";
import { getPageTitle } from "@/utils/pageTitle";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { index: string };
}): Promise<Metadata> {
  return {
    title: getPageTitle(`Годування (день ${params.index})`),
  };
}

export const dynamic = "force-dynamic";

interface DayFeedingProps {
  params: {
    index: string;
  };
}

interface LocationInfo {
  location_id: number;
  location_name: string;
  batch_id?: bigint;
  fed_today?: {
    time: string;
    quantity: number;
    hasDocument: boolean;
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

type editingType = {
  id: bigint;
  itemtransactions: {
    quantity: number;
  }[];
  hasDocument: boolean;
};

interface Feeding {
  feedType: string;
  feedName?: string;
  feedId?: number;
  feedings?: { [time: string]: { feeding?: string; editing?: string } };
}

type extraData = {
  feedType: string;
  feedName: string;
  date_time: string;
  item_id: number;
  quantity: number;
  location_id: number;
};

interface DailyFeedWeightProps {
  lines: {
    id: number;
    pools: {
      id: number;
      name: string;
      locations: {
        name: string;
        id: number;
      }[];
    }[];
  }[];
  // ... other props
}

interface NextFeedType {
  id: number;
  name: string;
  feedconnection_id: number | null;
  itemId?: number;
  itemName?: string;
}

interface FeedInfo {
  type_id: number;
  type_name: string;
  item_id: number;
  item_name: string;
  definedPrio?: boolean;
}

interface TodayCalc {
  calc: {
    id: number;
    day: number;
    date: Date;
    fish_amount_in_pool: number;
    general_weight: number;
    fish_weight: number;
    feed_per_feeding: number;
    transition_day: number | null;
    doc_id: bigint;
  } | null;
  batch: {
    batch_id: bigint | undefined;
    batch_name: string | undefined;
    qty: number | undefined;
  };
  feed: {
    item_id?: number;
    definedPrio?: number | boolean;
    type_name?: string;
    item_name?: string;
  };
  location_id: number;
  allowedToEdit: boolean;
}

interface FeedTypeInfo {
  id: number;
  name: string;
  feedconnection_id: number | null;
  itemId?: number;
  itemName?: string;
}

export default async function DayFeeding(props: DayFeedingProps) {
  const today = props.params.index;

  const currentDate: Date = new Date(today);

  const dates = datesArray(currentDate);

  const areas = await getAreas();
  const lines = areas.flatMap((area) => area.productionlines);

  const times = await db.time_table.findMany();

  const items = await db.items.findMany({
    select: {
      id: true,
      name: true,
      feedtypes: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    where: {
      item_type_id: 3,
    },
  });

  //console.log("[DEBUG] items:", JSON.stringify(items, null, 2));

  // Populate feedTypeInfo lookup table
  items.forEach((item) => {
    const feedType = item.feedtypes;
    if (feedType) {
      feedTypeInfo[item.id] = {
        id: feedType.id,
        name: feedType.name,
        itemId: item.id,
        itemName: item.name,
      };
    }
  });
  //console.log("[DEBUG] feedTypeInfo:", JSON.stringify(feedTypeInfo, null, 2));

  const prioritiesMap = await getActivePrioritiesForDate(today);

  const summary = await feedingActions.getAllSummary(lines, currentDate);

  const data = await setData(today, times, prioritiesMap);
  // Add logging for location id 40
  const dataForLoc40 = data.filter((row) => row.locId === 40);

  // Collect all unique location IDs
  const locationIds = Array.from(
    new Set(
      areas.flatMap((area) =>
        area.productionlines.flatMap((line) =>
          line.pools.flatMap((pool) => pool.locations.map((loc) => loc.id))
        )
      )
    )
  );
  const percentFeedingMap = await fetchPercentFeedingsForLocations(
    locationIds,
    today
  );

  return (
    <div className="flex flex-col justify-center ">
      <div className="flex justify-between">
        {dates.map((date) => (
          <div key={date} className="flex-shrink-0 p-2">
            <div
              className={` rounded-lg shadow p-1 hover:bg-blue-100 transition duration-200 ${
                date == today && "bg-blue-200"
              }`}
            >
              <Link href={`/summary-feeding-table/day/${date}`}>
                <span className={`text-center cursor-pointer `}>{date}</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end my-2">
        <ExportButton times={times} lines={lines} data={data} />
      </div>
      <div>*Кількість вказана у грамах</div>
      <DaySummaryContent
        data={data}
        areas={areas}
        today={today}
        times={times}
        feeds={items}
        percentFeedingMap={percentFeedingMap}
        feedBatchAction={feedBatch}
      />
      <DailyFeedWeightPage data={data} items={items} date={today} />
    </div>
  );
}

function formatDateInKiev(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const formattedMDY = new Intl.DateTimeFormat("uk-UA", options).format(date);
  //console.log("converted ", date, "into super date ", formattedMDY);
  const [day, month, year] = formattedMDY.split(".");
  return `${year}-${month}-${day}`;
}

//set dates to show on page
const datesArray = (currentDate: Date) => {
  let dates = [];
  let curDate: Date = new Date(currentDate);
  //curDate.setUTCHours(10, 0, 0, 0);
  //console.log("datez2 - calculate from ", formatDateInKiev(currentDate));
  for (let i = -4; i <= 4; i++) {
    let newDate = addDays(curDate, i);
    //newDate.setDate(currentDate.getDate() + i);
    dates.push(
      formatDateInKiev(newDate)
      //      newDate.toLocaleString("uk-ua", { timeZone: "Europe/Kiev" }).split(",")[0]
    );
    //console.log("datez2 - added", formatDateInKiev(newDate));
  }
  return dates;
};

//return an array with eaten feed and not bool
const feedingForLocation = async (locationId: number, today: Date) => {
  const startOfDay = new Date(today);
  const endOfDay = new Date(today);

  endOfDay.setHours(23, 59, 59, 999);

  const query = await db.documents.findMany({
    select: {
      id: true,
      date_time: true,
      itemtransactions: {
        select: {
          location_id: true,
          quantity: true,
          itembatches: {
            select: {
              items: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
        where: {
          location_id: locationId,
        },
      },
    },
    where: {
      doc_type_id: 9,
      date_time: {
        lte: endOfDay,
        gte: startOfDay,
      },
      location_id: locationId,
    },
  });

  // Debug log for location 50
  const safeStringify = (obj: any) =>
    JSON.stringify(
      obj,
      (key, value) => (typeof value === "bigint" ? value.toString() : value),
      2
    );
  if (locationId === 50) {
    //console.log("[feedingForLocation] Query result:", safeStringify(query));
  }

  const timeQtyArray: {
    time: string;
    quantity: number;
    hasDocument: boolean;
    item_id: number;
  }[] = [];

  for (const record of query) {
    const time = record.date_time
      .toISOString()
      .split("T")[1]
      .split(":")
      .slice(0, 2)
      .join(":");

    // Add this log:
    if (locationId === 50) {
      //console.log(
      //`[feedingForLocation] record at ${time}:`,
      //safeStringify(record)
      //);
    }

    // Group transactions by item_id
    const transactionsByItem = record.itemtransactions.reduce(
      (acc: Record<number, number>, transaction) => {
        const itemId = transaction.itembatches?.items?.id;
        if (itemId) {
          if (!acc[itemId]) {
            acc[itemId] = 0;
          }
          acc[itemId] += transaction.quantity;
        }
        return acc;
      },
      {}
    );

    // Create entries for each item
    Object.entries(transactionsByItem).forEach(([itemId, quantity]) => {
      const existingTime = timeQtyArray.find(
        (item) => item.time === time && item.item_id === Number(itemId)
      );

      if (existingTime) {
        existingTime.quantity += quantity;
      } else {
        timeQtyArray.push({
          time,
          quantity,
          hasDocument: true,
          item_id: Number(itemId),
        });
      }
    });
  }

  return timeQtyArray;
};

// Helper to sum all itemtransactions quantities for a given editing array
function sumEditingQuantities(editingArr: any[]): number {
  if (!Array.isArray(editingArr) || editingArr.length === 0) return 0;
  return editingArr.reduce((sum: number, doc: any) => {
    if (Array.isArray(doc.itemtransactions)) {
      return (
        sum +
        doc.itemtransactions.reduce(
          (s: number, t: any) => s + (t.quantity || 0),
          0
        )
      );
    }
    return sum;
  }, 0);
}

const setData = async (
  today: string,
  times: { id: number; time: string }[],
  prioritiesMap: Record<number, Record<number, any>>
) => {
  console.log("[DEBUG] setData: function called for today", today);
  const currentDate = new Date(today);
  const areas = await getAreas();
  let data: FeedingInfo[] = [];
  const getEdited = async (hours: number, locId: number, itemId: number) => {
    const todayDate = new Date(today);
    todayDate.setUTCHours(hours, 0, 0, 0);

    // Find documents for this specific item and time
    const fedAlready = await db.documents.findMany({
      select: {
        id: true,
        itemtransactions: {
          select: {
            quantity: true,
          },
          where: {
            location_id: locId,
            itembatches: {
              items: {
                id: itemId,
              },
            },
          },
        },
      },
      where: {
        location_id: locId,
        doc_type_id: 9,
        date_time: todayDate,
        itemtransactions: {
          some: {
            itembatches: {
              items: {
                id: itemId,
              },
            },
          },
        },
      },
    });

    // Only set hasDocument to true if we found documents with transactions for this specific item
    return fedAlready.map((doc) => ({
      ...doc,
      hasDocument: doc.itemtransactions.length > 0,
      itemtransactions: doc.itemtransactions.length
        ? doc.itemtransactions
        : [{ quantity: 0 }],
    }));
  };

  for (const area of areas) {
    for (const line of area.productionlines) {
      for (const pool of line.pools) {
        for (const loc of pool.locations) {
          const isPoolFilled = await actions.isFilled(loc.id, today);
          if (!isPoolFilled) continue;

          let locationInfo: LocationInfo = {
            location_id: loc.id,
            location_name: loc.name,
            fed_today: await feedingForLocation(loc.id, currentDate),
          };

          let todayCalc: TodayCalc = {
            calc: null,
            batch: {
              batch_id: BigInt(0),
              batch_name: "",
              qty: 0,
            },
            feed: {
              item_id: undefined,
              definedPrio: undefined,
              type_name: undefined,
              item_name: undefined,
            },
            location_id: 0,
            allowedToEdit: false,
          };
          let prevFeedTypeInfo: FeedTypeInfo | undefined = undefined;
          let nextFeedType: NextFeedType | null = null;
          let transitionStartCalc = null;

          let extraFilledRows: Record<number, extraData[]> = {};

          if (isPoolFilled) {
            const calculated = await stockingActions.calculationForLocation(
              loc.id,
              today
            );
            if (calculated) {
              todayCalc = {
                ...todayCalc,
                ...calculated,
              };
            }

            if (loc.id === 41) {
              console.log(
                "[DEBUG][LOCATION 41] setData: checking transition_day and doc_id",
                {
                  transition_day: todayCalc?.calc?.transition_day,
                  doc_id: todayCalc?.calc?.doc_id,
                  fish_weight: todayCalc?.calc?.fish_weight,
                  batch_id: todayCalc.batch?.batch_id,
                  todayCalc,
                  locId: loc.id,
                }
              );
            }
            // Always recalculate feed item for current feed type using prioritiesMap, regardless of transition_day
            if (todayCalc?.calc?.fish_weight && todayCalc.batch?.batch_id) {
              const currentFeedType = await stockingActions.getFeedType(
                todayCalc.calc.fish_weight
              );
              if (currentFeedType) {
                if (loc.id === 41) {
                  console.log("=== [DEBUG][PRIORITY LOOKUP] ===");
                  console.log("[DEBUG] Lookup keys:", {
                    locId: loc.id,
                    feedTypeId: currentFeedType.id,
                  });
                  console.log(
                    "[DEBUG] prioritiesMap[41]:",
                    JSON.stringify(prioritiesMap[41], null, 2)
                  );
                  if (prioritiesMap[41]) {
                    console.log(
                      "[DEBUG] prioritiesMap[41] keys:",
                      Object.keys(prioritiesMap[41])
                    );
                  }
                }
                const prio = prioritiesMap[loc.id]?.[currentFeedType.id];
                let feedItem = null;
                if (prio && prio.item_id && prio.items?.name) {
                  feedItem = {
                    item_id: prio.item_id,
                    item_name: prio.items.name,
                    definedPrio: true,
                  };
                } else {
                  if (loc.id === 41) {
                    console.log(
                      "[DEBUG][LOCATION 41] setData: fallback to first item of feed type (always)",
                      { locId: loc.id, feedTypeId: currentFeedType.id }
                    );
                  }
                  const itemsOfType = await db.items.findMany({
                    where: { feed_type_id: currentFeedType.id },
                    orderBy: { name: "asc" },
                  });
                  if (itemsOfType.length > 0) {
                    feedItem = {
                      item_id: itemsOfType[0].id,
                      item_name: itemsOfType[0].name,
                      definedPrio: false,
                    };
                  }
                }
                if (feedItem) {
                  const updatedFeed: FeedInfo = {
                    type_id: currentFeedType.id,
                    type_name: currentFeedType.name,
                    item_id: feedItem.item_id,
                    item_name: feedItem.item_name,
                    definedPrio: feedItem.definedPrio,
                  };
                  todayCalc = {
                    ...todayCalc,
                    feed: updatedFeed,
                  };
                  if (loc.id === 41) {
                    console.log(
                      "[DEBUG][LOCATION 41] FINAL FEED ITEM:",
                      feedItem
                    );
                    console.log(
                      "[DEBUG][LOCATION 41] todayCalc.feed:",
                      todayCalc.feed
                    );
                  }
                }
              }
            }

            if (
              todayCalc?.calc?.transition_day !== null &&
              todayCalc?.calc?.doc_id
            ) {
              if (loc.id === 41) {
                console.log(
                  "[DEBUG][LOCATION 41] setData: inside transition_day/doc_id block",
                  {
                    fish_weight: todayCalc?.calc?.fish_weight,
                    batch_id: todayCalc.batch?.batch_id,
                  }
                );
              }
              if (todayCalc?.calc?.fish_weight && todayCalc.batch?.batch_id) {
                // Always use periodic priority logic for planned/scheduled items
                const currentFeedType =
                  todayCalc?.calc?.fish_weight && todayCalc.batch?.batch_id
                    ? await stockingActions.getFeedType(
                        todayCalc.calc.fish_weight
                      )
                    : null;
                if (currentFeedType) {
                  if (loc.id === 41) {
                    console.log("=== [DEBUG][PRIORITY LOOKUP] ===");
                    console.log("[DEBUG] Lookup keys:", {
                      locId: loc.id,
                      feedTypeId: currentFeedType.id,
                    });
                    console.log(
                      "[DEBUG] prioritiesMap[41]:",
                      JSON.stringify(prioritiesMap[41], null, 2)
                    );
                    if (prioritiesMap[41]) {
                      console.log(
                        "[DEBUG] prioritiesMap[41] keys:",
                        Object.keys(prioritiesMap[41])
                      );
                    }
                  }
                  const prio = prioritiesMap[loc.id]?.[currentFeedType.id];
                  let feedItem = null;
                  if (prio && prio.item_id && prio.items?.name) {
                    feedItem = {
                      item_id: prio.item_id,
                      item_name: prio.items.name,
                      definedPrio: true,
                    };
                  } else {
                    if (loc.id === 41) {
                      console.log(
                        "[DEBUG][LOCATION 41] setData: fallback to first item of feed type (always)",
                        { locId: loc.id, feedTypeId: currentFeedType.id }
                      );
                    }
                    const itemsOfType = await db.items.findMany({
                      where: { feed_type_id: currentFeedType.id },
                      orderBy: { name: "asc" },
                    });
                    if (itemsOfType.length > 0) {
                      feedItem = {
                        item_id: itemsOfType[0].id,
                        item_name: itemsOfType[0].name,
                        definedPrio: false,
                      };
                    }
                  }
                  if (feedItem) {
                    const updatedFeed: FeedInfo = {
                      type_id: currentFeedType.id,
                      type_name: currentFeedType.name,
                      item_id: feedItem.item_id,
                      item_name: feedItem.item_name,
                      definedPrio: feedItem.definedPrio,
                    };
                    todayCalc = {
                      ...todayCalc,
                      feed: updatedFeed,
                    };
                    if (loc.id === 41) {
                      console.log(
                        "[DEBUG][LOCATION 41] FINAL FEED ITEM:",
                        feedItem
                      );
                      console.log(
                        "[DEBUG][LOCATION 41] todayCalc.feed:",
                        todayCalc.feed
                      );
                    }
                  }
                }
              }

              // Get the previous feed type based on fish weight
              const fishId = 13; // Number(todayCalc.batch?.item_id) || - I will update correct later6
              const prevFeedType = await db.feedtypes.findFirst({
                select: {
                  id: true,
                  name: true,
                  feedconnection_id: true,
                },
                where: {
                  feedconnections: {
                    fish_id: fishId,
                    to_fish_weight: {
                      lt: todayCalc.calc?.fish_weight || 0,
                    },
                  },
                },
                orderBy: {
                  feedconnections: {
                    to_fish_weight: "desc",
                  },
                },
              });

              if (prevFeedType) {
                // Try to use prioritiesMap for previous feed type
                const prevPrio = prioritiesMap[loc.id]?.[prevFeedType.id];
                if (prevPrio && prevPrio.item_id && prevPrio.items?.name) {
                  prevFeedTypeInfo = {
                    id: prevFeedType.id,
                    name: prevFeedType.name,
                    feedconnection_id: prevFeedType.feedconnection_id,
                    itemId: prevPrio.item_id,
                    itemName: prevPrio.items.name,
                  };
                } else {
                  const prevFeedItem = await actions.getItemPerType(
                    prevFeedType.id,
                    loc.id
                  );
                  if (prevFeedItem) {
                    prevFeedTypeInfo = {
                      id: prevFeedType.id,
                      name: prevFeedType.name,
                      feedconnection_id: prevFeedType.feedconnection_id,
                      itemId: prevFeedItem.item_id,
                      itemName: prevFeedItem.item_name,
                    };
                  }
                }
              }

              // Initialize editings object
              let editings: {
                [locId: number]: {
                  [itemId: number]: {
                    [time: string]: editingType[];
                  };
                };
              } = {};

              // Define itemIds array here
              const itemIds = [
                todayCalc?.feed?.item_id,
                prevFeedTypeInfo?.itemId,
              ].filter((itemId): itemId is number => !!itemId); // Фільтруємо `undefined`

              // Process each time slot
              await Promise.all(
                times
                  .sort(
                    (a, b) =>
                      Number(a.time.split(":")[0]) -
                      Number(b.time.split(":")[0])
                  )
                  .map(async (time) => {
                    const hours = Number(time.time.split(":")[0]);

                    for (const itemId of itemIds) {
                      if (!itemId) {
                        if (loc.id === 50) {
                          //console.log(
                          //`[DEBUG] Skipping because !itemId: hours=${hours}, itemId=${itemId}, locId=${loc.id}`
                          //);
                        }
                        continue; // Skip if itemId is undefined
                      }

                      // Get the current feed type info
                      const currentFeedTypeInfo = feedTypeInfo[itemId];
                      if (!currentFeedTypeInfo) {
                        if (loc.id === 50) {
                          //console.log(
                          //`[DEBUG] Skipping because !currentFeedTypeInfo: hours=${hours}, itemId=${itemId}, locId=${loc.id}`
                          //);
                        }
                        continue; // Skip if no feed type info
                      }

                      // Get the previous feed type info
                      const prevFeedTypeInfo = feedTypeInfo[itemId];
                      if (!prevFeedTypeInfo) {
                        if (loc.id === 50) {
                          //console.log(
                          //`[DEBUG] Skipping because !prevFeedTypeInfo: hours=${hours}, itemId=${itemId}, locId=${loc.id}`
                          //);
                        }
                        continue; // Skip if no previous feed type info
                      }

                      if (loc.id === 50 && hours === 22) {
                        //console.log(
                        //`Checking hours: ${hours} location_id: ${loc.id} itemid: ${itemId}`
                        //);
                      }
                      const editing = await getEdited(hours, loc.id, itemId);
                      if (loc.id === 50) {
                        //console.log(
                        //`hours: ${hours} location_id: ${loc.id} itemid: ${itemId}`
                        //);
                        editing.map((editing1) => {
                          //console.log(editing1.itemtransactions);
                        });
                      }
                      // Ініціалізуємо вкладені об'єкти, якщо їх немає
                      if (!editings[loc.id]) {
                        editings[loc.id] = {};
                      }
                      if (!editings[loc.id][itemId]) {
                        editings[loc.id][itemId] = {};
                      }
                      if (!editings[loc.id][itemId][hours]) {
                        editings[loc.id][itemId][hours] = [];
                      }

                      // Додаємо значення до editings
                      editings[loc.id][itemId][hours] = editing;
                    }
                  })
              );

              extraFilledRows = await getExtraData(
                loc.id,
                today,
                prevFeedTypeInfo?.itemId,
                todayCalc?.feed?.item_id
              );

              const transition = todayCalc?.calc?.transition_day;

              const feedingAmountForPrev =
                transition && todayCalc?.calc?.feed_per_feeding
                  ? todayCalc.calc.feed_per_feeding * (1 - transition * 0.2)
                  : undefined;

              const feedingAmountForToday =
                transition && todayCalc?.calc?.feed_per_feeding
                  ? todayCalc.calc.feed_per_feeding * (transition * 0.2)
                  : undefined;

              // Створення загального об'єкта для басейна
              const feedings: Feeding[] = [];

              let feedingsCount = 0;

              //якщо є перехід на новий корм і є попередній обрахунок
              if (transition && prevFeedTypeInfo && todayCalc?.feed) {
                // First line - previous feed type with decreasing amount
                feedings.push({
                  feedType: prevFeedTypeInfo!.name || "",
                  feedName: prevFeedTypeInfo!.itemName || "",
                  feedId: prevFeedTypeInfo!.itemId,
                  feedings: Object.fromEntries(
                    times.map(({ time }) => {
                      const hours = Number(time.split(":")[0]);
                      const itemId = prevFeedTypeInfo!.itemId;
                      if (typeof itemId !== "number")
                        return [
                          hours.toString(),
                          { feeding: "", editing: "", hasDocument: false },
                        ];
                      const editing =
                        editings[loc.id]?.[itemId!]?.[hours] || [];
                      const totalEditing = sumEditingQuantities(editing);
                      return [
                        hours.toString(),
                        {
                          feeding: feedingAmountForPrev?.toFixed(1),
                          editing:
                            totalEditing !== 0
                              ? (totalEditing * 1000).toFixed(1)
                              : "",
                          hasDocument: editing[0]?.hasDocument || false,
                        },
                      ];
                    })
                  ),
                });

                // Second line - current feed type with increasing amount
                feedings.push({
                  feedType: todayCalc.feed.type_name || "",
                  feedName: todayCalc.feed.item_name || "",
                  feedId: todayCalc.feed.item_id,
                  feedings: Object.fromEntries(
                    times.map(({ time }) => {
                      const hours = Number(time.split(":")[0]);
                      const itemId = todayCalc.feed.item_id;
                      if (typeof itemId !== "number")
                        return [
                          hours.toString(),
                          { feeding: "", editing: "", hasDocument: false },
                        ];
                      const editing =
                        editings[loc.id]?.[itemId!]?.[hours] || [];
                      const totalEditing = sumEditingQuantities(editing);
                      return [
                        hours.toString(),
                        {
                          feeding: feedingAmountForToday?.toFixed(1),
                          editing:
                            totalEditing !== 0
                              ? (totalEditing * 1000).toFixed(1)
                              : "",
                          hasDocument: editing[0]?.hasDocument || false,
                        },
                      ];
                    })
                  ),
                });
                feedingsCount += 2;
              }

              // If no transition or after handling transition, add normal feeding line
              if (!transition && todayCalc?.feed) {
                const feedingsResult = Object.fromEntries(
                  await Promise.all(
                    times.map(async ({ time }) => {
                      const hours = Number(time.split(":")[0]);
                      const itemId = todayCalc.feed.item_id;
                      if (typeof itemId !== "number")
                        return [
                          hours.toString(),
                          { feeding: "", editing: "", hasDocument: false },
                        ];
                      const editing = await getEdited(hours, loc.id, itemId);
                      const totalEditing = sumEditingQuantities(editing);
                      return [
                        hours.toString(),
                        {
                          feeding: todayCalc.calc?.feed_per_feeding?.toFixed(1),
                          editing:
                            totalEditing !== 0
                              ? (totalEditing * 1000).toFixed(1)
                              : "",
                          hasDocument: editing[0]?.hasDocument || false,
                        },
                      ];
                    })
                  )
                );

                feedings.push({
                  feedType: todayCalc.feed.type_name || "",
                  feedName: todayCalc.feed.item_name || "",
                  feedId: todayCalc.feed.item_id,
                  feedings: feedingsResult,
                });
                feedingsCount++;
              }

              if (Object.keys(extraFilledRows).length > 0) {
                //console.log(`${loc.id} 4 if`);
                Object.keys(extraFilledRows).forEach((feedId) => {
                  const feedRows = extraFilledRows[Number(feedId)];

                  // console.log('loc: ', loc.id, feedRows)

                  // Створюємо об'єкт для зберігання feedings для кожного часу
                  const feedingsForFeedId: Record<
                    string,
                    {
                      feeding: string;
                      editing: string;
                      hasDocument: boolean;
                    }
                  > = {};

                  // Спочатку додаємо існуючі записи з extraFilledRows
                  feedRows.forEach((row) => {
                    const hours = parseInt(row.date_time.split(":")[0], 10);

                    if (!feedingsForFeedId[hours]) {
                      feedingsForFeedId[hours] = {
                        feeding: "0", // Початкова кількість корму
                        editing: "0", // Початкове редагування
                        hasDocument: true, // Додаємо флаг, оскільки це дані з документів
                      };
                    }

                    const editingValue = row.quantity
                      ? (row.quantity * 1000).toFixed(1)
                      : "0";
                    feedingsForFeedId[hours].editing = editingValue;
                    feedingsForFeedId[hours].hasDocument = true; // Встановлюємо флаг для існуючих записів
                  });

                  // Потім додаємо записи для годин з масиву times
                  times.forEach(({ time }) => {
                    const hours = parseInt(time, 10);

                    if (!feedingsForFeedId[hours]) {
                      // Якщо запис для цього часу не існує, створюємо його
                      feedingsForFeedId[hours] = {
                        feeding: "0", // Значення за замовчуванням
                        editing: "0", // Редагування за замовчуванням
                        hasDocument: true, // Додаємо флаг для всіх часових слотів цього item
                      };
                    }
                  });

                  const valueToPush = {
                    feedType: feedRows[0].feedType, // Тип корму
                    feedName: feedRows[0].feedName, // Назва корму
                    feedId: feedRows[0].item_id, // ID корму
                    feedings: feedingsForFeedId, // Зберігаємо feedings по годинах
                  };

                  // Додаємо цей корм до основного масиву feedings
                  feedings.push(valueToPush);
                });
                feedingsCount++;
              }

              // Group editing values for each feeding row (by feedId) and time slot
              if (feedings.length > 0) {
                // Build a map: { [feedId]: { [hour]: totalEditing } }
                const groupedEditing: Record<
                  number,
                  Record<string, number>
                > = {};
                feedings.forEach((feeding) => {
                  const feedId = feeding.feedId;
                  if (!feedId) return;
                  Object.entries(feeding.feedings || {}).forEach(
                    ([hour, val]) => {
                      if (!groupedEditing[feedId]) groupedEditing[feedId] = {};
                      const editingVal = val.editing
                        ? parseFloat(val.editing)
                        : 0;
                      if (!groupedEditing[feedId][hour])
                        groupedEditing[feedId][hour] = 0;
                      groupedEditing[feedId][hour] += editingVal;
                    }
                  );
                });
                // Now update each feeding row's editing value to the grouped sum
                feedings.forEach((feeding) => {
                  const feedId = feeding.feedId;
                  if (!feedId) return;
                  Object.entries(feeding.feedings || {}).forEach(
                    ([hour, val]) => {
                      val.editing =
                        groupedEditing[feedId][hour]?.toFixed(1) || "0.0";
                    }
                  );
                });
              }

              //що ми додаємо
              const pushResult = {
                locId: loc.id,
                locName: loc.name,
                date: today,
                batch: {
                  id: Number(todayCalc?.batch.batch_id),
                  name: String(todayCalc?.batch.batch_name),
                },
                rowCount: feedingsCount,
                feedings,
              };
              // Додати до загального масиву
              data.push(pushResult);
            }
          }

          // Initialize editings object
          let editings: {
            [locId: number]: {
              [itemId: number]: {
                [time: string]: editingType[];
              };
            };
          } = {};

          // Define itemIds array here
          const itemIds = [
            todayCalc?.feed?.item_id,
            prevFeedTypeInfo?.itemId,
          ].filter((itemId): itemId is number => !!itemId); // Фільтруємо `undefined`

          // Process each time slot
          await Promise.all(
            times
              .sort(
                (a, b) =>
                  Number(a.time.split(":")[0]) - Number(b.time.split(":")[0])
              )
              .map(async (time) => {
                const hours = Number(time.time.split(":")[0]);

                for (const itemId of itemIds) {
                  if (!itemId) {
                    continue; // Skip if itemId is undefined
                  }

                  // Get the current feed type info
                  const currentFeedTypeInfo = feedTypeInfo[itemId];
                  if (!currentFeedTypeInfo) {
                    continue; // Skip if no feed type info
                  }

                  // Get the previous feed type info
                  const prevFeedTypeInfo = feedTypeInfo[itemId];
                  if (!prevFeedTypeInfo) {
                    continue; // Skip if no previous feed type info
                  }

                  const editing = await getEdited(hours, loc.id, itemId);
                  // Ініціалізуємо вкладені об'єкти, якщо їх немає
                  if (!editings[loc.id]) {
                    editings[loc.id] = {};
                  }
                  if (!editings[loc.id][itemId]) {
                    editings[loc.id][itemId] = {};
                  }
                  if (!editings[loc.id][itemId][hours]) {
                    editings[loc.id][itemId][hours] = [];
                  }

                  // Додаємо значення до editings
                  editings[loc.id][itemId][hours] = editing;
                }
              })
          );

          extraFilledRows = await getExtraData(
            loc.id,
            today,
            prevFeedTypeInfo?.itemId,
            todayCalc?.feed?.item_id
          );

          const transition = todayCalc?.calc?.transition_day;

          const feedingAmountForPrev =
            transition && todayCalc?.calc?.feed_per_feeding
              ? todayCalc.calc.feed_per_feeding * (1 - transition * 0.2)
              : undefined;

          const feedingAmountForToday =
            transition && todayCalc?.calc?.feed_per_feeding
              ? todayCalc.calc.feed_per_feeding * (transition * 0.2)
              : undefined;

          // Створення загального об'єкта для басейна
          const feedings: Feeding[] = [];

          let feedingsCount = 0;

          //якщо є перехід на новий корм і є попередній обрахунок
          if (transition && prevFeedTypeInfo && todayCalc?.feed) {
            // First line - previous feed type with decreasing amount
            feedings.push({
              feedType: prevFeedTypeInfo!.name || "",
              feedName: prevFeedTypeInfo!.itemName || "",
              feedId: prevFeedTypeInfo!.itemId,
              feedings: Object.fromEntries(
                times.map(({ time }) => {
                  const hours = Number(time.split(":")[0]);
                  const itemId = prevFeedTypeInfo!.itemId;
                  if (typeof itemId !== "number")
                    return [
                      hours.toString(),
                      { feeding: "", editing: "", hasDocument: false },
                    ];
                  const editing = editings[loc.id]?.[itemId!]?.[hours] || [];
                  const totalEditing = sumEditingQuantities(editing);
                  return [
                    hours.toString(),
                    {
                      feeding: feedingAmountForPrev?.toFixed(1),
                      editing:
                        totalEditing !== 0
                          ? (totalEditing * 1000).toFixed(1)
                          : "",
                      hasDocument: editing[0]?.hasDocument || false,
                    },
                  ];
                })
              ),
            });

            // Second line - current feed type with increasing amount
            feedings.push({
              feedType: todayCalc.feed.type_name || "",
              feedName: todayCalc.feed.item_name || "",
              feedId: todayCalc.feed.item_id,
              feedings: Object.fromEntries(
                times.map(({ time }) => {
                  const hours = Number(time.split(":")[0]);
                  const itemId = todayCalc.feed.item_id;
                  if (typeof itemId !== "number")
                    return [
                      hours.toString(),
                      { feeding: "", editing: "", hasDocument: false },
                    ];
                  const editing = editings[loc.id]?.[itemId!]?.[hours] || [];
                  const totalEditing = sumEditingQuantities(editing);
                  return [
                    hours.toString(),
                    {
                      feeding: feedingAmountForToday?.toFixed(1),
                      editing:
                        totalEditing !== 0
                          ? (totalEditing * 1000).toFixed(1)
                          : "",
                      hasDocument: editing[0]?.hasDocument || false,
                    },
                  ];
                })
              ),
            });
            feedingsCount += 2;
          }

          // If no transition or after handling transition, add normal feeding line
          if (!transition && todayCalc?.feed) {
            const feedingsResult = Object.fromEntries(
              await Promise.all(
                times.map(async ({ time }) => {
                  const hours = Number(time.split(":")[0]);
                  const itemId = todayCalc.feed.item_id;
                  if (typeof itemId !== "number")
                    return [
                      hours.toString(),
                      { feeding: "", editing: "", hasDocument: false },
                    ];
                  const editing = await getEdited(hours, loc.id, itemId);
                  const totalEditing = sumEditingQuantities(editing);
                  return [
                    hours.toString(),
                    {
                      feeding: todayCalc.calc?.feed_per_feeding?.toFixed(1),
                      editing:
                        totalEditing !== 0
                          ? (totalEditing * 1000).toFixed(1)
                          : "",
                      hasDocument: editing[0]?.hasDocument || false,
                    },
                  ];
                })
              )
            );

            feedings.push({
              feedType: todayCalc.feed.type_name || "",
              feedName: todayCalc.feed.item_name || "",
              feedId: todayCalc.feed.item_id,
              feedings: feedingsResult,
            });
            feedingsCount++;
          }

          if (Object.keys(extraFilledRows).length > 0) {
            //console.log(`${loc.id} 4 if`);
            Object.keys(extraFilledRows).forEach((feedId) => {
              const feedRows = extraFilledRows[Number(feedId)];

              // console.log('loc: ', loc.id, feedRows)

              // Створюємо об'єкт для зберігання feedings для кожного часу
              const feedingsForFeedId: Record<
                string,
                { feeding: string; editing: string; hasDocument: boolean }
              > = {};

              // Спочатку додаємо існуючі записи з extraFilledRows
              feedRows.forEach((row) => {
                const hours = parseInt(row.date_time.split(":")[0], 10);

                if (!feedingsForFeedId[hours]) {
                  feedingsForFeedId[hours] = {
                    feeding: "0", // Початкова кількість корму
                    editing: "0", // Початкове редагування
                    hasDocument: true, // Додаємо флаг, оскільки це дані з документів
                  };
                }

                const editingValue = row.quantity
                  ? (row.quantity * 1000).toFixed(1)
                  : "0";
                feedingsForFeedId[hours].editing = editingValue;
                feedingsForFeedId[hours].hasDocument = true; // Встановлюємо флаг для існуючих записів
              });

              // Потім додаємо записи для годин з масиву times
              times.forEach(({ time }) => {
                const hours = parseInt(time, 10);

                if (!feedingsForFeedId[hours]) {
                  // Якщо запис для цього часу не існує, створюємо його
                  feedingsForFeedId[hours] = {
                    feeding: "0", // Значення за замовчуванням
                    editing: "0", // Редагування за замовчуванням
                    hasDocument: true, // Додаємо флаг для всіх часових слотів цього item
                  };
                }
              });

              const valueToPush = {
                feedType: feedRows[0].feedType, // Тип корму
                feedName: feedRows[0].feedName, // Назва корму
                feedId: feedRows[0].item_id, // ID корму
                feedings: feedingsForFeedId, // Зберігаємо feedings по годинах
              };

              // Додаємо цей корм до основного масиву feedings
              feedings.push(valueToPush);
            });
            feedingsCount++;
          }

          // Group editing values for each feeding row (by feedId) and time slot
          if (feedings.length > 0) {
            // Build a map: { [feedId]: { [hour]: totalEditing } }
            const groupedEditing: Record<number, Record<string, number>> = {};
            feedings.forEach((feeding) => {
              const feedId = feeding.feedId;
              if (!feedId) return;
              Object.entries(feeding.feedings || {}).forEach(([hour, val]) => {
                if (!groupedEditing[feedId]) groupedEditing[feedId] = {};
                const editingVal = val.editing ? parseFloat(val.editing) : 0;
                if (!groupedEditing[feedId][hour])
                  groupedEditing[feedId][hour] = 0;
                groupedEditing[feedId][hour] += editingVal;
              });
            });
            // Now update each feeding row's editing value to the grouped sum
            feedings.forEach((feeding) => {
              const feedId = feeding.feedId;
              if (!feedId) return;
              Object.entries(feeding.feedings || {}).forEach(([hour, val]) => {
                val.editing = groupedEditing[feedId][hour]?.toFixed(1) || "0.0";
              });
            });
          }

          //що ми додаємо
          const pushResult = {
            locId: loc.id,
            locName: loc.name,
            date: today,
            batch: {
              id: Number(todayCalc?.batch.batch_id),
              name: String(todayCalc?.batch.batch_name),
            },
            rowCount: feedingsCount,
            feedings,
          };
          // Додати до загального масиву
          data.push(pushResult);
        }
      }
    }
  }

  return data;
};

async function getExtraData(
  locId: number,
  today: string,
  prevItemId?: number,
  todayItemId?: number
) {
  const startOfDay = new Date(today);
  let endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  endOfDay.setHours(endOfDay.getHours() + 2);

  const query = await db.documents.findMany({
    select: {
      date_time: true,
      itemtransactions: {
        select: {
          location_id: true,
          quantity: true,
          itembatches: {
            select: {
              items: {
                select: {
                  id: true,
                  name: true,
                  feedtypes: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        where: { location_id: locId },
      },
    },
    where: {
      doc_type_id: 9,
      date_time: { lte: endOfDay, gte: startOfDay },
      itemtransactions: { some: { location_id: locId } },
    },
  });

  // Фільтруємо записи, де є транзакції
  const filteredQuery = query.filter((doc) => doc.itemtransactions.length > 0);

  // Масив з prevItemId та todayItemId
  const prevAndTodayItemIds = [prevItemId, todayItemId].filter(Boolean);

  // Масив унікальних item_id
  const uniqueItemIds = filteredQuery
    .flatMap((doc) =>
      doc.itemtransactions.flatMap((tran) =>
        tran.itembatches.items.id // Доступ до item_id без використання map
          ? [tran.itembatches.items.id] // Якщо item_id є, додаємо його в масив
          : []
      )
    )
    .filter((itemId) => !prevAndTodayItemIds.includes(itemId)); // Фільтруємо item_id, яких немає в prevItemId та todayItemId

  // Групуємо записи по item_id
  const groupedByItemId: Record<number, any[]> = {};

  filteredQuery.forEach((doc) => {
    doc.itemtransactions.forEach((tran) => {
      const itemId = tran.itembatches.items.id;
      if (uniqueItemIds.includes(itemId)) {
        const record = {
          feedType: tran.itembatches.items.feedtypes?.name,
          feedName: tran.itembatches.items.name,
          date_time: doc.date_time.toISOString().split("T")[1],
          item_id: itemId,
          quantity: tran.quantity,
          location_id: tran.location_id,
        };

        if (!groupedByItemId[itemId]) {
          groupedByItemId[itemId] = []; // Якщо ще немає такого item_id, ініціалізуємо масив
        }

        groupedByItemId[itemId].push(record); // Додаємо запис до масиву для цього item_id
      }
    });
  });

  return groupedByItemId;
}

const feedTypeInfo: { [key: number]: any } = {}; // Initialize feedTypeInfo
