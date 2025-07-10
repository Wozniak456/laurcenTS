import { db } from "@/db";
import * as stockingActions from "@/actions/stocking";
import { getPageTitle } from "@/utils/pageTitle";

export const metadata = {
  title: getPageTitle("Тижневий звіт"),
};

export const dynamic = "force-dynamic";

export default async function WeekSummary() {
  const lines = await db.productionlines.findMany({
    include: {
      pools: {
        include: {
          locations: {
            include: {
              itemtransactions: {
                include: {
                  itembatches: true,
                  documents: {
                    include: {
                      stocking: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const now = new Date();
  const datesArray: Date[] = [];

  for (let i = 0; i < 10; i++) {
    const currentDate = new Date();
    currentDate.setDate(now.getDate() + i);
    datesArray.push(currentDate);
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Week Summary</h2>
      <div className="flex gap-4 flex-wrap">
        {await Promise.all(
          lines.map(async (line) => {
            // Отримання даних для всіх пулів лінії
            const poolFeedInfo = await Promise.all(
              line.pools.map(async (pool) => {
                const poolInfo = await stockingActions.calculationForLocation(
                  pool.locations[0].id,
                  now.toISOString().split("T")[0]
                );
                return {
                  id: pool.id,
                  name: pool.name,
                  feedType: poolInfo?.feed?.type_name || "",
                };
              })
            );

            return (
              <div key={line.id} className="mb-4">
                <table className="mb-4">
                  <thead>
                    <tr>
                      <th
                        colSpan={poolFeedInfo.length + 1}
                        className="px-4 py-2 border border-gray-400 text-center bg-blue-100"
                      >
                        {line.name}
                      </th>
                    </tr>

                    <tr>
                      <th className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">
                        Корм &rarr;
                      </th>
                      {poolFeedInfo.map((pool) => (
                        <th
                          key={pool.id}
                          className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm"
                        >
                          {pool.feedType}
                        </th>
                      ))}
                    </tr>

                    <tr>
                      <th className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">
                        Дата
                      </th>
                      {poolFeedInfo.map((pool) => (
                        <th
                          key={pool.id}
                          className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm"
                        >
                          {pool.name}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {await Promise.all(
                      datesArray.map(async (date, dateIndex) => {
                        const calcData = await Promise.all(
                          line.pools.map(async (pool) => {
                            const calc =
                              await stockingActions.calculationForLocation(
                                pool.locations[0].id,
                                date.toISOString().split("T")[0]
                              );
                            return (
                              calc?.calc?.feed_per_feeding?.toFixed(0) || ""
                            );
                          })
                        );

                        return (
                          <tr key={dateIndex}>
                            <td className="px-4 py-2 border border-gray-400 text-center font-normal whitespace-nowrap text-sm">
                              {date.toISOString().split("T")[0]}
                            </td>
                            {calcData.map((feedAmount, poolIndex) => (
                              <td
                                key={poolIndex}
                                className="px-4 py-2 border border-gray-400 text-center font-normal text-sm"
                              >
                                {feedAmount}
                              </td>
                            ))}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
