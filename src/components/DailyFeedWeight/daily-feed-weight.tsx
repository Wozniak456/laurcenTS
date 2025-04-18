import LocationComponent from "@/components/DailyFeedWeight/location-info";
import * as feedingActions from "@/actions/feeding";
import * as stockingActions from "@/actions/stocking";
import * as actions from "@/actions";
import {
  calculationAndFeed,
  calculationAndFeedExtended,
} from "@/types/app_types";

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
  summary: {
    [itemId: number]: LocationSummary;
  };
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

export default async function DailyFeedWeight({
  lines,
  summary,
  items,
  date,
}: DailyFeedWeightProps) {
  console.log(
    "Lines data received in DailyFeedWeight:",
    JSON.stringify(lines, null, 2)
  );
  const data: Row[] = [];

  for (const line of lines) {
    for (const pool of line.pools) {
      for (const loc of pool.locations) {
        // перевірка чи локація не пуста
        const isPoolFilled = await feedingActions.isFilled(loc.id);

        let todayCalcExtended: calculationAndFeedExtended | undefined;
        let prevCalcExtended: calculationAndFeedExtended | undefined;

        if (isPoolFilled) {
          const todayCalc: calculationAndFeed | undefined =
            await stockingActions.calculationForLocation(loc.id, date);
          if (loc.id === 48) {
            console.log(
              `pool-id: ${pool.id} pool-name: ${pool.name} percent-feeding: ${pool.percent_feeding}`
            );
          }
          if (todayCalc?.feed && todayCalc.feed.type_id) {
            todayCalcExtended = {
              ...todayCalc,
              allItems: await actions.getAllItemsForFeedType(
                todayCalc.feed.type_id
              ),
            };
          }

          if (todayCalc?.calc?.transition_day) {
            const prevCalc = await stockingActions.getPrevCalc(
              loc.id,
              todayCalc
            );

            if (prevCalc && prevCalc.calc && prevCalc.feed?.type_id) {
              prevCalcExtended = {
                ...prevCalc,
                allItems: await actions.getAllItemsForFeedType(
                  prevCalc.feed?.type_id
                ),
              };
            }
          }
        }

        const transitionDay = todayCalcExtended?.calc?.transition_day;

        let row: Row = {};

        if (transitionDay && todayCalcExtended?.calc?.feed_per_feeding) {
          row = {
            location: {
              id: loc.id,
              name: loc.name,
              percent_feeding:
                pool.percent_feeding === null ||
                pool.percent_feeding === undefined
                  ? 0
                  : pool.percent_feeding,
            },
            rows: [
              {
                qty:
                  todayCalcExtended?.calc?.feed_per_feeding *
                  (1 - transitionDay * 0.2),
                feed: {
                  id: prevCalcExtended?.feed?.type_id,
                  name: prevCalcExtended?.feed?.type_name,
                },
                item: {
                  id: prevCalcExtended?.feed?.item_id,
                  name: items.find(
                    (item) => item.id === prevCalcExtended?.feed?.item_id
                  )?.name,
                },
              },
              {
                qty:
                  todayCalcExtended?.calc?.feed_per_feeding *
                  (transitionDay * 0.2),
                feed: {
                  id: todayCalcExtended?.feed?.type_id,
                  name: todayCalcExtended?.feed?.type_name,
                },
                item: {
                  id: prevCalcExtended?.feed?.item_id,
                  name: items.find(
                    (item) => item.id === todayCalcExtended?.feed?.item_id
                  )?.name,
                },
              },
            ],
          };
        } else {
          row = {
            location: {
              id: loc.id,
              name: loc.name,
              percent_feeding:
                pool.percent_feeding === null ? 0 : pool.percent_feeding,
            },
            rows: [
              {
                qty: todayCalcExtended?.calc?.feed_per_feeding,
                feed: {
                  id: todayCalcExtended?.feed?.type_id,
                  name: todayCalcExtended?.feed?.type_name,
                },
                item: {
                  id: prevCalcExtended?.feed?.item_id,
                  name: items.find(
                    (item) => item.id === todayCalcExtended?.feed?.item_id
                  )?.name,
                },
              },
            ],
          };
        }

        data.push(row);
      }
    }
  }

  const aggregatedData: { [key: string]: number } = {};

  data.forEach((row) => {
    const pf_: number = row.location?.percent_feeding || 0;
    row.rows?.forEach((subRow) => {
      const itemName = subRow.item.name;
      const qty_ = (subRow.qty || 0) * (1 + pf_ / 100);
      if (itemName !== undefined) {
        if (!aggregatedData[itemName]) {
          // Якщо item.name ще не існує, створюємо новий запис
          aggregatedData[itemName] = qty_;
        } else {
          // Якщо item.name вже існує, акумулюємо значення qty
          aggregatedData[itemName] += qty_;
        }
      }
    });
  });

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
            {lines.map((line) =>
              line.pools.map((pool) =>
                pool.locations.flatMap((loc) => {
                  const row = data.find((row) => row.location?.id == loc.id);
                  let outthisline = 0;
                  row?.rows?.map((row_) => {
                    if (row_.item.name) {
                      //console.log(`super item: ${row_.item.name}`);
                      outthisline = 1;
                    }
                  });
                  return (
                    outthisline === 1 && (
                      <LocationComponent key={loc.id} row={row} items={items} />
                    )
                  );
                })
              )
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
                <td className="px-4 h-10 border border-gray-400">{itemName}</td>
                <td className="px-4 h-10 border border-gray-400  text-right">
                  {qty.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
