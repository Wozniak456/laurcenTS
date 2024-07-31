'use client'
import React, { useState } from 'react';
import { calculationAndFeedExtended} from '@/types/app_types'
import PriorityForm from '@/components/DailyFeedWeight/priority-form'

export type LocationComponentProps = {
    location: { 
        id: number; 
        name: string;
    } 
    todayCalculation: calculationAndFeedExtended | undefined,
    prevCalculation: calculationAndFeedExtended | undefined
} 

export default function LocationComponent({location, todayCalculation, prevCalculation} : LocationComponentProps) {   
  
    const [showPrioForm, setShowPrioForm] = useState<boolean>(false);
    const [selectedDay, setSelectedDay] = useState<calculationAndFeedExtended | null>(null);

    const handleClick = (day: calculationAndFeedExtended) => {
        setSelectedDay(day);
        setShowPrioForm(prev => !prev);
    };

    const transitionDay = todayCalculation?.calc?.transition_day

    const renderedItem = (day : calculationAndFeedExtended) => {
        if (day?.calc !== null && day?.allItems && day?.allItems?.length > 1 && day?.feed?.definedPrio){
            return(
                <td className="px-4 h-10 border border-gray-400 bg-green-100 cursor-pointer" onClick={() => handleClick(day)}>{day?.allItems?.find(item => item.item_id == day.feed?.item_id)?.item_name}</td>
            )
        } else if(day?.calc !== null && day?.allItems && day?.allItems?.length == 1 && day?.feed?.definedPrio){
            return(
                <td className="px-4 h-10 border border-gray-400 cursor-pointer" onClick={() => handleClick(day)}>{day?.allItems?.find(item => item.item_id == day.feed?.item_id)?.item_name}</td>
            )
        } else if(day?.calc !== null && day?.allItems && day?.allItems?.length > 1 && !day?.feed?.definedPrio)
            return(
                <td className="px-4 h-10 border border-gray-400 bg-red-200 cursor-pointer" onClick={() => handleClick(day)}>{day?.allItems?.find(item => item.item_id == day.feed?.item_id)?.item_name}</td>
            )
        else {
            return(
                <td className="px-4 h-10 border border-gray-400"></td>
            )
        }
    }

    return (
        <>
        <tr key={`${location.id}-${1}`}>
            <td rowSpan={transitionDay ? 2 : 1} className="px-4 h-10 border border-gray-400">{location.name}</td>


            {transitionDay && todayCalculation?.calc?.feed_per_feeding ? 
            <React.Fragment>
                <td className="px-4 h-10 border border-gray-400">{(todayCalculation?.calc?.feed_per_feeding * (transitionDay * 0.2)).toFixed(0)}</td> 
                <td className="px-4 h-10 border border-gray-400">{prevCalculation?.feed?.type_name}</td>
            </React.Fragment>
            
            :
            <React.Fragment>
                <td className="px-4 h-10 border border-gray-400">{todayCalculation?.calc?.feed_per_feeding ? (todayCalculation?.calc?.feed_per_feeding).toFixed(0) : ''}</td>
                <td className="px-4 h-10 border border-gray-400">{todayCalculation?.feed?.type_name}</td>
            </React.Fragment>
            
            } 

            {prevCalculation ? renderedItem(prevCalculation) 
            : todayCalculation ? renderedItem(todayCalculation) : <td className="px-4 h-10 border border-gray-400"></td>}


        </tr>
        {transitionDay && todayCalculation?.calc?.feed_per_feeding &&
        <tr key={`${location.id}-${2}`}>
            <td className="px-4 h-10 border border-gray-400">{(todayCalculation?.calc?.feed_per_feeding * (1 - transitionDay * 0.2)).toFixed(0)}</td>
            <td className="px-4 h-10 border border-gray-400">{todayCalculation?.feed?.type_name}</td>
            {renderedItem(todayCalculation)}
        </tr>
        }

        {selectedDay && showPrioForm && (
            <PriorityForm location={location} calculation={selectedDay} setShowForm={setShowPrioForm} />
        )}
        
        </>
        
        )
}

