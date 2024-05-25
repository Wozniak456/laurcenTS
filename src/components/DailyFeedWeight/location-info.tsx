'use client'
import React, { useState } from 'react';
import {Feed, LocationComponentType, Prio} from '@/types/app_types'
import PriorityForm from '@/components/DailyFeedWeight/priority-form'

export type LocationComponentProps = {
    locationInfo: LocationComponentType
    priorities: {
        item_id: number;
        item_name: string | undefined;
        location_id: number
    }[]
} 

export default function LocationComponent({locationInfo, priorities} : LocationComponentProps) {   
    const [showPrioForm, setShowPrioForm] = useState<boolean>(false);

    const handleClick = () => {
        setShowPrioForm(prev => !prev);
    };
    
    const renderedItem = () => {
        const hasPrio = priorities.find(prio => prio.location_id === locationInfo?.location.id)
    
        if (locationInfo?.feed && locationInfo.feed?.feed_list && locationInfo.feed?.feed_list.length > 1 && hasPrio){
            return(
                <td className="px-4 h-10 border border-gray-400 bg-blue-100 cursor-pointer" onClick={handleClick}>{hasPrio.item_name}</td>
            )
        } else if(locationInfo?.feed && locationInfo?.feed?.feed_list && locationInfo?.feed?.feed_list.length > 1 && !hasPrio)
            return(
                <td className="px-4 h-10 border border-gray-400 bg-red-200 cursor-pointer" onClick={handleClick}>{locationInfo.feed.feed_list[0].feed_name}</td>
            )
        else if (locationInfo && locationInfo.feed?.feed_list){
            return(
                <td className="px-4 h-10 border border-gray-400" >{locationInfo.feed?.feed_list[0].feed_name}</td>
            )
        }
        else {
            return(
                <td className="px-4 h-10 border border-gray-400"></td>
            )
        }
    }
    return (
        <>
        <tr key={locationInfo?.location.id}>
            <td className="px-4 h-10 border border-gray-400">{locationInfo?.location.name}</td>
            <td className="px-4 h-10 border border-gray-400">{locationInfo?.calculation && locationInfo?.calculation.feed_per_feeding ? locationInfo?.calculation.feed_per_feeding.toFixed(0) : ''}</td>
            <td className="px-4 h-10 border border-gray-400">{locationInfo?.feed && locationInfo.feed.feed_type_name}</td>
            {renderedItem()}
            
        </tr>
        {locationInfo && showPrioForm && <PriorityForm location={locationInfo} setShowForm={setShowPrioForm} priorities={priorities}/>}
        </>
        
        )
}

