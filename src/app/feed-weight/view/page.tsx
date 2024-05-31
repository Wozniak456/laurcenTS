import { db } from "@/db";
import LocationComponent from '@/components/DailyFeedWeight/location-info'
// import { Feed, LocationComponentType } from '@/types/app_types'
import * as actions from "@/actions/feeding"
import { calculationAndFeed, calculationAndFeedExtended } from '@/types/app_types'

type AccumulatorType = {
[key: number]: {
    totalAmount: number
}
};

// const today = new Date()

const today: Date = new Date();
today.setDate(today.getDate() );

export default async function DailyFeedWeightPage (){
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
        const todayCalc = await actions.getTodayCalculation(location_id, today)
        
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
        <h1 className="text-lg font-bold my-4 mx-8">Дата: {today.toISOString().split("T")[0]}</h1>
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
                                const todayCalc : calculationAndFeed = await actions.getTodayCalculation(loc.id, today);
                                
                                let todayCalcExtended : calculationAndFeedExtended | undefined

                                if (todayCalc.calculation && todayCalc.feed?.type_id){
                                    todayCalcExtended = {
                                        ...todayCalc,
                                        allItems : await getAllItemsForFeedType(todayCalc.feed?.type_id)
                                    }
                                }
                                
                                let prevCalc;
                                let prevCalcExtended : calculationAndFeedExtended | undefined

                                if (todayCalc.calculation?.transition_day ){
                                    prevCalc = await actions.getPrevCalc(loc.id, todayCalc);

                                    if (prevCalc && prevCalc.calculation && prevCalc.feed?.type_id){
                                        prevCalcExtended = {
                                            ...prevCalc,
                                            allItems : await getAllItemsForFeedType(prevCalc.feed?.type_id)
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

const getSummaryInfo = async () => {


    // const docs = await db.documents.groupBy({
    //     by: ['location_id'],
    //     where:{
    //         doc_type_id: 7
    //     },
    //     _max:{
    //         id: true
    //     }
    // });

    // const idsWithLocationIdAndPriority = await Promise.all(docs.map(async (doc) => {
    //     if (doc._max.id){
    //         const docWithLoc = await db.documents.findFirst({
    //             select:{
    //                 location_id: true
    //             },
    //             where:{
    //                 id: doc._max.id
    //             }
    //         });
    
    //         const calc_table = await db.calculation_table.findFirst({
    //             select:{
    //                 feed_per_feeding: true,
    //                 fish_weight: true
    //             },
    //             where:{
    //                 doc_id: doc._max.id,
    //                 date: today
    //             }, 
    //         })

    //         const feedconnections = await db.feedconnections.findFirst({
    //             select:{
    //                 feed_type_id : true,
    //                 feedtypes:{
    //                     select:{
    //                         items:{
    //                             select: {
    //                                 id: true
    //                             }
    //                         }
    //                     }
    //                 }
    //             },
    //             where: {
    //                 from_fish_weight: {
    //                     lte: calc_table?.fish_weight
    //                 },
    //                 to_fish_weight: {
    //                     gte: calc_table?.fish_weight
    //                 }
    //             }
    //         });

    //         let prio
            
    //         if (docWithLoc?.location_id){
    //             prio = await db.priorities.findFirst({
    //                 where:{
    //                     location_id: docWithLoc?.location_id
    //                 }
    //             })
    //             if (!prio){
    //                 prio = {
    //                     item_id: feedconnections?.feedtypes?.items[0].id
    //                 }
    //             }
    //         }

    //         return {
    //             ...doc,
    //             location_id: docWithLoc?.location_id,
    //             prio: prio?.item_id,
    //             amount: calc_table?.feed_per_feeding
    //         };
    //     }
    // }));

    // const groupedByPrio = idsWithLocationIdAndPriority.reduce((acc: AccumulatorType, item) => {
    //     if (item && item.prio !== undefined && item.amount !== undefined) { // Ensure item is defined and has prio and amount
    //       const prio = item.prio;
    //       if (!acc[prio]) {
    //         acc[prio] = { totalAmount: 0 };
    //       }
    //       acc[prio].totalAmount += item.amount; // Check if item.amount is defined before summing
    //     }
    //     return acc;
    //   }, {});

    //   const transformedData = await Promise.all(Object.keys(groupedByPrio).map(async (prio) => {
    //     const prioNumber = parseInt(prio);
    //     if (!isNaN(prioNumber)) {
    //       const item = await db.items.findFirst({
    //         select:{
    //             name: true,
    //             feedtypes:{
    //                 select:{
    //                     name: true
    //                 }
    //             }
    //         },
    //         where: {
    //           id: prioNumber
    //         }
    //       });
    //       return {
    //         prio: {
    //             feed_type: item?.feedtypes?.name,
    //             feed_name: item?.name
    //         },
    //         totalAmount: groupedByPrio[prioNumber].totalAmount,
            
    //       };
    //     }
    //     return null;
    //   }));
      
    // //   console.log(transformedData);
      
    // return transformedData

}





// const getLocationInfo = async (location_id : number) => {
//     const calcResult = await db.calculation_table.findFirst({
//         include:{
//             documents: {
//                 include:{
//                     locations: true
//                 }
//             }
//         },
//         where:{
//             date: today, // сьогодні
//             documents:{
//                 location_id: location_id // на певній локації
//             }
//         },
//         orderBy:{
//             id: 'desc'
//         },
//         take: 1
//     })

//     if (calcResult){
//         const feeds = await getFeed (calcResult.fish_weight)

//         return {
//             location: {
//                 id: calcResult.documents.locations?.id,
//                 name: calcResult.documents.locations?.name
//             },
//             calculation:{
//                 feed_per_feeding: calcResult.feed_per_feeding,
//                 fish_weight: calcResult.fish_weight
//             },
//             feed:{
//                 feed_type_id: feeds?.feed_type_id,
//                 feed_type_name: feeds?.feed_type_name,
//                 feed_list: feeds?.feed_list.map(feed => { 
//                     return{
//                         item_id: feed.item_id,
//                         feed_name: feed.feed_name
//                     }
//                 })
//             }
//         }
//     } 
// }    


// const getPriorities = async (location_id: number) => {
    
//     const priorities = await db.priorities.findMany({
//         include:{
//             items: true
//         },
//         where:{
//             location_id: location_id
//         }
//     })

//     return priorities.map(priority => ({
//         item_id: priority.item_id,
//         item_name: priority.items?.name,
//         location_id: priority.location_id
//         // priority: priority.priority
//     }));
// }


// const getFeed = async (fish_weight : number) : Promise<Feed> => {
//     const connection = await db.feedconnections.findFirst({
//         include:{
//             feedtypes: true
//         },
//         where:{
//             from_fish_weight:{
//                 lte: fish_weight
//             },
//             to_fish_weight:{
//                 gte: fish_weight
//             }
//         }
//     })

//     if (connection){
//         // знаходимо усі items, з feed_type_id   
//         const uniqueFeedsPerType = await db.items.findMany({
//             where:{
//                 feed_type_id: connection.feed_type_id 
//             }        
//         })     

//         return(
//         {
//             feed_type_id: connection.feed_type_id,
//             feed_type_name: connection.feedtypes?.name,
//             feed_list: uniqueFeedsPerType
//             .map(feed => 
//             {
//                 return{
//                     item_id: feed.id,
//                     feed_name: feed.name
//                 }
//             })
//         })
//     }
// }
