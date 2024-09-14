import Link from "next/link";
import React from "react";
import { db } from "@/db";
import DailyFeedWeightPage from '@/components/DailyFeedWeight/daily-feed-weight'
import * as feedingActions from "@/actions/feeding"

import * as stockingActions from "@/actions/stocking"
import * as actions from '@/actions'

import DaySummaryContent from "@/components/day-summary"
import { start } from "repl";
import ExportButton from "@/components/dayFeedingTableToPrint";

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

interface feedingInfo{
    date: string,
    poolId: number,
    rowCount?: number
    feedType?: string,
    feedName?: string,
    feeding6?: string,
    editing6: string,
    feeding10?: string,
    editing10: string,
    feeding14?: string,
    editing14: string,
    feeding18?: string,
    editing18: string,
    feeding22?: string,
    editing22: string,
}

export default async function DayFeeding(props: DayFeedingProps) {
    const today = props.params.index;

    // console.log('today', today)

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
                    name: true,
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
        return feedingDocument.length >= 1;
    }

    // Змінна для зберігання масиву даних
    let data : feedingInfo[] = [];

    for (const line of lines) {
        for (const pool of line.pools) {
            for (const loc of pool.locations) {
                const isPoolFilled = await actions.isFilled(loc.id);
                let prevCalc = null;

                let locationInfo: LocationInfo = {
                    location_id: loc.id,
                    location_name: loc.name,
                    fed_today: await feedingForLocation(loc.id)
                };

                let todayCalc = null;

                if (isPoolFilled) {
                    todayCalc = await stockingActions.calculationForLocation(loc.id, today);

                    if (todayCalc.calc?.transition_day !== null) {
                        prevCalc = await stockingActions.getPrevCalc(loc.id, todayCalc);
                    }

                    const batchInfo = await stockingActions.poolInfo(loc.id, today);

                    if (batchInfo) {
                        locationInfo = {
                            ...locationInfo,
                            batch_id: batchInfo.batch?.id
                        };
                    }
                }

                const getEdited = async (hours: number) => {

                    const todayDate = new Date(today)

                    todayDate.setUTCHours(hours, 0, 0, 0);
                    const fedAlready = await db.documents.findMany({
                        select:{
                            itemtransactions:{
                                select:{
                                    quantity: true
                                },
                                where:{
                                    location_id: loc.id
                                }
                            },
                            location_id: true
                        },
                        where:{
                            location_id: loc.id,
                            doc_type_id: 9,
                            date_time: todayDate
                        }
                    })  

                    return(fedAlready)
                }

                const editing6 = await getEdited(6)
                const editing10 = await getEdited(10)
                const editing14 = await getEdited(14)
                const editing18 = await getEdited(18)
                const editing22 = await getEdited(22)

                const transition = todayCalc?.calc?.transition_day

                const feedingAmount = transition && todayCalc?.calc?.feed_per_feeding && todayCalc?.calc?.feed_per_feeding * (1 - transition * 0.2)
                
                data.push(
                    {
                        date: today,
                        poolId: pool.id,
                        rowCount: todayCalc?.calc?.transition_day ? 2 : 1,
                        feedType: transition ? prevCalc?.feed.type_name : todayCalc?.feed.type_name,
                        feedName: transition ? prevCalc?.feed.item_name : todayCalc?.feed.item_name,
                        feeding6: transition ? feedingAmount?.toFixed(1) : todayCalc?.calc?.feed_per_feeding.toFixed(1),
                        editing6: editing6[0]?.itemtransactions[0]?.quantity ? (editing6[0]?.itemtransactions[0]?.quantity * 1000).toFixed(1) : '',
                        feeding10: transition ? feedingAmount?.toFixed(1) : todayCalc?.calc?.feed_per_feeding.toFixed(1),
                        editing10: editing10[0]?.itemtransactions[0]?.quantity ? (editing10[0]?.itemtransactions[0]?.quantity * 1000).toFixed(1) : '',
                        feeding14: transition ? feedingAmount?.toFixed(1) : todayCalc?.calc?.feed_per_feeding.toFixed(1),
                        editing14: editing14[0]?.itemtransactions[0]?.quantity ? (editing14[0]?.itemtransactions[0]?.quantity * 1000).toFixed(1) : '',
                        feeding18: transition ? feedingAmount?.toFixed(1) : todayCalc?.calc?.feed_per_feeding.toFixed(1),
                        editing18: editing18[0]?.itemtransactions[0]?.quantity ? (editing18[0]?.itemtransactions[0]?.quantity * 1000).toFixed(1) : '',
                        feeding22: transition ? feedingAmount?.toFixed(1) : todayCalc?.calc?.feed_per_feeding.toFixed(1),
                        editing22: editing22[0]?.itemtransactions[0]?.quantity ? (editing22[0]?.itemtransactions[0]?.quantity * 1000).toFixed(1) : '',
                    }
                );

                if(transition) {
                    const feedingAmount = todayCalc?.calc?.feed_per_feeding && todayCalc?.calc?.feed_per_feeding * (transition * 0.2)
               
                    data.push(
                        {
                            date: today,
                            poolId: pool.id,
                            rowCount: todayCalc?.calc?.transition_day ? 2 : 1,
                            feedType: todayCalc?.feed.type_name,
                            feedName: todayCalc?.feed.item_name,
                            feeding6: feedingAmount?.toFixed(1),
                            editing6: editing6[1]?.itemtransactions[0]?.quantity ? (editing6[1]?.itemtransactions[0]?.quantity * 1000).toFixed(1) : '',
                            feeding10: feedingAmount?.toFixed(1),
                            editing10: editing10[1]?.itemtransactions[0]?.quantity ? (editing10[1]?.itemtransactions[0]?.quantity * 1000).toFixed(1) : '',
                            feeding14: feedingAmount?.toFixed(1),
                            editing14: editing14[1]?.itemtransactions[0]?.quantity ? (editing14[1]?.itemtransactions[0]?.quantity * 1000).toFixed(1) : '',
                            feeding18: feedingAmount?.toFixed(1),
                            editing18: editing18[1]?.itemtransactions[0]?.quantity ? (editing18[1]?.itemtransactions[0]?.quantity * 1000).toFixed(1) : '',
                            feeding22: feedingAmount?.toFixed(1),
                            editing22: editing22[1]?.itemtransactions[0]?.quantity ? (editing22[1]?.itemtransactions[0]?.quantity * 1000).toFixed(1) : '',
                        }
                    );
                }
                



                // console.log(todayCalc?.feed.item_name)
            }
        }
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
            <div className="flex justify-end my-2">
                <ExportButton times={times} lines={lines} data={data} />
            </div>
            <div>*Кількість вказана у грамах</div>
            

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
                            todayCalculation={todayCalc} 
                            prevCalculation={prevCalc} 
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

