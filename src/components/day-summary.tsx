'use client'

import React, { ChangeEvent, use, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import * as actions from '@/actions';
import { calculationAndFeed } from '@/types/app_types'
import Image from 'next/image';
import feedButton from '../../public/icons/typcn_arrow-up-outline.svg'
import SuccessButton from'../../public/icons/SuccessFeeding.svg'
import CrossButton from'../../public/icons/UnsuccessfulFeeding.svg'


interface DaySummaryProps{
  location: {
    location_id: number;
    location_name: string;
    batch_id?: bigint; // batch_id є необов'язковим
  },
  todayCalculation: calculationAndFeed | null | undefined,
  prevCalculation: calculationAndFeed | null | undefined,
  times: {
    id: number;
    time: string;
  }[],
  items: itemType[]
}

interface itemType{
    id: number | undefined;
    name: string | undefined;
    description: string | null;
    item_type_id: number | null;
    feed_type_id: number | null;
    default_unit_id: number | null;
    parent_item: number | null;
}

type feedArray = {
  item_id: number | undefined,
  qty: string | undefined
}

export default function DaySummaryContent({
  location, 
  todayCalculation, 
  prevCalculation, 
  times,
  items
}
  : DaySummaryProps) {
    

  const [formState, action] = useFormState(actions.feedBatch, { message: '' });
  
  const transitionDay = todayCalculation?.calculation?.transition_day

  let initialValues = times.map(() => 
    transitionDay && todayCalculation?.calculation?.feed_per_feeding
      ? (todayCalculation?.calculation?.feed_per_feeding * (transitionDay * 0.2)).toFixed(1) ?? "0"
      : todayCalculation?.calculation?.feed_per_feeding.toFixed(1) ?? "0"
  );

  if (transitionDay && prevCalculation?.calculation){
    initialValues = [
      ...initialValues,
      ...times.map(() =>
        todayCalculation?.calculation?.feed_per_feeding
          ? (todayCalculation.calculation.feed_per_feeding * (1 - transitionDay * 0.2)).toFixed(1) ?? "0"
          : "0"
      )
    ];

  }
  
  const [inputValues, setInputValues] = useState<string[]>(initialValues);
  
  const handleInputChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const newValues = [...inputValues];
    newValues[index] = event.target.value;
    setInputValues(newValues);
  };

  const todayFeed = items.find(item => item.id === todayCalculation?.feed?.item_id);  

  let prevFeed 
  if(transitionDay && prevCalculation?.calculation){
    prevFeed = items.find(item => item.id === prevCalculation?.feed?.item_id);
  }

  const [buttonMode, setButtonMode] = useState(false);

  useEffect(()=> {
    console.log('buttonMode changed',buttonMode)
  },[buttonMode])

  return (
    <>
     <tr key={`${location.location_id}`}>
     {/* <tr key={`${pool.id}-1`}> */}
      <td rowSpan={transitionDay ? 2 : 1} className="px-4 py-2 border border-gray-400 w-14">{location.location_name}</td>
      {todayCalculation?.calculation ? 
        <React.Fragment>
          <td className="px-4 py-2 border border-gray-400">{transitionDay ? prevCalculation?.feed?.type_name : todayCalculation?.feed?.type_name}</td>
          <td className="px-4 py-2 border border-gray-400 w-40">{transitionDay && prevCalculation ? items.find(item => item.id === prevCalculation.feed?.item_id)?.name : items.find(item => item.id === todayCalculation.feed?.item_id)?.name}</td>
        
        </React.Fragment>
         : 
         <React.Fragment>
          <td className="px-4 py-2 border border-gray-400"></td>
          <td className="px-4 py-2 border border-gray-400"></td>
         </React.Fragment>
        }
        
      {times.map((time, index) => {
        if(todayCalculation?.calculation){ 
          return(
            <React.Fragment key={index}>
            <td className="px-4 py-2 border border-gray-400">{transitionDay ? (todayCalculation?.calculation?.feed_per_feeding * (transitionDay * 0.2)).toFixed(1) : todayCalculation?.calculation?.feed_per_feeding.toFixed(1)}</td>
            <td className="px-4 py-2 border border-gray-400">
            <form action={action}>
              
              <div className="flex justify-center">
              <input
                name={`feed_given`}
                className="border border-black w-full bg-blue-100 text-center"
                id={`feed_given_${index}`}
                value={inputValues[index]}
                onChange={handleInputChange(index)}
              />
              </div>
            </form>
            </td>
            
            </React.Fragment >
          )
          
        }
        else{
          return(
            <>
            <td className="px-4 py-2 border border-gray-400"></td>
            <td className="px-4 py-2 border border-gray-400"></td>
            
            </>
          )
        }
      
      })}
      <td rowSpan={transitionDay ? 2 : 1} className="px-4 py-2 border border-gray-400">
      {todayCalculation?.calculation && 
        <form action={action}>
          <input type="hidden" name="location_id" value={location.location_id} />
          <input type="hidden" name="executed_by" value={3} />
          <input type="hidden" name="item_1" value={todayFeed?.id} />
          <input type="hidden" name="batch_id" value={Number(location.batch_id)} />

          {transitionDay && prevCalculation?.calculation &&
            <input type="hidden" name="item_0" value={prevFeed?.id} />
          }

          {
            inputValues.map((value, index) => (
              <input type="hidden" name={`input_${index}`} value={value} />
            ))
          }
          
          <div className="flex justify-center">
          <button 
            type="submit" 
            className="inline-flex items-center justify-center transform transition-transform duration-100 active:scale-50 focus:scale-100"
            onClick={() => { setButtonMode(true); }}
          >
            {!buttonMode && <Image src={feedButton} alt="feeding icon" height={35} />}
            {formState.message && 
            <>
            {buttonMode && <Image 
                src={formState.message.includes('успішно') ? SuccessButton : CrossButton} 
                alt="status icon" 
                height={30}/>}
            </>
              
            }
{/* 
            {formState.message && 
            <p>{formState.message}</p>
              
            } */}
          </button>
        </div>
        </form>
      }
      </td>
    </tr>
    {transitionDay &&
    <tr key={location.location_id}> 
    {/* <tr key={`${pool.id}-1`}></tr> */}
    {todayCalculation?.calculation ? 
      <React.Fragment>
        <td className="px-4 py-2 border border-gray-400">{todayCalculation?.feed?.type_name}</td>
        <td className="px-4 py-2 border border-gray-400">{items.find(item => item.id === todayCalculation.feed?.item_id)?.name}</td>
      
      </React.Fragment>
       : 
    <td className="px-4 py-2 border border-gray-400"></td>
      }
      
    {times.map((time, index) => {
      if(todayCalculation?.calculation){
        return(
          <React.Fragment key={index}>
          <td className="px-4 py-2 border border-gray-400">{(todayCalculation?.calculation?.feed_per_feeding * (1 - transitionDay * 0.2)).toFixed(1)}</td>
          
          <td className="px-4 py-2 border border-gray-400">
          <form action={action}>
            
            <div className="flex justify-between">
              <input
                name={`feed_given`}
                className="border border-black w-full bg-blue-100 text-center"
                id={`feed_given_${index+times.length}`}
                value={inputValues[index+times.length]}
                onChange={handleInputChange(index+times.length)}
              />
            </div>
          </form>
          </td>
          </React.Fragment>
        )
        
      }
      else{
        return(
          <>
          <td className="px-4 py-2 border border-gray-400"></td>
          <td className="px-4 py-2 border border-gray-400"></td>
          </>
        )
      }
    
    })}
  </tr>
    }
        </>
  );
}


