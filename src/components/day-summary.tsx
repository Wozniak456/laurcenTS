'use client'

import React, { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import * as actions from '@/actions';
import { calculation_table } from "@prisma/client";


interface DaySummaryProps{
  currentDate: Date,
  pool: {
    id: number;
    name: string;
  },
  todayCalculation: calculationAndFeedName | null | undefined,
  prevCalculation: calculationAndFeedName | null | undefined,
  transitionDay: number | null,
  times: {
    id: number;
    time: string;
  }[],
  items: itemType[]
}

interface itemType{
    id: number;
    name: string;
    description: string | null;
    item_type_id: number | null;
    feed_type_id: number | null;
    default_unit_id: number | null;
    parent_item: number | null;
}

interface calculationAndFeedName{
  calculation?: calculation_table | undefined,
  feed? : {
    id?: number,
    name?: string
  }
}

export default function DaySummaryContent({
  currentDate, 
  pool, 
  todayCalculation, 
  prevCalculation, 
  transitionDay, 
  times,
  items
}
  : DaySummaryProps) {
 

  const [formState, action] = useFormState(actions.feedBatch, { message: '' });
  const initialSelectedItem = items.find(item => item.feed_type_id === todayCalculation?.feed?.id)?.id;
  const [selectedItem, setSelectedItem] = useState(initialSelectedItem);
  
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedItem(Number(event.target.value));
  };

  // useEffect(() => {
  //   // Тут ви можете робити що завгодно з новим значенням selectedItem
  //   console.log('Змінено selectedItem:', selectedItem);
  // }, [selectedItem]); // Вказати selectedItem як залежність

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Щоб уникнути стандартної поведінки відправки форми
    // Виконати логіку для відправки даних форми
  };

  return (
    <tr key={pool.id}>
      <td className="px-4 py-2 border border-gray-400">{pool.name}</td>
      {todayCalculation?.calculation ? 
        <React.Fragment>
          <td className="px-4 py-2 border border-gray-400">
          <div>
            <select
                name='feed_item_id'
                className="border rounded p-2 max-w-24 text-sm"
                id='feed_item_id'
                value={selectedItem || ''}
                onChange={handleSelectChange}
            >
              {items
              .filter(item => item.feed_type_id === todayCalculation?.feed?.id)
              .map(item => {
                return(<option 
                  key={item.id} 
                  value={item.id}
                  className="max-w-24"
                  >{item.name}</option>)
              })}   
            </select>

          </div>
        </td>
        <td className="px-4 py-2 border border-gray-400">{todayCalculation?.feed?.name}</td>
        </React.Fragment>
         : 
      <td className="px-4 py-2 border border-gray-400"></td>
        }
        
      {times.map(time => {
        if(todayCalculation?.calculation){
          return(
            <>
            <td className="px-4 py-2 border border-gray-400">{todayCalculation?.calculation?.feed_per_feeding.toFixed(0)}</td>
            <td className="px-4 py-2 border border-gray-400">
            <form action={action}>
              <input type="hidden" name="pool_id" value={pool.id} />
              <input type="hidden" name="executed_by" value={3} />
              <input type="hidden" name="feed_item_id" value={selectedItem} />
              
              <div className="flex justify-between">
                <input
                  name="feed_given"
                  className="border w-2/5"
                  id="feed_given"
                />
                <button
                  type="submit"
                  className="bg-blue-200 w-3/5 text-sm"
                >
                  Годувати
                </button>
              </div>
            </form>
            </td>
            </>
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
  );
}


