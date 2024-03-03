'use client'
import { useFormState } from "react-dom";
import { useState, useEffect } from 'react';
import * as actions from '@/actions';
import type {calculation_table} from '@prisma/client'

export default function CalculationTable() {
  const [data, setData] = useState<calculation_table[]>([]);
  const [formState, action] = useFormState(actions.createCalcTable, {message: ''});

  useEffect(() => {
    async function fetchData() {
      try {
        const calcTable = await actions.showCalcTable(); 
        setData(calcTable);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <form action={action}>
        <div className="flex gap-4 items-end">
          <div className="flex flex-col gap-1 mt-2">
            <label className="w-full" htmlFor="fish_amount">
              Кількість особин
            </label>
            <input 
              name="fish_amount"
              className="border rounded p-2 w-full"
              id="fish_amount"
            />
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <label className="w-full" htmlFor="average_fish_mass">
              Середня вага
            </label>
            <input 
              name="average_fish_mass"
              className="border rounded p-2 w-full"
              id="average_fish_mass"
            />
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <label className="w-full" htmlFor="percentage">
              Відсоток
            </label>
            <input 
              name="percentage"
              className="border rounded p-2 w-full"
              id="percentage"
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-gray-800 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded h-full"
          >Отримати розрахунок
          </button>
        </div>
        {formState.message ? <div className="my-2 p-2 bg-red-200 border rounded border-red-400">{formState.message}</div> : null}
      </form>
      <table className="border-collapse border border-gray-300 mt-4 mb-4">
        <thead className="bg-gray-200">
          <tr className='bg-gray-800'>
            <th className="border text-white border-gray-300 px-4 py-2">Days</th>
            <th className="border text-white border-gray-300 px-4 py-2">Data</th>
            <th className="border text-white border-gray-300 px-4 py-2">Fish in pool</th>
            <th className="border text-white border-gray-300 px-4 py-2">Gen weight</th>
            <th className="border text-white border-gray-300 px-4 py-2">Fish weight</th>
            <th className="border text-white border-gray-300 px-4 py-2">Feed quantity</th>
            <th className="border text-white border-gray-300 px-4 py-2">vc</th>
            <th className="border text-white border-gray-300 px-4 py-2">Total weight</th>
            <th className="border text-white border-gray-300 px-4 py-2">Fish weight</th>
            <th className="border text-white border-gray-300 px-4 py-2">Feed today</th>
            <th className="border text-white border-gray-300 px-4 py-2">Feed per day</th>
            <th className="border text-white border-gray-300 px-4 py-2">Feed per feeding</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((record) => (
            <tr key={record.id}>
              <td className="border border-gray-300 px-4 py-2">{record.day}</td>
              <td className="border border-gray-300 px-4 py-2" style={{ width: 'auto', whiteSpace: 'nowrap' }}>{record.date.toISOString().split("T")[0]}</td>
              <td className="border border-gray-300 px-4 py-2">{record.fish_amount_in_pool.toFixed(3)}</td>
              <td className="border border-gray-300 px-4 py-2">{record.general_weight.toFixed(3)}</td>
              <td className="border border-gray-300 px-4 py-2">{record.fish_weight.toFixed(3)}</td>
              <td className="border border-gray-300 px-4 py-2">{record.feed_quantity.toFixed(3)}</td>
              <td className="border border-gray-300 px-4 py-2">{record.v_c}</td>
              <td className="border border-gray-300 px-4 py-2">{record.total_weight.toFixed(3)}</td>
              <td className="border border-gray-300 px-4 py-2">{record.weight_per_fish.toFixed(3)}</td>
              <td className="border border-gray-300 px-4 py-2">{record.feed_today.toFixed(3)}</td>
              <td className="border border-gray-300 px-4 py-2">{record.feed_per_day.toFixed(3)}</td>
              <td className="border border-gray-300 px-4 py-2">{record.feed_per_feeding.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}