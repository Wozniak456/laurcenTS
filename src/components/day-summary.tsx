'use client'

import React, { useState } from "react";
import { useFormState } from "react-dom";
import * as actions from '@/actions';
import { calculation_table } from "@prisma/client";
import { Cabin_Sketch } from "next/font/google";

interface Stocking{
    id: number,
    average_weight: number
}

interface Document{
    id: bigint,
    stocking: Stocking[]
}

interface ItemBatch{
    id: bigint,
    name: string,
}

export interface Transaction{
    id: bigint,
    doc_id: BigInt,
    itembatches: ItemBatch,
    documents: Document
}

interface Location{
    id: number,
    itemtransactions: Transaction[]
}

interface Pool{
    id: number,
    name: string,
    prod_line_id: number,
    locations: Location[]
}

export interface Line{
  id: number,
  name: string,
  pools: Pool[]
}
export interface CalcTable{
  [poolId: number]: calculation_table[]
}

interface DaySummaryProps{
    lines: Line[],
    times:{
        time: string
    }[],
    feed_connections: {
      id: number;
      fish_id: number;
      feed_id: number;
      from_fish_weight: number;
      to_fish_weight: number;
    }[],
    calc_table: {
      [poolId: number]: calculation_table[]
    },
    items:{
      id: number;
      name: string;
      description: string | null;
      item_type_id: number | null;
      default_unit_id: number | null;
      parent_item: number | null;
    }[],
}

