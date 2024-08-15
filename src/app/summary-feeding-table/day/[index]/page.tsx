import Link from "next/link";
import React from "react";
import { db } from "@/db";
import DailyFeedWeightPage from '@/components/DailyFeedWeight/daily-feed-weight'
import * as feedingActions from "@/actions/feeding"

import * as stockingActions from "@/actions/stocking"
import * as actions from '@/actions'

import DaySummaryContent from "@/components/day-summary"
import { start } from "repl";

interface DayFeedingProps {
  params: {
    index: string;
  };
}

interface LocationInfo {
    location_id: number;
    location_name: string;
    batch_id?: bigint;
    fed_today?: boolean 
  }

export default async function DayFeeding(props: DayFeedingProps) {
    const today = props.params.index;
    console.log(today)

    const currentDate: Date = new Date();
    
    let dates = [];

    for (let i = -6; i <= 2; i++) {
      let newDate = new Date();
      newDate.setDate(currentDate.getDate() + i);
      dates.push(newDate.toISOString().split("T")[0]);
    }

    const lines = await db.productionlines.findMany({
        select:{
            id: true,
            name: true,
            pools:{
                select:{
                    id: true,
                    locations:{
                        select:{
                            id: true,
                            name: true
                        }
                    }
                }
            }
        }
    })

    const times = await db.time_table.findMany();
  
    const items = await db.items.findMany({
      where:{
        item_type_id: 3
      }
    })

    const summary = await feedingActions.getAllSummary(lines, currentDate)

    const feedingForLocation = async (locationId: number) => {
        const startOfDay = new Date(today);
        // console.log(startOfDay)
        // startOfDay.setHours(0, 0, 0, 0); // Встановлює час на початок дня (00:00:00.000)

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999); // Встановлює час на кінець дня (23:59:59.999)

        const feedingDocument = await db.documents.findMany({
            where:{
                doc_type_id: 9,
                date_time: {
                    gte: startOfDay, // Більше або дорівнює початку дня
                    lte: endOfDay,   // Менше або дорівнює кінцю дня
                },
                location_id: locationId
            }
        })
        if(feedingDocument.length > 0)
            console.log('date_time: ', startOfDay, 'locationId', locationId, ' feedingDocument', feedingDocument.length);
        return feedingDocument.length >= 1;
    }

    return (
        <div className="flex flex-col justify-center ">
            <div className="flex justify-between">
                {dates.map(date => (
                    <div key={date} className="flex-shrink-0 p-2">
                        <div className={` rounded-lg shadow p-1 hover:bg-blue-100 transition duration-200 ${date == today && 'bg-blue-200'}`}>
                            <Link href={`/summary-feeding-table/day/${date}`} >
                                <span className={`text-center cursor-pointer `}>{date}</span>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {lines.map(line => (
                <table key={line.id} className="border-collapse border w-full mb-4 text-sm w-5/6">
                <thead>
                    <tr>
                        <th
                        colSpan={2 * times.length + 3}
                        className="px-4 py-2 bg-blue-100">
                        {line.name}
                        </th>
                        <th
                        className="px-4 py-2 bg-blue-100">
                        {today.slice(5)}
                        </th>
                    </tr>
                    <tr>
                        <th className="border p-2">Басейн</th>
                        <th className="border p-2 ">Вид корму</th>
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
                {line.pools.map(pool => {
                    return Promise.all(pool.locations.map(async loc => {
                    
                    const isPoolFilled = await actions.isFilled(loc.id)

                    let prevCalc = null;

                    let locationInfo : LocationInfo = {
                        location_id: loc.id,
                        location_name: loc.name,
                        fed_today: await feedingForLocation(loc.id)
                    };

                    // console.log(locationInfo)

                    let todayCalc

                    if(isPoolFilled === true){
                        todayCalc = await stockingActions.calculationForLocation(loc.id, today);
                
                        if (todayCalc.calc?.transition_day !== null){
                        prevCalc = await stockingActions.getPrevCalc(loc.id, todayCalc);
                        }
            
                        const batchInfo = await stockingActions.poolInfo(loc.id, today)
            
                        if (batchInfo) {
                        locationInfo = {
                            ...locationInfo,
                            batch_id: batchInfo.batch?.id
                        };
                        }
                    }
                    
                    return (
                        <>
                            <DaySummaryContent
                            key={loc.id}
                            location={locationInfo} 
                            today={today}
                            todayCalculation={todayCalc} //калькуляція на сьогодні
                            prevCalculation={prevCalc} // попередня калькуляція
                            times={times}
                            items={items}
                            />
                            
                        </>
                        
                    );  
                    }));
                })}
                </tbody>
                </table>
            ))}
            <DailyFeedWeightPage lines={lines} summary={summary} items={items} date={today} />
        </div>
    );
}

