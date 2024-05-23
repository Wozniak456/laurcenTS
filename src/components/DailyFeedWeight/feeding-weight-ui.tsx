// import React from 'react';
// import {Feed, Prio} from '@/types/app_types'
// import HandlePriorityComponent from "@/components/DailyFeedWeight/handle-priority-ui"

// export type LocationComponentType = {
//     locationInfo:{
//         location: {
//             id: number | undefined;
//             name: string | undefined;
//         };
//         calculation: {
//             feed_per_feeding: number | undefined;
//             fish_weight: number | undefined;
//         };
//         feed: {
//             feed_type_id: number | undefined;
//             feed_type_name: string | undefined;
//             feed_list: {
//                 item_id: number;
//                 feed_name: string
//             }[] | undefined;
//         };
//     }  | undefined
   
// } 

// export default function LocationComponent({locationInfo} : LocationComponentType) {
//     console.log(locationInfo)
//     return(
//         <>
//             <div className="flex justify-between my-4">
//                 <h1 className="text-lg font-bold">Наважка на день</h1>
//                 <div>
//                     <HandlePriorityComponent />
//                 </div>
//             </div>
        
//             <div className="flex justify-center items-center min-h-screen">
//                 <table className="w-1/2 bg-white rounded-lg shadow-lg">
//                     <thead>
//                         <tr className="bg-gray-800 text-white">
//                             <th className="border p-4">№ басейну</th>
//                             <th className="border p-4">Кількість, г</th>
//                             <th className="border p-4">Тип корму</th>
//                             <th className="border p-4">Корм</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {lines.map(line => (
//                             line.pools.map(pool => (
//                                 pool.locations.flatMap(async loc => {
//                                     const location_info = await getLocationInfo(loc.id);
                                    
//                                     if (location_info && location_info.feed.feed_list && location_info.feed.feed_list?.length > 1){
//                                         const prios = await getPriority(loc.id);
//                                     }
                                    

//                                     return (
//                                         <LocationComponent
//                                             key={loc.id}
//                                             locationInfo={location_info}
//                                         />
//                                     );
//                                 })
//                             ))
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </>
//     )
// }

