import { db } from "@/db";
import StockingComponent from "@/components/feeding-component";
import * as stockingActions from "@/actions/stocking";
import * as actions from "@/actions";
import { calculation_table, itemtransactions, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function StockingHome() {
  const today = new Date();
  console.log(
    "current date: ",
    today.toLocaleString("uk-ua", { timeZone: "Europe/Kiev" })
  );
  const areas = await actions.getAreas();

  const locations = await actions.getPools();

  const batches = await actions.getCatfishBatches();

  const disposal_reasons = await db.disposal_reasons.findMany();

  const weekNum = actions.getWeekOfYear(today);

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
              const poolInfo = await stockingActions.poolInfo(
                loc.id,
                today.toISOString().split("T")[0]
              );

              const wasFetchedThisWeek = await db.fetching.findMany({
                where: {
                  itemtransactions: {
                    documents: {
                      location_id: loc.id,
                    },
                  },
                  weekNumber: weekNum,
                },
              });

              return {
                key: `${pool.id}-${loc.id}`,
                poolInfo: {
                  ...poolInfo,
                  wasFetchedThisWeek: wasFetchedThisWeek.length > 0,
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
            today
              .toLocaleString("uk-ua", { timeZone: "Europe/Kiev" })
              .split(",")[0]
          }
        </p>
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
                />
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

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
