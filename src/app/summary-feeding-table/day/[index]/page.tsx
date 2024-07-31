import Link from "next/link";
import React from "react";
import { db } from "@/db";
import DailyFeedWeightPage from '@/app/feed-weight/view/page'

import * as stockingActions from "@/actions/stocking"
import * as actions from '@/actions'

import DaySummaryContent from "@/components/day-summary"

interface DayFeedingProps {
  params: {
    index: string;
  };
}

interface LocationInfo {
    location_id: number;
    location_name: string;
    batch_id?: bigint; 
  }

export default async function DayFeeding(props: DayFeedingProps) {
    const today = props.params.index;

    const currentDate: Date = new Date();
    
    let dates = [];

    for (let i = -2; i <= 7; i++) {
      let newDate = new Date();
      newDate.setDate(currentDate.getDate() + i);
      dates.push(newDate.toISOString().split("T")[0]);
    }

    const lines = await db.productionlines.findMany({
        include: {
          pools: {
            include:{
              locations: true
            }
          }
        }
    });

    const times = await db.time_table.findMany();
  
    const items = await db.items.findMany({
      where:{
        item_type_id: 3
      }
    })

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
                        location_name: loc.name
                    };

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
            <DailyFeedWeightPage date={today}/>
        </div>
    );
}

