// import { db } from "@/db";
// // import * as actions from "@/actions"
// import React from "react";
// import DaySummaryContent from "@/components/day-summary"
// //import { Line, CalcTable, Transaction } from "@/components/day-summary";
// import { calculation_table, feedconnections } from "@prisma/client";
// import { calculationAndFeed } from '@/types/app_types'
// import * as actions from "@/actions/feeding"
// import {getBatchesInfo} from '@/actions/stocking'
// import Link from "next/link";


// interface LocationInfo {
//   location_id: number;
//   location_name: string;
//   batch_id?: bigint; // batch_id є необов'язковим
// }

// const currentDate: Date = new Date();
// // currentDate.setDate(currentDate.getDate());

// export default async function DaySummary() {   

//     const lines = await db.productionlines.findMany({
//       include: {
//         pools: {
//           include:{
//             locations: true
//           }
//         }
//       }
//     });
  
//     const times = await db.time_table.findMany();
  
//     const items = await db.items.findMany({
//       where:{
//         item_type_id: 3
//       }
//     })

//     // дні, доступні для вибору
//     let dates = [];

//     for (let i = -2; i <= 7; i++) {
//       let newDate = new Date();
//       newDate.setDate(currentDate.getDate() + i);
//       dates.push(newDate.toISOString().split("T")[0]);
//     }

//     // console.log(dates)

//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">

//         <div className="flex justify-between">
//             {dates.map(date => (
//                 <div key={date} className="flex-shrink-0 p-2">
//                     <div className={` rounded-lg shadow p-1 hover:bg-blue-100 transition duration-200 ${date == currentDate.toISOString().split("T")[0] && 'bg-blue-200'}`}>
//                         <Link href={`/summary-feeding-table/day/${date}`} >
//                             <span className={`text-center cursor-pointer `}>{date}</span>
//                         </Link>
//                     </div>
//                 </div>
//             ))}
//         </div>
                
//         {lines.map(line => (
//         <table key={line.id} className="border-collapse border w-full mb-4 text-sm w-5/6">
//            <thead>
//              <tr>
//                 <th
//                   colSpan={2 * times.length + 3}
//                   className="px-4 py-2 bg-blue-100">
//                   {line.name}
//                 </th>
//                 <th
//                   className="px-4 py-2 bg-blue-100">
//                   {currentDate.toISOString().split("T")[0].split("-").slice(1).reverse().join("-")}
//                 </th>
//               </tr>
//               <tr>
//                 <th className="border p-2">Басейн</th>
//                 <th className="border p-2 ">Вид корму</th>
//                 <th className="border p-2 w-24">Назва корму</th>
//                 {times.map((time, index) => (
//                   <React.Fragment key={index}>
//                     <th className="border p-2">{time.time}</th>
//                     <th className="border">Коригування</th>
//                   </React.Fragment>
//                 ))}
//                 <th className="border p-2">Годувати</th>
//               </tr>
//             </thead>
//           <tbody>
//           {line.pools.map(pool => {
//             return Promise.all(pool.locations.map(async loc => {
              
//               const isPoolFilled = await isFilled(loc.id)

//               let prevCalc = null;

//               let locationInfo : LocationInfo = {
//                 location_id: loc.id,
//                 location_name: loc.name
//               };

//               let todayCalc

//               if(isPoolFilled === true){
//                 todayCalc = await actions.getTodayCalculation(loc.id, currentDate);
          
//                 if (todayCalc.calculation?.transition_day !== null){
//                   prevCalc = await actions.getPrevCalc(loc.id, todayCalc);
//                 }
    
//                 const batchInfo = await getBatchesInfo(loc.id)
    
//                 if (batchInfo) {
//                   locationInfo = {
//                     ...locationInfo,
//                     batch_id: batchInfo.batch_id
//                   };
//                 }
//               }
              
//               return (
//                 <DaySummaryContent
//                   key={loc.id}
//                   location={locationInfo} 
//                   todayCalculation={todayCalc} //калькуляція на сьогодні
//                   prevCalculation={prevCalc} // попередня калькуляція
//                   times={times}
//                   items={items}
//                 />
//               );  
//             }));
//           })}
//           </tbody>
//         </table>
//       ))}
//       </div>
//       );
    
//   }

//   const isFilled = async (location_id : number)  => {
//     const lastStocking = await db.itemtransactions.findFirst({
//         where:{
//             documents:{
//                 doc_type_id: 1 //зариблення
//             },
//             location_id: location_id,
//         },
//         orderBy:{
//             id: 'desc'
//         },
//         take: 1
//     })

//     if (lastStocking && lastStocking?.quantity > 0){
//         return true
//     }else{
//         return false
//     }
// }