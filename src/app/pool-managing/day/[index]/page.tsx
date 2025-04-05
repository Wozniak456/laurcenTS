import { db } from "@/db";
import Link from "next/link";
import StockingComponent from "@/components/feeding-component";
import * as stockingActions from "@/actions/stocking";
import * as actions from "@/actions";
import { addDays, format } from "date-fns";
import { uk } from "date-fns/locale"; // If you need specific Ukrainian locale formatting
import { calculation_table, itemtransactions, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface StockingProps {
  params: {
    index: string;
  };
}

export default async function StockingHome(props: StockingProps) {
  const today = props.params.index;

  const currentDate: Date = new Date(today);

  //const today = new Date();
  console.log(
    "current date: ",
    currentDate.toLocaleString("uk-ua", { timeZone: "Europe/Kiev" })
  );
  const areas = await actions.getAreas();

  const locations = await actions.getPools();

  const batches = await actions.getCatfishBatches();

  const disposal_reasons = await db.disposal_reasons.findMany();

  const dates = datesArray(currentDate);

  const weekNum = actions.getWeekOfYear(currentDate);

  // Збір інформації про басейни
  const poolsData = await Promise.all(
    areas.flatMap((area) =>
      area.productionlines.flatMap((line) =>
        line.pools
          .sort((a, b) => {
            const numA = parseInt(a.name.split("/")[0].slice(1));
            const numB = parseInt(b.name.split("/")[0].slice(1));
            return numA - numB;
          })
          .flatMap((pool) =>
            pool.locations.map(async (loc) => {
              const poolInfo = await stockingActions.poolInfo(loc.id, today);

              const wasFetchedThisWeek = false;
              /*              await db.fetching.findMany({
                where: {
                  itemtransactions: {
                    documents: {
                      location_id: loc.id,
                    },
                  },
                  weekNumber: weekNum,
                },
              });
*/
              return {
                key: `${pool.id}-${loc.id}`,
                poolInfo: {
                  ...poolInfo,
                  //                  wasFetchedThisWeek: wasFetchedThisWeek.length > 0,
                  wasFetchedThisWeek: wasFetchedThisWeek,
                },
                loc,
                pool,
              };
            })
          )
      )
    )
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-sm">
      <div className="flex flex-col items-end w-full">
        <p>Тиждень: {weekNum}</p>
        <p>
          Сьогодні:{" "}
          {
            currentDate
              .toLocaleString("uk-ua", { timeZone: "Europe/Kiev" })
              .split(",")[0]
          }
        </p>
      </div>

      <div className="flex justify-between">
        {dates.map((date) => (
          <div key={date} className="flex-shrink-0 p-2">
            <div
              className={` rounded-lg shadow p-1 hover:bg-blue-100 transition duration-200 ${
                date == today && "bg-blue-200"
              }`}
            >
              <Link href={`/pool-managing/day/${date}`}>
                <span className={`text-center cursor-pointer `}>{date}</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {areas.map((area) => (
        <div key={area.id} className="w-full">
          <div className="text-3xl font-bold">{area.name}</div>

          {poolsData
            .filter((data) =>
              area.productionlines.some((line) =>
                line.pools.some((pool) =>
                  pool.locations.some((loc) => loc.id === data.loc.id)
                )
              )
            )
            .map(({ key, poolInfo, loc, pool }) => (
              <div key={key} className="shadow-xl mb-4 px-4 py-0.5 bg-blue-100">
                <StockingComponent
                  locations={locations}
                  location={loc}
                  batches={batches}
                  poolInfo={poolInfo}
                  disposal_reasons={disposal_reasons}
                  weekNum={weekNum}
                  today={today}
                />
              </div>
            ))}
        </div>
      ))}
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

async function wasFetchedThisWeek(location_id: number, weekNum: number) {
  const fetch = await db.fetching.findMany({
    include: {
      itemtransactions: {
        include: {
          documents: true,
        },
      },
    },
    where: {
      itemtransactions: {
        documents: {
          location_id: location_id,
        },
      },
      weekNumber: weekNum,
    },
  });

  if (fetch.length > 0) {
    return true;
  } else {
    return false;
  }
}
