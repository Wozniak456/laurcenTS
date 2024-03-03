'use client'

import { useState, useEffect } from 'react';
import * as actions from '@/actions';
import type {datatable} from '@prisma/client'

export default function Datatable() {
  const [data, setData] = useState<datatable[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const dataTableData = await actions.showDataTable(); 
        setData(dataTableData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);


  const handleClick = async () => {
    try {
      const newData = await actions.fillDatatable(); 
      setData(newData);
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-xl font-bold mt-4">Datatable</h1>
      {data.length === 0 && (
        <button
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleClick}
        >Заповнити таблицю
        </button>
      )}
        <table className="table-auto border-collapse border border-white mt-4 mb-4">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border border-white px-4 py-2">Weight</th>
              <th className="border border-white px-4 py-2">Feeding level</th>
              <th className="border border-white px-4 py-2">FC</th>
              <th className="border border-white px-4 py-2">Day</th>
              <th className="border border-white px-4 py-2">Voerhoeveelheid</th>
            </tr>
          </thead>
          <tbody>
            {data.map((record) => (
              <tr key={record.id} className="bg-gray-200">
                <td className="border border-white px-4 py-2">{record.weight.toFixed(3)}</td>
                <td className="border border-white px-4 py-2">{record.feedingLevel}</td>
                <td className="border border-white px-4 py-2">{record.fc}</td>
                <td className="border border-white px-4 py-2">{record.day}</td>
                <td className="border border-white px-4 py-2">{record.voerhoeveelheid.toFixed(5)}</td>
              </tr>
            ))}
          </tbody>
        </table>

    </div>
  );
}