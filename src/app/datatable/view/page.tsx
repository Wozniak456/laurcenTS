'use client'

import { useState, useEffect } from 'react';
import * as actions from '@/actions';
import type {datatable_below25, datatable_over25} from '@prisma/client'

export default function Datatable() {
  const [dataBelow25, setDataBelow25] = useState<datatable_below25[]>([]);
  const [dataOver25, setDataOver25] = useState<datatable_over25[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const dataTableDataBelow25 = await actions.showDatatableBelow25(); 
        const dataTableDataOver25 = await actions.showDatatableOver25(); 
        setDataBelow25(dataTableDataBelow25);
        setDataOver25(dataTableDataOver25);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);


  const handleClickBelow25 = async () => {
    try {
      const newData = await actions.fillDatatableBelow25(); 
      setDataBelow25(newData);
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };
  const handleClickOver25 = async () => {
    try {
      const newData = await actions.fillDatatableOver25(); 
      setDataOver25(newData);
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-xl font-bold mt-4">Datatable Below 25</h1>
        {dataBelow25.length === 0 && (
          <button
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleClickBelow25}
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
            {dataBelow25.map((record) => (
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
      <div>
      <h1 className="text-xl font-bold mt-4">Datatable Over 25</h1>
        {dataOver25.length === 0 && (
          <button
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleClickOver25}
          >Заповнити таблицю
          </button>
        )}
        <table className="table-auto border-collapse border border-white mt-4 mb-4">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border border-white px-4 py-2">Day</th>
              <th className="border border-white px-4 py-2">Average weight</th>
              <th className="border border-white px-4 py-2">Weight</th>
              <th className="border border-white px-4 py-2">uitval</th>
              <th className="border border-white px-4 py-2">voederniveau</th>
              <th className="border border-white px-4 py-2">voederconversie</th>
            </tr>
          </thead>
          <tbody>
            {dataOver25.map((record) => (
              <tr key={record.id} className="bg-gray-200">
                <td className="border border-white px-4 py-2">{record.day}</td>
                <td className="border border-white px-4 py-2">{record.av_weight.toFixed(3)}</td>
                <td className="border border-white px-4 py-2">{record.weight}</td>
                <td className="border border-white px-4 py-2">{record.uitval}</td>
                <td className="border border-white px-4 py-2">{record.voederniveau}</td>
                <td className="border border-white px-4 py-2">{record.voederconversie}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}