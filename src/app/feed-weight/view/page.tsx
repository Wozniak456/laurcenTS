import { db } from "@/db";
import LocationComponent from '@/components/DailyFeedWeight/location-info'
// import { Feed, LocationComponentType } from '@/types/app_types'
import * as actions from "@/actions/feeding"
import { calculationAndFeed, calculationAndFeedExtended } from '@/types/app_types'


// const today: Date = new Date();
// today.setDate(today.getDate() );

interface DailyFeedWeightPageProps{
    date: string
}

export default async function DailyFeedWeightPage (today : DailyFeedWeightPageProps){

    const lines = await db.productionlines.findMany({
        include:{
            pools:{
                include:{
                    locations: true
                }
            }
        }
    })

    const getLocationSummary = (async (location_id: number) => {
        const todayCalc = await actions.getTodayCalculation(location_id, new Date(today.date))
        
        const prevCalc = await actions.getPrevCalc(location_id, todayCalc);
        return {todayCalc, prevCalc}
    })

    type LocationSummary = {
        uniqueItemId: number;
        totalFeed: number;
    };

    const getAllSummary = async () => {
        const locationSummary: { [itemId: number]: LocationSummary } = {};
      
        await Promise.all(
          lines.map(async line => {
            await Promise.all(
              line.pools.map(async pool => {
                await Promise.all(
                  pool.locations.map(async loc => {

                    const isPoolFilled = await isFilled(loc.id)

                    if (isPoolFilled == true){
                        const { todayCalc, prevCalc } = await getLocationSummary(loc.id);
      
                    // Обробка todayCalc
                    if (todayCalc && todayCalc.feed && todayCalc.calculation && todayCalc.feed.item_id) {
                        const itemId = todayCalc.feed.item_id;
                        let feedPerFeeding = todayCalc.calculation.feed_per_feeding;
                        
                        // let feedingEdited

                        if(todayCalc.calculation.transition_day){
                            feedPerFeeding = feedPerFeeding * (1 - todayCalc.calculation.transition_day * 0.2)
                        }

                        if (!locationSummary[itemId]) {
                            locationSummary[itemId] = {
                            totalFeed: feedPerFeeding,
                            uniqueItemId: itemId,
                            };
                            // console.log(`Додаємо ${feedPerFeeding} до корму: ${itemId}`)
                        } else {
                            locationSummary[itemId].totalFeed += feedPerFeeding;
                            // console.log(`Додаємо ${feedPerFeeding} до корму: ${itemId}`)
                        }
                    }
      
                    // Обробка prevCalc
                    if (prevCalc && prevCalc.feed && prevCalc.calculation && prevCalc.feed.item_id && todayCalc && todayCalc.feed && todayCalc.calculation) {
                        const itemId = prevCalc.feed.item_id;
                        let feedPerFeeding = todayCalc.calculation.feed_per_feeding;

                        if(todayCalc.calculation.transition_day){
                            feedPerFeeding = feedPerFeeding * (todayCalc.calculation.transition_day * 0.2)
                        }
                        
                        if (todayCalc.calculation.transition_day){
                            if (!locationSummary[itemId]) {
                                locationSummary[itemId] = {
                                totalFeed: feedPerFeeding,
                                uniqueItemId: itemId,
                                };
                                // console.log(`Додаємо ${feedPerFeeding} до корму: ${itemId}`)
                            } else {
                                locationSummary[itemId].totalFeed += feedPerFeeding;
                                // console.log(`Додаємо ${feedPerFeeding} до корму: ${itemId}`)
                            }

                        }
                        
                    }

                    }

                    
                  })
                );
              })
            );
          })
        );
      
        return locationSummary;
    };
      

    const summary = await getAllSummary()

    const items = await db.items.findMany()
        
    return(
        <>
        {/* <h1 className="text-lg font-bold my-4 mx-8">Дата: {today.toISOString().split("T")[0]}</h1> */}
        <div className="flex justify-between my-4 mx-8">
            <h1 className="text-lg font-bold">Наважка на 1 годування</h1>
            <h1 className="text-lg font-bold">Зведена таблиця</h1>
        </div>
        
        <div className="flex justify-around min-h-screen content-start">
            <table className="w-1/2 bg-white rounded-lg shadow-lg">
                <thead>
                    <tr className="bg-gray-800 text-white">
                        <th className="border p-4">№ басейну</th>
                        <th className="border p-4">К-сть, г</th>
                        <th className="border p-4">Тип корму</th>
                        <th className="border p-4">Корм</th>
                    </tr>
                </thead>
                <tbody>
                    {lines.map(line => (
                        line.pools.map(pool => (
                            pool.locations.flatMap(async loc => {
                                //перевірка чи локація не пуста
                                const isPoolFilled = await isFilled(loc.id)

                                let todayCalcExtended : calculationAndFeedExtended | undefined
                                let prevCalc;
                                let prevCalcExtended : calculationAndFeedExtended | undefined

                                if(isPoolFilled === true){
                                    const todayCalc : calculationAndFeed = await actions.getTodayCalculation(loc.id, new Date(today.date));

                                    if (todayCalc.calculation && todayCalc.feed?.type_id){
                                        todayCalcExtended = {
                                            ...todayCalc,
                                            allItems : await getAllItemsForFeedType(todayCalc.feed?.type_id)
                                        }
                                    }
                               
                                    if (todayCalc.calculation?.transition_day ){
                                        prevCalc = await actions.getPrevCalc(loc.id, todayCalc);

                                        if (prevCalc && prevCalc.calculation && prevCalc.feed?.type_id){
                                            prevCalcExtended = {
                                                ...prevCalc,
                                                allItems : await getAllItemsForFeedType(prevCalc.feed?.type_id)
                                            }
                                        }
                                    }
                                }

                                return (
                                    <LocationComponent
                                        key={loc.id}
                                        location={{ id: loc.id, name: loc.name}}
                                        todayCalculation={todayCalcExtended}
                                        prevCalculation={prevCalcExtended}
                                    />
                                );
                            })
                        ))
                    ))}
                </tbody>
            </table>
            <table className="w-1/3 bg-white rounded-lg shadow-lg self-start">
                <thead>
                    <tr className="bg-gray-800 text-white">
                        <th className="border p-4">Корм</th>
                        <th className="border p-4">Кількість</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(summary).map(([itemId, summary]) => (
                        <tr key={itemId}>
                            <td className="px-4 h-10 border border-gray-400">{items.find(item => item.id === summary.uniqueItemId)?.name}</td>
                            <td className="px-4 h-10 border border-gray-400">{summary.totalFeed.toFixed(0)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
    )
}

async function getAllItemsForFeedType(feed_type_id : number){
    const items = await db.items.findMany({
        where:{
            feed_type_id: feed_type_id
        }
    })

    return(
        items.map(item => {
            return({
                item_id: item.id,
                item_name: item.name
            })
        })
    )
}

const isFilled = async (location_id : number)  => {
    const lastStocking = await db.itemtransactions.findFirst({
        where:{
            documents:{
                doc_type_id: 1 //зариблення
            },
            location_id: location_id,
        },
        orderBy:{
            id: 'desc'
        },
        take: 1
    })

    if (lastStocking && lastStocking?.quantity > 0){
        return true
    }else{
        return false
    }
}