import { db } from "@/db";
import Link from "next/link";
import Image from 'next/image';
import deleteButton from '../../../../../public/icons/delete.svg'
import newFileButton from '../../../../../public/icons/create.svg'
import editButton from '../../../../../public/icons/edit.svg'
import registerGoodsButton from '../../../../../public/icons/goods-in.svg'

import PurchTableComponent from "@/components/PurchHeaders/purchtable-table"
import SalesView from '@/components/SalesHeaders/sales-headers-view'

export default async function PurchtableHome() {
  const salestables = await db.salestable.findMany({
    select:{
      id: true,
      doc_id: true,
      date_time: true,
      customers: true,
      saleslines: true
    }
  });

  const customers = await db.customers.findMany()

  const items = await db.items.findMany({
    select:{
      id: true,
      name: true,
      units: true
    }
  })


  return (
      <div className="flex flex-col gap-4 my-4">
          <div className="flex justify-between items-center mb-2">
              <h1 className="text-xl font-bold">Прибуткові накладні</h1>
              <Link href={'/realization/headers/new'}>
                  <button className="hover:bg-blue-100 py-2 px-2 rounded">
                      <Image
                          src={newFileButton}
                          alt="New Document Icon"
                          width={30}
                          height={30}
                          title="Це зображення видаляє елемент" 
                      />
                  </button>
              </Link>
              
          </div>
          <table className="w-full text-sm">

              <thead>
                  <tr className="bg-blue-100">
                      <th className="px-2 py-2 text-center border border-gray-400">ID</th>
                      <th className="px-2 py-2 text-center border border-gray-400">Doc ID</th>
                      <th className="px-2 py-2 text-center border border-gray-400">Delivery Date</th>
                      <th className="px-2 py-2 text-center border border-gray-400">Customer ID</th>
                      <th className="px-2 py-2 text-center border border-gray-400">Vendor Name</th>            
                      <th className="px-2 py-2 text-center border border-gray-400">Status</th> 
                      <th colSpan={3} className="py-2 text-center border border-gray-400">Edit</th>            
                  </tr> 
              </thead>
              <tbody>
                {salestables.map((table) => (
                  <SalesView header={table}/>
                ))}
                
              </tbody>
              
              
          </table>
      </div>
  
  );
}
