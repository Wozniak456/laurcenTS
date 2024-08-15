import { db } from "@/db";
import * as actions from "@/actions/index"
import * as feeding_actions from "@/actions/feeding"
import React from "react";
import { Table, TableBody, TableCell, TableColumn, TableHeader } from "@nextui-org/react";

interface BatchWithTotals extends batchesType {
  totalAmount: number;
  totalPrice: number;
}

interface batchesType {
  id: bigint;
  location: {
      name: string;
  };
  itembatches: {
      name: string;
  } | null;
}[]

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

    const a = await getFilteredGenerations()
    
    // Fetch batches
    const batches: BatchWithTotals[] = await getFilteredGenerations() as BatchWithTotals[];

    await Promise.all(
      batches.map(async (batch) => {
        batch.totalAmount = 0;
        batch.totalPrice = 0;
    
        await Promise.all(
          vendors.flatMap(vendor =>
            vendor.items.flatMap(async item => {
              const generationData = await feeding_actions.getTotalAmount(batch.id, item.id);
              if (generationData !== undefined) {
                batch.totalAmount += generationData.amount;
                batch.totalPrice += generationData.price;
              }
            })
          )
        );
      })
    );

    console.log(batches);
    
    
    return(
        <>
          <table className="min-w-full table-auto w-full my-8">
            <thead>
              <tr className="bg-blue-100">
                <th className="px-4 py-2 border border-gray-400"></th>
                {vendors.map((vendor, vendorIndex) => (
                    <th 
                      key={vendorIndex} 
                      colSpan={vendor.items.length} 
                      className="px-4 py-2 border border-gray-400">{vendor.name}</th>
                ))}
                <th className="px-4 py-2 border border-gray-400">Total</th>
              </tr>

              <tr className="bg-blue-100">
                <th className="px-4 py-2 border border-gray-400"></th>
                {vendors.map((vendor, vendorIndex) => (
                  vendor.items.map((item, itemIndex) => (
                    <th key={itemIndex} className="py-2 border border-gray-400 text-sm text-nowrap">{`${item.feedtypes?.feedconnections?.from_fish_weight ? parseFloat(item.feedtypes?.feedconnections?.from_fish_weight.toPrecision(4)) : '-'} - ${item.feedtypes?.feedconnections?.to_fish_weight ? item.feedtypes?.feedconnections?.to_fish_weight : ''}`}</th>
                  )) 
                ))}
                <th className="px-4 py-2 border border-gray-400"></th>
              </tr>

              <tr className="bg-blue-100">
                <th className="px-4 py-2 border border-gray-400"></th>
                {vendors.map((vendor, vendorIndex) => (
                  vendor.items.map((item, itemIndex) => (
                    <th key={itemIndex} className="py-2 border border-gray-400 text-sm text-nowrap">{item.feedtypes?.name}</th>
                  )) 
                ))}
                <th className="px-4 py-2 border border-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {batches
              // без цього зявляються похибки обрахунку (дуже малі значення)
              .filter(batch => batch.totalAmount > 0.0001) 
              .sort((a, b) => a.location.name.localeCompare(b.location.name))
              .map( async (batch, batchIndex) => {
                console.log(batch.location.name, batch)
                return(
                  <React.Fragment key={batchIndex}>
                  <tr className="px-4 py-2 border border-gray-400">
                    <td rowSpan={2} className={`text-sm px-4 py-2 border border-gray-400 ${batchIndex % 2 == 0 ? 'bg-blue-100' : 'bg-green-100'}`}>{batch.itembatches?.name}, {batch.location.name}</td>
                    {vendors.map((vendor, vendorIndex) => (
                    vendor.items.map(async (item, itemIndex) => {
                      const generationData = await feeding_actions.getTotalAmount(batch.id, item.id);
                    return(
                      <td
                            key={`${batchIndex}-1`}
                            className={`px-4 py-2 border border-gray-400 text-center text-sm ${
                              generationData === undefined ? "border-2 border-dashed" : ""
                            }`}
                          >
                            {generationData !== undefined && generationData.amount !== 0 ? (generationData.amount/1000).toFixed(6) : ""}
                      </td>
                    )
                    })
                  ))}
                    <td className="px-4 py-2 border border-gray-400 text-sm"> {Number(batch.totalAmount / 1000).toFixed(3)} кг</td>
                  </tr>

                  <tr className="px-4 py-2 border border-gray-400">
                    
                    {vendors.map((vendor, vendorIndex) => (
                    vendor.items.map(async (item, itemIndex) => {
                      const generationData = await feeding_actions.getTotalAmount(batch.id, item.id);
                    return(
                      <td
                          key={`${batchIndex}-2`}
                          className={`px-4 py-2 border border-gray-400 text-center text-sm ${
                            generationData === undefined ? "border-2 border-dashed" : ""
                          }`}
                        >
                            {generationData !== undefined && generationData.price !== 0 ? generationData.price.toFixed(1) : ""}
                          </td>
                    )
                    })
                  ))}
                    <td className="px-4 py-2 border border-gray-400 text-sm"> {Number(batch.totalPrice.toFixed(1))} грн</td>
                  </tr>
                  </React.Fragment>
                  
                )
                
              })}
               
            </tbody>
          </table>
        </>
    )
}
