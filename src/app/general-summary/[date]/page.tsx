import { db } from "@/db"
import {calculationForLocation, poolInfo} from '@/actions/stocking'
import React from "react";
import Component111 from '@/components/Real111/111withInputs' 
import {poolInfoType} from '@/types/app_types'
import ExportButton from '@/components/111tableToPrint';

interface LeftoversPerPeriodProps {
    params: {
        date: string
    }
}

export type DataItem = {
    poolName: string;
    batchName?: string;
    quantity?: number; 
    planWeight?: number; 
    factWeight?: number; 
    feed?: string;
    updated?: string; 
  };

export default async function LeftoversPerPeriod(props: LeftoversPerPeriodProps){
    
    try{
        const date = props.params.date

        const areas = await db.productionareas.findMany({
            include:{
                productionlines:{
                    include:{
                        pools: {
                            include:{
                                locations: true
                            }
                        }
                    }
                }
            }
        })

        const data: DataItem[] = [];

        for (const area of areas) {
            for (const line of area.productionlines) {
              for (const pool of line.pools) {
                let aggregatedInfo: poolInfoType = await poolInfo(pool.locations[0].id, date);
                const plan = await calculationForLocation(pool.locations[0].id, date);
      
                if (plan.calc != null) {
                  aggregatedInfo = {
                    ...aggregatedInfo,
                    plan_weight: plan.calc.fish_weight
                  };
                }
      
                data.push({
                  poolName: pool.name,
                  batchName: aggregatedInfo.batch?.name,
                  quantity: aggregatedInfo.qty,
                  planWeight: aggregatedInfo.plan_weight,
                  factWeight: aggregatedInfo.fishWeight,
                  feed: aggregatedInfo.feedType?.name,
                  updated: aggregatedInfo.updateDate
                });
              }
            }
          }

          const sections = [];

        for (const area of areas) {
            const lines = [];

            for (const line of area.productionlines) {
                const pools = [];

                for (const pool of line.pools) {
                    let aggregatedInfo: poolInfoType = await poolInfo(pool.locations[0].id, date);
                    const plan = await calculationForLocation(pool.locations[0].id, date);

                    if (plan.calc != null) {
                        aggregatedInfo = {
                            ...aggregatedInfo,
                            plan_weight: plan.calc.fish_weight
                        };
                    }

                    pools.push({
                        poolName: pool.name,
                        batchName: aggregatedInfo.batch?.name,
                        quantity: aggregatedInfo.qty,
                        planWeight: aggregatedInfo.plan_weight,
                        factWeight: aggregatedInfo.fishWeight,
                        feed: aggregatedInfo.feedType?.name,
                        updated: aggregatedInfo.updateDate
                    });
                }

                lines.push({
                    lineName: line.name,
                    pools
                });
            }

            sections.push({
                sectionName: area.name,
                lines
            });
        }

          return (
            <div className="my-4 flex flex-col gap-4">
              <ExportButton date={date} sections={sections} />
              <table className="mb-4">
                <thead>
                  <tr>
                    <th colSpan={7} className="px-4 py-2 border border-gray-400 text-center font-normal whitespace-nowrap text-sm">{date}</th>
                  </tr>
                  <tr>
                    <th className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">Басейн</th>
                    <th className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">Партія</th>
                    <th className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">К-ть</th>
                    <th className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">Вага План</th>
                    <th className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">Вага Факт</th>
                    <th className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">Корм</th>
                    <th className="px-4 py-2 border border-gray-400 text-center bg-blue-100 text-sm">Оновлено</th>
                  </tr>
                </thead>
                <tbody>
                  {areas.map((area, areaIndex) => (
                    <React.Fragment key={areaIndex}>
                      <tr>
                        <td colSpan={7} className="px-4 py-2 border text-center bg-blue-200 border-gray-400"> {area.name}</td>
                      </tr>
                      {area.productionlines.map((line, lineIndex) => (
                        <React.Fragment key={lineIndex}>
                          <tr>
                            <td colSpan={7} className="px-4 py-2 border text-center bg-blue-300 border-gray-400"> {line.name}</td>
                          </tr>
                          {line.pools.map((pool, poolIndex) => (
                            <React.Fragment key={poolIndex}>
                              <tr>
                                <td className="px-4 py-2 border text-center border-gray-400"> {pool.name}</td>
                                <Component111 date={date} poolIndex={pool.locations[0].id} aggregatedData={data.find(d => d.poolName === pool.name)} />
                              </tr>
                            </React.Fragment>
                          ))}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              
            </div>
          );
      
        } catch (error) {
          console.error("Error fetching data:", error);
          return <div>Error fetching data</div>;
        }
      }