import { db } from "@/db";
import * as actions from "@/actions/index"
import * as feeding_actions from "@/actions/feeding"
import React from "react";

export default async function StockingHome() {
  //я знайшла всі покоління
  const generations = await db.batch_generation.findMany({
    include:{
      location: true,
      itembatches: true,
      itemtransactions: true
    }
  })

    const vendors = await db.vendors.findMany({
      include:{
        items: {
          include:{
            feedtypes:{
              include:{
                feedconnections: true
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
          <table className="min-w-full">
            <thead>
              <tr className="bg-blue-100">
                <th className="px-4 py-2 border border-gray-400"></th>
                <th className="px-4 py-2 border border-gray-400">Вага риби, гр</th>
                <th className="px-4 py-2 border border-gray-400">Вид корму, мм</th>
                {batches.map(async (generation, genIndex) => {
                  return(
                    <th key={genIndex} colSpan={2} className="px-4 py-2 border border-gray-400">{String(generation.itembatches?.name)}, {generation.location.name}</th>
                  )
                })}
              </tr>
              <tr className="bg-blue-100">
                <th colSpan={3} className="px-4 py-2 border border-gray-400"></th>
                {batches.map(async (generation, genIndex) => {
                  return(
                    <React.Fragment key={genIndex}>
                      <th className="px-4 py-2 border border-gray-400">кг</th>
                      <th className="px-4 py-2 border border-gray-400">грн</th>
                    </React.Fragment>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor, vendorIndex) => (
                <React.Fragment key={vendorIndex}>
                  {vendor.items.map((item, itemIndex) => (
                    <tr key={itemIndex} className=" border border-green-600">
                      {itemIndex === 0 && (
                        <td
                          className="px-4 py-2 border border-gray-400 text-center transform -rotate-90"
                          rowSpan={vendor.items.length}
                        >
                          {vendor.name}
                        </td>
                      )}
                      <td className="px-4 py-2 border border-gray-400 text-center">
                        {item.feedtypes?.feedconnections?.from_fish_weight.toFixed(3)}-
                        {item.feedtypes?.feedconnections?.to_fish_weight}
                      </td>
                      <td className="px-4 py-2 border border-gray-400 text-center">
                        {item.feedtypes?.name}
                      </td>
                      {batches.map(async (generation, genIndex) => {
                        const generationData = await feeding_actions.getTotalAmount(generation.id, item.id);
                        // console.log(generation.id, generationData)
                        return (
                          <React.Fragment key={genIndex}>
                          <td
                            key={`${genIndex}-1`}
                            className={`px-4 py-2 border border-gray-400 text-center ${
                              generationData === undefined ? "border-2 border-dashed" : ""
                            }`}
                          >
                            {generationData !== undefined && generationData.amount !== 0 ? (generationData.amount/1000).toFixed(1) : ""}
                          </td>
                          <td
                          key={`${genIndex}-2`}
                          className={`px-4 py-2 border border-gray-400 text-center ${
                            generationData === undefined ? "border-2 border-dashed" : ""
                          }`}
                        >
                            {generationData !== undefined && generationData.price !== 0 ? generationData.price.toFixed(1) : ""}
                          </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                    
                  ))}
                     
                </React.Fragment>
              ))} 
                {totalRow}
               
            </tbody>
          </table>

        </>
    )
}
