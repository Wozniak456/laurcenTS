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
      percent_feeding: number | null;
      locations: {
        name: string;
        id: number;
      }[];
    }[];
  }[];
  // ... other props
}

export default async function DayFeeding(props: DayFeedingProps) {
  const today = props.params.index;

  const currentDate: Date = new Date(today);

  const dates = datesArray(currentDate);

  const lines = await setLines();
  console.log("Lines data from setLines:", JSON.stringify(lines, null, 2));

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

  const summary = await feedingActions.getAllSummary(lines, currentDate);

  const data = await setData(today, times);

  /* data.map((data1) => {
    if (data1.locId == 65) {
      console.log("data1. loc: ", data1.locId);
      data1.feedings?.map((feeding) => {
        console.log(feeding);
      });
    }
  } 
);*/

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
        lines={lines}
        today={today}
        times={times}
        feeds={items}
      />
      <DailyFeedWeightPage
        lines={lines}
        summary={summary}
        items={items}
        date={today}
      />
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

const setData = async (
  today: string,
  times: { id: number; time: string }[]
) => {
  const currentDate = new Date(today);

  const lines = await setLines();

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

  for (const line of lines) {
    for (const pool of line.pools) {
      for (const loc of pool.locations) {
        const isPoolFilled = await actions.isFilled(loc.id, today);

        let locationInfo: LocationInfo = {
          location_id: loc.id,
          location_name: loc.name,
          fed_today: await feedingForLocation(loc.id, currentDate),
        };

        let todayCalc = null;
        let prevCalc = null;

        let extraFilledRows: Record<number, extraData[]> = {};

        if (isPoolFilled) {
          todayCalc = await stockingActions.calculationForLocation(
            loc.id,
            today
          );

          if (todayCalc?.calc?.transition_day !== null) {
            prevCalc = await stockingActions.getPrevCalc(loc.id, todayCalc);
          }

          const batchInfo = await stockingActions.poolInfo(loc.id, today);

          if (batchInfo) {
            locationInfo = {
              ...locationInfo,
              batch_id: batchInfo.batch?.id,
            };
          }

          extraFilledRows = await getExtraData(
            loc.id,
            today,
            prevCalc?.feed.item_id,
            todayCalc?.feed.item_id
          );
        }

        let editings: {
          [locId: number]: {
            [itemId: number]: {
              [time: string]: editingType[];
            };
          };
        } = {};

        await Promise.all(
          times
            .sort(
              (a, b) =>
                Number(a.time.split(":")[0]) - Number(b.time.split(":")[0])
            )
            .map(async (time) => {
              const hours = Number(time.time.split(":")[0]);

              const itemIds = [
                todayCalc?.feed.item_id,
                prevCalc?.feed.item_id,
              ].filter((itemId): itemId is number => !!itemId); // Фільтруємо `undefined`

              for (const itemId of itemIds) {
                const editing = await getEdited(hours, loc.id, itemId);
                if (loc.id === 67) {
                  console.log(
                    `hours: ${hours} location_id: ${loc.id} itemid: ${itemId}`
                  );
                  editing.map((editing1) => {
                    console.log(editing1.itemtransactions);
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
        if (transition && prevCalc) {
          if (loc.id === 65) {
            console.log(`${loc.id} 1 if65`);
          }
          feedings.push({
            feedType: prevCalc.feed.type_name,
            feedName: prevCalc.feed.item_name,
            feedId: prevCalc.feed.item_id,
            feedings: Object.fromEntries(
              times.map(({ time }) => {
                const hours = Number(time.split(":")[0]);
                const itemId = prevCalc.feed.item_id;
                const editing = editings[loc.id]?.[itemId!]?.[hours] || [];

                return [
                  hours.toString(),
                  {
                    feeding: feedingAmountForPrev?.toFixed(1),
                    editing:
                      editing[0]?.itemtransactions[0]?.quantity !== undefined
                        ? (
                            editing[0].itemtransactions[0].quantity * 1000
                          ).toFixed(1)
                        : "",
                    hasDocument: editing[0]?.hasDocument || false,
                  },
                ];
              })
            ),
          });
          feedingsCount++;
        }

        if (transition && todayCalc) {
          feedings.push({
            feedType: todayCalc.feed.type_name,
            feedName: todayCalc.feed.item_name,
            feedId: todayCalc.feed.item_id,
            feedings: Object.fromEntries(
              times.map(({ time }) => {
                const hours = Number(time.split(":")[0]);
                const itemId = todayCalc.feed.item_id;
                const editing = editings[loc.id]?.[itemId!]?.[hours] || [];

                return [
                  hours.toString(),
                  {
                    feeding: feedingAmountForToday?.toFixed(1),
                    editing:
                      editing[0]?.itemtransactions[0]?.quantity !== undefined
                        ? (
                            editing[0].itemtransactions[0].quantity * 1000
                          ).toFixed(1)
                        : "",
                    hasDocument: editing[0]?.hasDocument || false,
                  },
                ];
              })
            ),
          });
          feedingsCount++;
        } else if (todayCalc) {
          const feedingsResult = Object.fromEntries(
            times.map(({ time }) => {
              const hours = Number(time.split(":")[0]);
              const itemId = todayCalc.feed.item_id;
              const editing = editings[loc.id]?.[itemId!]?.[hours] || [];

              return [
                hours.toString(),
                {
                  feeding: todayCalc.calc?.feed_per_feeding?.toFixed(1),
                  editing:
                    editing[0]?.itemtransactions[0]?.quantity !== undefined
                      ? (
                          editing[0].itemtransactions[0].quantity * 1000
                        ).toFixed(1)
                      : "",
                  hasDocument: editing[0]?.hasDocument || false,
                },
              ];
            })
          );

          feedings.push({
            feedType: todayCalc.feed.type_name,
            feedName: todayCalc.feed.item_name,
            feedId: todayCalc.feed.item_id,
            feedings: feedingsResult,
          });
          feedingsCount++;
        }

        if (Object.keys(extraFilledRows).length > 0) {
          //   console.log(`${loc.id} 4 if`);
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

        // console.log('feedings: ', feedings)
        if (loc.id === 67) {
          console.log(
            `locId: ${loc.id}`,
            JSON.stringify(feedings, (key, value) => {
              if (typeof value === "bigint") {
                return value.toString();
              }
              return value;
            })
          );
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
        if (loc.id === 67) {
          console.log(
            `locId: ${loc.id}`,
            JSON.stringify(pushResult, (key, value) => {
              if (typeof value === "bigint") {
                return value.toString();
              }
              return value;
            })
          );
        }
        // Додати до загального масиву
        data.push(pushResult);
      }
    }
  }

  return data;
};

const setLines = async () => {
  return await db.productionlines.findMany({
    select: {
      id: true,
      name: true,
      pools: {
        select: {
          name: true,
          id: true,
          percent_feeding: true,
          locations: {
            select: {
              id: true,
              name: true,
            },
            orderBy: {
              name: "asc",
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
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

  // if (locId === 40) {
  //     console.log('hello')
  //     query.map(qu => {
  //         qu.itemtransactions.map(tran => {
  //             console.log(tran)
  //         })
  //     })
  // }

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

  // // Виведення результату
  // console.log("Групування по item_id:");
  // for (const [itemId, records] of Object.entries(groupedByItemId)) {
  //     console.log(`для item_id = ${itemId}:`, records);
  // }

  // console.log(groupedByItemId)

  return groupedByItemId;
}