export default function DaySummaryContent({
  lines,
  times,
  feed_connections,
  calc_table,
  items
}: DaySummaryProps) {

  //console.log('calc_table', calc_table)

  const datesArray = Array.from({ length: 10 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split("T")[0];
  });

  const [selectedDay, setSelectedDay] = useState<string>(datesArray[0]);
  const [formState, action] = useFormState(actions.feedBatch, { message: '' });
  const [tableId, setTableId] = useState<number | null>(null); 

  // Функція для встановлення id таблиці при її рендерингу
  const handleTableRender = (id: number) => {
    setTableId(id);
  };

  const handleDaySelect = (dateNum: number) => {
    setSelectedDay(datesArray[dateNum]);
  };

  function getFeed(average_weight: number): { id: number, name: string } | null {
    const connection = feed_connections.find(connection => {
        return average_weight >= connection.from_fish_weight && average_weight <= connection.to_fish_weight;
    });

    if (connection) {
        const feed_item = items.find(item => connection.feed_id === item.id);
        if (feed_item) {
            const nameMatch = feed_item.name?.match(/\b\d*[,\.]?\d+\s*mm\b/);
            const name = nameMatch ? nameMatch[0] : ""; // Extracting feed name
            return { id: feed_item.id, name: name };
        }
    }
    return null;
} 
function findTransitionDay(poolId: number, currDay: string) {
  let transitionDay: string | null = null;
  
  for (const table of Object.values(calc_table)) {
    if (table[poolId] && table[poolId].is_transition_start) {
      transitionDay = table[poolId].date.toISOString().split('T')[0]; // Запам'ятовуємо дату переходу
      break;
    }
  }

  // Перевірка, чи було знайдено transitionDay
  if (!transitionDay) {
    return null;
  }

  let dayOfTransition = null;
  const currDate = new Date(currDay);
  const transitionDate = new Date(transitionDay);
  const timeDifference = currDate.getTime() - transitionDate.getTime();
  const dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24)); // Різниця в днях
  dayOfTransition = dayDifference;

  if (dayOfTransition !== null && 0 <= dayOfTransition && dayOfTransition <= 3) {
    //console.log(poolId, dayOfTransition)
    return dayOfTransition;
  } else {
    return null;
  }
}
  
  return (
    <div className="p-4">
      {datesArray.map((day, index) => (
        <button 
          key={index} 
          onClick={() => handleDaySelect(index)}
          className={`py-2 px-4 mr-2 mb-2 rounded-lg 
                      ${selectedDay === day ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}
                      hover:bg-blue-600 hover:text-white focus:outline-none`}
        >
          {day}
        </button>
      ))}
      {selectedDay && <p className="mt-4">Обрана дата: {selectedDay}</p>}
      {lines.map( line => (
        <table key={line.id} className="border-collapse border w-full mb-4" id={line.id.toString()} onLoad={() => handleTableRender(line.id)}> 
          <thead>
            <tr>
              <th
                colSpan={2 + 3 * times.length}
                className="px-4 py-2 bg-blue-100">
                {line.name}
              </th>
              {/* <th className="px-4 py-2 bg-blue-100">{selectedDay}</th> */}
            </tr>
            <tr>
              <th className="border p-2">№ басейну</th>
              <th className="border p-2">Вид корму</th>
              {times.map((time, index) => (
                <React.Fragment key={index}>
                  <th className="border p-2">{time.time}</th>
                  <th className="border p-2">Коригування</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
  {line.pools.map(pool => {
    const poolId = pool.id;
    const record = calc_table[poolId]?.find(record => record.date.toISOString().split("T")[0] === selectedDay);
    //console.log(pool.id, selectedDay)
    const transitionDay = findTransitionDay(poolId, selectedDay)
    //console.log(pool.id, transitionDay)
    let prevRecord : calculation_table | undefined
    if (transitionDay !== null){
      const prevDate = new Date(selectedDay);
      prevDate.setDate(prevDate.getDate() - transitionDay - 1);
      const prevDay = prevDate.toISOString().split("T")[0];
      prevRecord = calc_table[pool.id]?.find(record => record.date.toISOString().split("T")[0] === prevDay);
    }
    
    return (
      <React.Fragment key={pool.id}>
        <tr>
        <td rowSpan={transitionDay !== null ? 2 : 1} className="px-4 py-2 border border-gray-400">{pool.name}</td>
          
        {transitionDay !== null ? (
        <td className="px-4 py-2 border border-gray-400">{prevRecord ? getFeed(prevRecord.fish_weight ?? 0)?.name : ''}</td>
      ) : (
        <td className="px-4 py-2 border border-gray-400">{record ? getFeed(record.fish_weight)?.name : ''}</td>
      )}
          {times.map((time, index) => (
            <React.Fragment key={`${index}`}>
              {/* <td className="px-4 py-2 border border-gray-400">{findTransitionDay(pool.id, selectedDay)}</td> */}
              {transitionDay !== null ? (
                <td className="px-4 py-2 border border-gray-400">
                {record ? 
                    (record.feed_per_feeding * ((100 - (transitionDay + 1) * 20) / 100)).toFixed(0) 
                    : 
                    ''}
                </td>
             
              ) : (
                <td className="px-4 py-2 border border-gray-400">{record ? record.feed_per_feeding.toFixed(0) : ''}</td> 
              )}
              
              <td className="px-4 py-2 border border-gray-400">
                {record && (
                  <form action={action}>
                    <input type="hidden" name="pool_id" value={pool.id} />
                    <input type="hidden" name="executed_by" value={1} />
                    <input type="hidden" name="fish_batch_id" value={(() => {
                      const fish_batch_id = pool.locations.flatMap(loc => (
                        loc.itemtransactions.flatMap(tran => {
                          if (!tran.itembatches.name.includes('mm')) {
                            return tran.itembatches.id;
                          } else {
                            return [];
                          }
                        })
                      ));
                      return Number(fish_batch_id[fish_batch_id.length - 1]);
                    })()} />
                    {transitionDay !== null ? <input type="hidden" name="feed_item_id" value={prevRecord ? getFeed(prevRecord.fish_weight)?.id : ''} /> 
                    : 
                    <input type="hidden" name="feed_item_id" value={record ? getFeed(record.fish_weight)?.id : ''} />}
                    
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
                )}
              </td>
            </React.Fragment>
          ))}
        </tr>
        {transitionDay !== null && (
          <tr>
          <td className="px-4 py-2 border border-gray-400">{record ? getFeed(record.fish_weight)?.name : ''}</td>
          {times.map((time, index) => (
            <React.Fragment key={`${index}`}>
              <td className="px-4 py-2 border border-gray-400">
                {record ? 
                    (record.feed_per_feeding * (((transitionDay + 1) * 20) / 100)).toFixed(0) 
                    : 
                    ''}
                </td>
              <td className="px-4 py-2 border border-gray-400">
                {record && (
                  <form action={action}>
                    <input type="hidden" name="pool_id" value={pool.id} />
                    <input type="hidden" name="executed_by" value={1} />
                    <input type="hidden" name="fish_batch_id" value={(() => {
                      const fish_batch_id = pool.locations.flatMap(loc => (
                        loc.itemtransactions.flatMap(tran => {
                          if (!tran.itembatches.name.includes('mm')) {
                            return tran.itembatches.id;
                          } else {
                            return [];
                          }
                        })
                      ));
                      return Number(fish_batch_id[fish_batch_id.length - 1]);
                    })()} />
                    <input type="hidden" name="feed_item_id" value={record ? getFeed(record.fish_weight)?.id : ''} />
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
                )}
              </td>
            </React.Fragment>
          ))}
          </tr>
        )}
      </React.Fragment>
    );
  })}
</tbody>

        </table>
      ))}
    </div>
  );
}