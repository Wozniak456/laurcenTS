import { db } from "@/db"
import { notFound } from "next/navigation";
import {calculationForLocation} from '@/actions/stocking'

import Link from "next/link";
import React from "react";
import Component111 from '@/components/Real111/111withInputs' 

interface LeftoversPerPeriodProps {
    params: {
        date: string
    }
}

type aggregatedInfoType = {
    batchName: string | undefined;
    qty: number | undefined;
    fishWeight: number | undefined;
    feedType: string | undefined;
    updateDate: string | undefined;
    plan_weight?: number
}
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

        return( 
           <div className="my-4 flex flex-col gap-4">
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
                                        {line.pools.map(async (pool, poolIndex) => {
                                            let aggregatedInfo : aggregatedInfoType = await poolInfo(pool.locations[0].id, date)
                                            const plan = await calculationForLocation(pool.locations[0].id, date)

                                            if (plan.calc != null){
                                                aggregatedInfo = {
                                                    ...aggregatedInfo,
                                                    plan_weight: plan.calc.fish_weight
                                                }
                                            }
                                            

                                            return(
                                                <React.Fragment key={poolIndex}>
                                                    <tr>
                                                        <td className="px-4 py-2 border text-center border-gray-400"> {pool.name}</td>
                                                        <Component111 date={date} poolIndex={pool.locations[0].id} aggregatedData={aggregatedInfo}/>
                                                    </tr>
                                                </React.Fragment>
                                            )
                                        })}
                                    </React.Fragment>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                    
                </table>
                
                
           </div>
        )

        
    }
    catch(error){
        console.error("Error fetching batch data:", error);
    }
    finally {
        // await db.$executeRaw`SELECT pg_terminate_backend(pid)
        //                      FROM pg_stat_activity
        //                      WHERE state = 'idle';`;
        // console.log('Disconnected idle sessions successfully.');
    }
}


const poolInfo = async (location_id: number, date: string) => {
    const dateValue = new Date(date)
    dateValue.setHours(23, 59, 59, 999);

    const lastStocking = await db.documents.findFirst({
        select:{
            date_time: true,
            stocking:{
                select:{
                    average_weight: true
                }
            },
            itemtransactions:{
                select:{
                    itembatches:{
                        select:{
                            name: true
                        }
                    },
                    quantity: true
                },
                where:{
                    quantity:{
                        gte: 0
                    }
                }
            },
        },
        where:{
            location_id: location_id,
            doc_type_id: 1,
            date_time:{
                lte: dateValue
            }
        },
        orderBy:{
            id: 'desc'
        },
        take: 1
    })

    // console.log('lastStocking', lastStocking)

    let feedType

    if (lastStocking){
        feedType = await getFeedType(lastStocking?.stocking[0].average_weight)
    }

    const batchName = lastStocking?.itemtransactions[0].itembatches.name
    const qty = lastStocking?.itemtransactions[0].quantity
    const fishWeight = lastStocking?.stocking[0].average_weight
    const updateDate = lastStocking?.date_time.toISOString().split("T")[0];
    
    return({batchName, qty, fishWeight, feedType, updateDate})
}

async function getFeedType(fish_weight : number) {
    const feed_connection = await db.feedtypes.findFirst({
      where:{
        feedconnections:{
          from_fish_weight:{
            lte: fish_weight
          },
          to_fish_weight:{
            gte: fish_weight
          }
        }
      }
    })
    return feed_connection?.name
}