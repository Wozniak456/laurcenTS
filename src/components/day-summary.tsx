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
    prod_line_id: number,
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
    feed_connections: {
      id: number;
      fish_id: number;
      feed_id: number;
      from_fish_weight: number;
      to_fish_weight: number;
    }[],
    calc_table: CalcTable[],
    items:{
      id: number;
      name: string;
      description: string | null;
      item_type_id: number | null;
      default_unit_id: number | null;
      parent_item: number | null;
    }[]
}

export default function DaySummaryContent({
  lines,
  times,
  feed_connections,
  calc_table,
  items
}: DaySummaryProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(1);

  const dateDictionary: { [dayNumber: number]: Date } = {};

  calc_table.forEach((item) => {
    if (!(item.day in dateDictionary)) {
      dateDictionary[item.day] = item.date;
    }
  });

  const handleDaySelect = (dateNum: number) => {
    setSelectedDay(dateNum);
  };

  // const feedDictionary: { [averageWeight: number]: string } = {};

  function getFeedName(average_weight: number){
    const connection = feed_connections.find(connection => {
      return average_weight >= connection.from_fish_weight && average_weight <= connection.to_fish_weight;
    });
    let feed_item
    if (connection){
      feed_item = items.find(item => (
        connection.feed_id === item.id
      ))
    }
    return feed_item ? feed_item.name : "";
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Day Summary</h2>
      <div>
        <div className="flex gap-2 mb-4">
          {Object.entries(dateDictionary).map(([dateNum, date]) => (
            <button
              key={dateNum}
              onClick={() => handleDaySelect(parseInt(dateNum))}
              className={`px-3 py-1 rounded-md ${
                selectedDay === parseInt(dateNum)
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
              }`}
            >
              {date.toISOString().split("T")[0]}
            </button>
          ))}
        </div>
        {selectedDay !== null && calc_table.some((record) => record.date === dateDictionary[selectedDay]) && (
          <div>
            <h3 className="text-lg mb-4 p-1 font-bold text-blue-500">
              Date: {dateDictionary[selectedDay].toISOString().split("T")[0]}
            </h3>
            {lines.map(line => (
            <div key={line.id}>
              <table className="table-auto border border-gray-400 mb-4 w-full">
                <thead>
                  <tr>
                    <th
                    colSpan={1 + 2 * times.length}
                    className="px-4 py-2 border border-gray-400 bg-blue-100">
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
                  {line.pools
                      .filter(pool => pool.prod_line_id === line.id)
                      .map(pool => (
                          <tr key={pool.id}>
                              <td className="px-4 py-2 border border-gray-400">
                                  {pool.name}
                              </td>
                              {calc_table.filter(table => table.date.getTime() === dateDictionary[selectedDay].getTime() && table.documents.locations?.pool_id === pool.id).map(table => (
                                  <td key={table.id} className="px-4 py-2 border border-gray-400">
                                      {getFeedName(table.fish_weight)
                                      ?.match(/\b\d*[,\.]?\d+\s*mm\b/)
                                      ?.map((match, index) => (
                                        <span key={index}>{match}</span>
                                      ))}
                                  </td>
                              ))}
                              {calc_table.filter(table => table.date.getTime() === dateDictionary[selectedDay].getTime() && table.documents.locations?.pool_id === pool.id).length === 0 && (
                                <td className="px-4 py-2 border border-gray-400"></td>
                              )}
                              {times.map((time, index) => (
                                <React.Fragment key={index}>
                                {calc_table.filter(table => table.date.getTime() === dateDictionary[selectedDay].getTime() && table.documents.locations?.pool_id === pool.id).map(table => (
                                  <td key={table.id} className="px-4 py-2 border border-gray-400">
                                      {table.feed_per_feeding.toFixed(0)}
                                  </td>
                              ))}
                              {calc_table.filter(table => table.date.getTime() === dateDictionary[selectedDay].getTime() && table.documents.locations?.pool_id === pool.id).length === 0 && (
                                  <td className="px-4 py-2 border border-gray-400"></td>
                              )}
                                <td className="px-4 py-2 border border-gray-400"></td>
                              </React.Fragment>
                              ))}
                          </tr>
                      ))}
                </tbody>
              </table>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}