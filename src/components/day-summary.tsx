'use client'

import React, { useState } from "react";

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

interface Transaction{
    id: bigint,
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
    locations: Location[]
}

export interface Line{
  id: number,
  name: string,
  pools: Pool[]
}
export interface CalcTable{
  id: number,
  day: number,
  date: Date,
  fish_weight: number,
  feed_per_feeding: number,
  documents: {
    id: bigint,
    date_time: Date,
    executed_by: number,
    locations: {
      id: number,
      name: string,
      pool_id: number
    } | null
  }
}

interface DaySummaryProps{
    lines: Line[],
    times:{
        time: string
    }[],
    feed_dict: {
      [averageWeight: number]: string
    },
    calc_table: CalcTable[]
}

export default function DaySummaryContent({
  lines,
  times,
  feed_dict,
  calc_table,
}: DaySummaryProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(1);

  const dateDictionary: { [dayNumber: number]: Date } = {};

  calc_table.forEach((item) => {
    if (!(item.day in dateDictionary)) {
      dateDictionary[item.day] = item.date;
    }
  });

  const handleDaySelect = (dayNumber: number) => {
    setSelectedDay(dayNumber);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Day Summary</h2>
      <div>
        <div className="flex gap-2 mb-4">
          {Object.entries(dateDictionary).map(([dayNumber, date]) => (
            <button
              key={dayNumber}
              onClick={() => handleDaySelect(parseInt(dayNumber))}
              className={`px-3 py-1 rounded-md ${
                selectedDay === parseInt(dayNumber)
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
              }`}
            >
              {date.toISOString().split("T")[0]}
            </button>
          ))}
        </div>
        {selectedDay !== null && calc_table.some((record) => record.day === selectedDay) && (
          <div>
            <h3 className="text-lg mb-4 p-1 font-bold text-blue-500">
              Date: {dateDictionary[selectedDay].toISOString().split("T")[0]}
            </h3>
            {lines.map((line) => (
              <div key={line.id}>
                <div className="overflow-x-auto">
                  <table className="table-auto border border-gray-400 mb-4 w-full">
                    <thead>
                      <tr>
                        <th
                          colSpan={1 + 2 * times.length}
                          className="px-4 py-2 border border-gray-400 bg-blue-100"
                        >
                          {line.name}
                        </th>
                        <th className="px-4 py-2 bg-blue-100 text-white">
                          {dateDictionary[selectedDay].toISOString().split("T")[0]}
                        </th>
                      </tr>
                      <tr>
                        <th className="px-4 py-2 border border-gray-400">
                          № Басейну
                        </th>
                        <th className="px-4 py-2 border border-gray-400">
                          Вид корму
                        </th>
                        {times.map((time, index) => (
                          <React.Fragment key={index}>
                            <th className="px-4 py-2 border border-gray-400">
                              {time.time}
                            </th>
                            <th className="px-4 py-2 border border-gray-400">
                              Коригування
                            </th>
                          </React.Fragment>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {line.pools.map((pool) => (
                        <tr key={pool.id}>
                          <td className="px-4 py-2 border border-gray-400">
                            {pool.name}
                          </td>
                          {pool.locations.map((loc) =>
                            loc.itemtransactions.map((tran) =>
                              tran.documents.stocking.map((stock) => (
                                <td
                                  key={stock.id}
                                  className="px-4 py-2 border border-gray-400 whitespace-nowrap"
                                >
                                  {feed_dict[stock.average_weight]
                                    ?.match(/\b\d*[,\.]?\d+\s*mm\b/g)
                                    ?.map((match, index) => (
                                      <span key={index}>{match}</span>
                                    ))}
                                </td>
                              ))
                            )
                          )}
                          {times.map((time, index) => (
                            <React.Fragment key={index}>
                              <td className="px-4 py-2 border border-gray-400">
                                {calc_table
                                  .filter(
                                    (record) =>
                                      record.day === selectedDay &&
                                      record.documents &&
                                      record.documents.locations &&
                                      record.documents.locations.pool_id === pool.id
                                  )
                                  .map((record) => record.feed_per_feeding.toFixed(0))}
                              </td>
                              <td className="px-4 py-2 border border-gray-400"></td>
                            </React.Fragment>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}