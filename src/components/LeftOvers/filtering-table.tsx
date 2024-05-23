'use client'
import { useEffect, useState } from "react";
// import { useFormState } from "react-dom";
import * as actions from '@/actions';
import { Column, useTable } from 'react-table';

interface DataItem{
  batch_id: string;
  batch_name: string;
  // item_id: number,
  feed_type_name: string,
  item_name: string,
  start_saldo: number;
  incoming: number;
  outcoming: number;
  end_saldo: number;
}

interface FilterableTableProps {
   data: DataItem[],
   start: Date | undefined,
   end: Date | undefined
}

interface Saldos {
  [batchId: string]: number;
}

export default function FilterableTable({ data, start, end }: FilterableTableProps) {
  const [StartSaldoDate, setStartSaldoDate] = useState<Date | undefined>(undefined);
  const [EndSaldoDate, setEndSaldoDate] = useState<Date | undefined>(undefined);

  // const [saldos, setSaldos] = useState<Saldos | null>(null);

  useEffect(() => {
    // Логіка, яка виконується після зміни значення data
    console.log('Data changed:', data);
    
    // Тут ви можете виконати будь-яку логіку, яка повинна відбутися після зміни даних
    // Наприклад, оновити стани, вивести повідомлення користувачу тощо

  }, [data]);

  return (
    <div className="overflow-x-auto my-4">
      <h1 className="text-3xl font-bold mb-8">Залишки кормів на складі</h1>
      <div className="flex justify-between">
        <h1 className="font-bold mb-4">Begin: {start ? start.toISOString().split('T')[0] : ''}</h1>
        <h1 className="font-bold mb-4">End: {end ? end.toISOString().split('T')[0] : ''}</h1>
      </div>
        
      <table className="table-auto border-collapse w-full">
        <thead className="bg-gray-200">
        <tr className="bg-blue-100">
        <th className="px-2 py-2   border-gray-400">Batch ID</th>
            <th className="px-2 py-2   border-gray-400">Batch Name</th>
            <th className="px-2 py-2  border-gray-400">Feed Type</th>
            <th className="px-2 py-2 border-gray-400">Item Name</th>
            <th className="px-2 py-2 border-gray-400">Start Saldo</th>
            <th className="px-2 py-2 border-gray-400">Incoming</th>
            <th className="px-2 py-2   border-gray-400">Outcoming</th>
            <th className="px-2 py-2  border-gray-400">End Saldo</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data
          .sort((a, b) => a.feed_type_name.localeCompare(b.feed_type_name))
          .map((item, index) => (
            <tr key={index}>
              <td className="px-2 py-2 border border-gray-400 text-center">{item.batch_id}</td>
              <td className="px-2 py-2 border border-gray-400 text-center">{item.batch_name}</td>
              <td className="px-2 py-2 border border-gray-400 text-center">{item.feed_type_name}</td>
              <td className="px-2 py-2 border border-gray-400 text-center">{item.item_name}</td>
              <td className="px-2 py-2 border border-gray-400 text-center">{item.start_saldo.toFixed(2)}</td>
              <td className="px-2 py-2 border border-gray-400 text-center">{item.incoming.toFixed(2)}</td>
              <td className="px-2 py-2 border border-gray-400 text-center">{item.outcoming.toFixed(2)}</td>
              <td className="px-2 py-2 border border-gray-400 text-center">{item.end_saldo.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  
}
