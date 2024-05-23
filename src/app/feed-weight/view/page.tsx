import { db } from "@/db";
import HandlePriorityComponent from "@/components/DailyFeedWeight/handle-priority-ui"
import LocationComponent from '@/components/DailyFeedWeight/location-info'
import { Feed } from '@/types/app_types'

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

    return(
        <>
        <div className="flex justify-between my-4">
            <h1 className="text-lg font-bold">Наважка на день</h1>
            <div>
                <HandlePriorityComponent />
            </div>
        </div>
        
        <div className="flex justify-center items-center min-h-screen">
            <table className="w-1/2 bg-white rounded-lg shadow-lg">
                <thead>
                    <tr className="bg-gray-800 text-white">
                        <th className="border p-4">№ басейну</th>
                        <th className="border p-4">Кількість, г</th>
                        <th className="border p-4">Тип корму</th>
                        <th className="border p-4">Корм</th>
                    </tr>
                </thead>
                <tbody>
                    {lines.map(line => (
                        line.pools.map(pool => (
                            pool.locations.flatMap(async loc => {
                                const location_info = await getLocationInfo(loc.id);
                                
                                if (location_info && location_info.feed.feed_list && location_info.feed.feed_list?.length > 1){
                                    const prios = await getPriority(loc.id);
                                }
                                
                                return (
                                    <LocationComponent
                                        key={loc.id}
                                        locationInfo={location_info}
                                    />
                                );
                            })
                        ))
                    ))}
                </tbody>
            </table>
        </div>
        </>
    )
}

const getLocationInfo = async (location_id : number) => {
    const calcResult = await db.calculation_table.findFirst({
        include:{
            documents: {
                include:{
                    locations: true
                }
            }
        },
        where:{
            date: new Date(), // сьогодні
            documents:{
                location_id: location_id // на певній локації
            }
        },
        orderBy:{
            id: 'desc'
        },
        take: 1
    })

    if (calcResult){
        const feeds = await getFeed (calcResult.fish_weight)

        return {
            location: {
                id: calcResult.documents.locations?.id,
                name: calcResult.documents.locations?.name
            },
            calculation:{
                feed_per_feeding: calcResult.feed_per_feeding,
                fish_weight: calcResult.fish_weight
            },
            feed:{
                feed_type_id: feeds?.feed_type_id,
                feed_type_name: feeds?.feed_type_name,
                feed_list: feeds?.feed_list.map(feed => {
                    return{
                        item_id: feed.item_id,
                        feed_name: feed.feed_name
                    }
                })
            }
        }
    } 
}    


const getPriority = async (location_id: number) => {

    const priorities = await db.priorities.findMany({
        include:{
            items: true
        },
        where:{
            location_id: location_id
        }
    })

    return priorities.map(priority => ({
        item_id: priority.item_id,
        item_name: priority.items?.name,
        priority: priority.priority
    }));
}


const getFeed = async (fish_weight : number) : Promise<Feed> => {
    const connection = await db.feedconnections.findFirst({
        include:{
            feedtypes: true
        },
        where:{
            from_fish_weight:{
                lte: fish_weight
            },
            to_fish_weight:{
                gte: fish_weight
            }
        }
    })

    if (connection){
        // знаходимо усі items, з feed_type_id   
        const uniqueFeedsPerType = await db.items.findMany({
            where:{
                feed_type_id: connection.feed_type_id 
            }        
        })     

        return(
        {
            feed_type_id: connection.feed_type_id,
            feed_type_name: connection.feedtypes?.name,
            feed_list: uniqueFeedsPerType
            .map(feed => 
            {
                return{
                    item_id: feed.id,
                    feed_name: feed.name
                }
            })
        })
    }
}
