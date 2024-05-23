import React from 'react';
import {Feed, Prio} from '@/types/app_types'

export type LocationComponentType = {
    locationInfo:{
        location: {
            id: number | undefined;
            name: string | undefined;
        };
        calculation: {
            feed_per_feeding: number | undefined;
            fish_weight: number | undefined;
        };
        feed: {
            feed_type_id: number | undefined;
            feed_type_name: string | undefined;
            feed_list: {
                item_id: number;
                feed_name: string
            }[] | undefined;
        };
    }  | undefined
   
} 

export default function LocationComponent({locationInfo} : LocationComponentType) {
    return(
        <></>
    )
    
    // const renderedItem = () => {
    //     const hasPrio = priorities.find(prio => prio.priority)
    
    //     if (feed && feed?.feed_list.length > 1 && hasPrio){
    //         const minPriority = Math.min(...priorities.map(prio => prio.priority !== undefined ? prio.priority : Infinity));
    //         const priorityWithMinValue = priorities.find(prio => prio.priority === minPriority);
    //         return(
    //             <td className="px-4 h-10 border border-gray-400">{priorityWithMinValue?.item_name}</td>
    //         )
    //     } else if(feed && feed?.feed_list.length > 1 && !hasPrio)
    //         return(
    //             <td className="px-4 h-10 border border-gray-400 bg-red-200"></td>
    //         )
    //     else{
    //         return(
    //             <td className="px-4 h-10 border border-gray-400">{feed?.feed_list[0].feed_name}</td>
    //         )
    //     }
    // }
    // return (
    //     <tr key={location.id}>
    //         <td className="px-4  h-10 border border-gray-400">{location.name}</td>
    //         <td className="px-4  h-10 border border-gray-400">{calculation && calculation.feed_per_feeding ? calculation.feed_per_feeding.toFixed(0) : ''}</td>
    //         <td className="px-4  h-10 border border-gray-400">{feed && feed.feed_type_name}</td>
    //         {renderedItem()}
            
    //     </tr>
    //     )
}

