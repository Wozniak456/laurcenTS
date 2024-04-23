'use client'

import React, { useState } from "react";
import { useFormState } from "react-dom";
import * as actions from '@/actions';
import { calculation_table } from "@prisma/client";
import getFeed from "@/app/summary-feeding-table/day/page";

interface DaySummaryProps{
  currentDate: Date,
  pool: {
    id: number;
    name: string;
  },
  poolAnd14Calc: calculation_table[],
  times: {
    id: number;
    time: string;
  }[],
  feed_connections: feed_connections_type, 
  items: items_type
}

type feed_connections_type = {
  id: number;
  fish_id: number;
  feed_id: number;
  from_fish_weight: number;
  to_fish_weight: number;
}[]

type items_type = {
  id: number;
  name: string;
  description: string | null;
  item_type_id: number | null;
  default_unit_id: number | null;
  parent_item: number | null;
}[]



export default function DaySummaryContent({currentDate, pool, poolAnd14Calc, times, feed_connections, items}: DaySummaryProps) {
  const [formState, action] = useFormState(actions.feedBatch, { message: '' });
  const [formStatus, setFormStatus] = useState(null); // Стан для зберігання статусу форми

  function getFeed(average_weight: number | undefined): { id: number, name: string} | null {
    if (average_weight !== undefined){
      const connection = feed_connections.find(connection => {
        return average_weight >= connection.from_fish_weight && average_weight <= connection.to_fish_weight;
      });
  
      if (connection) {
          const feed_item = items.find(item => connection.feed_id === item.id);
          if (feed_item) {
              const nameMatch = feed_item.name?.match(/\b\d*[,\.]?\d+\s*mm\b/);
              const name = nameMatch ? nameMatch[0] : ""; 
              return { id: feed_item.id, name: name };
          }
      }
    }
    return null; 
  }

  function findTransitionDay() {
    let transitionDay: string | null = null;
    
    for (const table of Object.values(poolAnd14Calc)) {
      if (table && table.is_transition_start) {
        transitionDay = table.date.toISOString().split('T')[0]; // Запам'ятовуємо дату переходу
        break;
      }
    }

    //якщо не знайдено, повертаємо null
    if (!transitionDay) {
      return null;
    } else{
      // який день переходy
      let dayOfTransition = null;
      const currDate = new Date(currentDate);
      const transitionDate = new Date(transitionDay);
      const timeDifference = currDate.getTime() - transitionDate.getTime();
      
      const dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24)); // Різниця в днях
      dayOfTransition = dayDifference;
      if (dayOfTransition !== null && 1 <= dayOfTransition && dayOfTransition <= 4) {
        return dayOfTransition;
      } else {
        return null;
      }
    }
  }

  const transitionDay = findTransitionDay()
  
  let prevRecord : calculation_table | undefined
    if (transitionDay !== null){
      const sortedRecords = poolAnd14Calc.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      for (let i = sortedRecords.length - 1; i >= 0; i--) {
          const transitionDate = new Date(currentDate); // Дата зміни
          transitionDate.setDate(currentDate.getDate() - transitionDay + 1); // Визначення дати зміни

          for (let i = sortedRecords.length - 1; i >= 0; i--) {
              const record = sortedRecords[i];
              const diffInDays = Math.ceil((record.date.getTime() - transitionDate.getTime()) / (1000 * 60 * 60 * 24));
              
              if (diffInDays < -3){
                prevRecord = record
                console.log('record', record.date, 'prevRecord', prevRecord);
                break
              }
          }
     
      }
    }

  return (
  <>
  <tr key={pool.id}>
    <td rowSpan={transitionDay !== null ? 2 : 1} className="px-4 py-2 border border-gray-400">{pool.name}</td>
    
    {(() => {
      const table = poolAnd14Calc && poolAnd14Calc.find((table) =>  
        (table.date.toISOString().split("T")[0] === currentDate.toISOString().split("T")[0]));

      if (table?.fish_weight !== undefined && table?.fish_weight !== null) {
        const feed = getFeed(table.fish_weight)
        return (
          <React.Fragment>
          {transitionDay && transitionDay <= 4 ? (
            <td className="px-4 py-2 border border-gray-400">{prevRecord ? getFeed(prevRecord.fish_weight)?.name : ''}</td>
          ) : (
            <td className="px-4 py-2 border border-gray-400">{feed?.name}</td>
          )}

          
          {times.map(time => (
            <React.Fragment key={time.id}>
              {transitionDay && transitionDay <= 4 ? (
            <td className="px-4 py-2 border border-gray-400">{prevRecord ? (table.feed_per_feeding * ((100 - (transitionDay + 1) * 20) / 100)).toFixed(0) : 0}</td> 
          ) : (
            <td className="px-4 py-2 border border-gray-400">{table.feed_per_feeding.toFixed(0)}</td> 
          )}
              
              
              <td className="px-4 py-2 border border-gray-400">
                <form action={action}>
                  <input type="hidden" name="pool_id" value={pool.id} />
                  <input type="hidden" name="executed_by" value={1} />
                  <input type="hidden" name="comments" value={""} />
                  <input type="hidden" name="fish_weight" value={poolAnd14Calc.find(table => table.date.toISOString().split("T")[0] === currentDate.toISOString().split("T")[0])?.fish_weight} />
                  
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
                  {formState && formState.message && ( // Додано перевірку на ідентифікатор часу
                    <div className={`my-2 p-1 border rounded ${formState.message === 'Недостатньо корму' ? 'border-red-400' : 'border-green-400'}`}>
                      {formState.message}
                    </div>
                  )}
                </form>
              </td>
            </React.Fragment>
          ))}
        </React.Fragment>
        )
      } else {
        return Array.from({ length: times.length * 2 + 1 }, (_, index) => (
          <td key={index} className="px-4 py-2 border border-gray-400"></td>
        ));
      }
    })()}
  </tr>
  { transitionDay && transitionDay <= 4 && 
    <tr key={pool.id}>
    
    {(() => {
      const table = poolAnd14Calc && poolAnd14Calc.find((table) =>  
        (table.date.toISOString().split("T")[0] === currentDate.toISOString().split("T")[0]));

      if (table?.fish_weight !== undefined && table?.fish_weight !== null) {
        const feed = getFeed(table.fish_weight)
        return (
          <React.Fragment>
          <td className="px-4 py-2 border border-gray-400">{feed?.name}</td>
          
          {times.map(time => (
            <React.Fragment key={time.id}>
              <td className="px-4 py-2 border border-gray-400">{(table.feed_per_feeding * (((transitionDay + 1) * 20) / 100)).toFixed(0)}</td> 
       
              <td className="px-4 py-2 border border-gray-400">
                <form action={action}>
                  <input type="hidden" name="pool_id" value={pool.id} />
                  <input type="hidden" name="executed_by" value={1} />
                  <input type="hidden" name="comments" value={""} />
                  <input type="hidden" name="fish_weight" value={poolAnd14Calc.find(table => table.date.toISOString().split("T")[0] === currentDate.toISOString().split("T")[0])?.fish_weight} />
                  
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
                  {formState && formState.message && (
                    <div className={`my-2 p-1 border rounded ${formState.message === 'Недостатньо корму' ? 'border-red-400' : 'border-green-400'}`}>
                      {formState.message}
                    </div>
                  )}
                </form>
              </td>
            </React.Fragment>
          ))}
        </React.Fragment>
        )
      } else {
        return Array.from({ length: times.length * 2 + 1 }, (_, index) => (
          <td key={index} className="px-4 py-2 border border-gray-400"></td>
        ));
      }
    })()}
  </tr> 
  }
  </>
  );
}

