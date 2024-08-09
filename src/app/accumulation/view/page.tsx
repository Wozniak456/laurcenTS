import { db } from "@/db";
import * as actions from "@/actions/index"
import * as feeding_actions from "@/actions/feeding"
import React from "react";
import { Table, TableBody, TableCell, TableColumn, TableHeader } from "@nextui-org/react";
import { it } from "node:test";

export default async function StockingHome() {
  //я знайшла всі покоління
  const generations = await db.batch_generation.findMany({
    select:{
      id: true,
      location: {
        select:{
          name: true
        }
      },
      itembatches: {
        select:{
          name: true
        }
      },
      // itemtransactions: {
      //   select:{

      //   }
      // }
    }
  })

    const vendors = await db.vendors.findMany({
      select:{
        name: true,
        items: {
          select:{
            id: true,
            feedtypes:{
              select:{
                name: true,
                feedconnections: {
                  select:{
                    from_fish_weight: true,
                    to_fish_weight: true
                  }
                }
              }
            }
          }
        }
      }
    })


    const getFilteredGenerations = async () => {
      const genWithData = [];
  
      for (const generation of generations) {
        const data = await actions.getFeedAmountsAndNames(generation.id);
        const hasData = data.some(element => element.total_amount > 0);
        if (hasData) {
          genWithData.push(generation);
        }
      }
  
      return genWithData;
    };

    const batches = await getFilteredGenerations()

    // Обчислення суми значень для кожної колонки
    const totalAmounts = Array.from({ length: batches.length }, () => 0);
    const totalPrices = Array.from({ length: batches.length }, () => 0);

    for (let genIndex = 0; genIndex < batches.length; genIndex++) {
      for (const vendor of vendors) {
        for (const item of vendor.items) {
          const generationData = await feeding_actions.getTotalAmount(batches[genIndex].id, item.id);
          if (generationData !== undefined) {
            totalAmounts[genIndex] += generationData.amount;
            totalPrices[genIndex] += generationData.price;
          }
        }
      }
    }
    
    // Додавання рядка зі сумами
    const totalRow = (
      <tr>
        <td className="px-4 py-2 border border-gray-400 font-bold text-center">Total</td>
        <td className="px-4 py-2 border border-gray-400 font-bold"></td>
        <td className="px-4 py-2 border border-gray-400 font-bold"></td>
        {totalAmounts.map((amount, index) => (
          <React.Fragment key={index}>
            <td className="px-4 py-2 border border-gray-400 font-bold text-center">{(amount / 1000).toFixed(1)}</td>
            <td className="px-4 py-2 border border-gray-400 font-bold text-center">{totalPrices[index].toFixed(1)}</td>
          </React.Fragment>
        ))}
      </tr>
    );

    return(
        <>
          <table className="min-w-full table-auto w-full">
            <thead>
              <tr className="bg-blue-100">
                <th className="px-4 py-2 border border-gray-400"></th>
                {vendors.map((vendor, vendorIndex) => (
                    <th 
                      key={vendorIndex} 
                      colSpan={vendor.items.length} 
                      className="px-4 py-2 border border-gray-400">{vendor.name}</th>
                ))}
              </tr>

              <tr className="bg-blue-100">
                <th className="px-4 py-2 border border-gray-400"></th>
                {vendors.map((vendor, vendorIndex) => (
                  vendor.items.map((item, itemIndex) => (
                    <th key={itemIndex} className="py-2 border border-gray-400 text-sm text-nowrap">{`${item.feedtypes?.feedconnections?.from_fish_weight ? parseFloat(item.feedtypes?.feedconnections?.from_fish_weight.toPrecision(4)) : '-'} - ${item.feedtypes?.feedconnections?.to_fish_weight ? item.feedtypes?.feedconnections?.to_fish_weight : ''}`}</th>
                  )) 
                ))}
              </tr>

              <tr className="bg-blue-100">
                <th className="px-4 py-2 border border-gray-400"></th>
                {vendors.map((vendor, vendorIndex) => (
                  vendor.items.map((item, itemIndex) => (
                    <th key={itemIndex} className="py-2 border border-gray-400 text-sm text-nowrap">{item.feedtypes?.name}</th>
                  )) 
                ))}
              </tr>


              {/* <tr className="bg-blue-100">
                <th colSpan={3} className="px-4 py-2 border border-gray-400"></th>
                {batches.map(async (generation, genIndex) => {
                  return(
                    <React.Fragment key={genIndex}>
                      <th className="px-4 py-2 border border-gray-400">кг</th>
                      <th className="px-4 py-2 border border-gray-400">грн</th>
                    </React.Fragment>
                  )
                })}
              </tr> */}
            </thead>
            <tbody>
              {batches.map( async (batch, batchIndex)=>{
                // const generationData = await feeding_actions.getTotalAmount(batch.id, item.id);
                return(
                <tr key={batchIndex} className="">
                  <td className="px-4 py-2 border border-gray-400 bg-blue-100">{batch.location.name}, {batch.itembatches?.name}</td>
                  
                  {}
                  {/* <td className="px-4 py-2 border border-gray-400"></td>
                  <td className="px-4 py-2 border border-gray-400"></td>
                  <td className="px-4 py-2 border border-gray-400"></td>
                  <td className="px-4 py-2 border border-gray-400"></td>
                  <td className="px-4 py-2 border border-gray-400"></td>
                  <td className="px-4 py-2 border border-gray-400"></td>
                  <td className="px-4 py-2 border border-gray-400"></td>
                  <td className="px-4 py-2 border border-gray-400"></td>
                  <td className="px-4 py-2 border border-gray-400"></td>
                  <td className="px-4 py-2 border border-gray-400"></td>
                  <td className="px-4 py-2 border border-gray-400"></td> */}
                </tr>
                )
                
              })}
               
            </tbody>
          </table>




          {/* <Table isStriped aria-label="Example static collection table">
            <TableHeader>
                <TableColumn className="text-center">Doc ID</TableColumn>
                <TableColumn className="text-center">Delivery Date</TableColumn>
            </TableHeader>
            <TableBody>
                <TableCell className="text-center">1</TableCell>
                <TableCell className="text-center">2</TableCell>
            </TableBody>
        </Table> */}
        </>
    )
}
