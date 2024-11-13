import { db } from "@/db";
import * as actions from "@/actions"
import * as feeding_actions from "@/actions/feeding"
import React from "react";
import StockingTable from "@/components/accu-table";
import { Item, PoolType, vendorType } from "@/components/accu-table";

export const dynamic = 'force-dynamic'

export default async function StockingHome() {

  const generations = await actions.getGenerations()

  const vendors = await actions.getVendors()

  const pools: PoolType[] = [];

  // Filter generations
  //витягнути дані про кількості та партії корму, що зїла генерація
  const getFilteredGenerations = async () => {
    const genWithData = [];

    for (const generation of generations) {
       const data = await actions.getFeedAmountsAndNames(generation.id);

      //якщо є принаймні один позитивний результат, то змінна hasData буде true
      const hasData = data.some((element) => element.total_amount > 0);
      if (hasData) {
        genWithData.push(generation);
      }
    }

    return genWithData;
  };

  const filteredGenerations = await getFilteredGenerations();

  // console.log('filteredGenerations: ', filteredGenerations)

  // Process each generation to form pools
  for (const generation of filteredGenerations) {
    const pool: PoolType = {
      location_id: generation.location.id,
      location_name: generation.location.name,
      vendors: [] // Initialize an empty array for vendors
    };

    // Process vendors in parallel
    for (const vendor of vendors) {
      const vendorData: vendorType = {
        vendor_id: vendor.id, 
        items: []
      };

      // Use Promise.all to fetch data for items in parallel
      const itemPromises = vendor.items.map(async (item) => {
        const generationData = await feeding_actions.getTotalAmount(
          generation.id,
          item.id
        );
        const qty = generationData?.amount;

        if (qty > 0.0001) {
          return {
            item_id: item.id,
            qty
          } as Item;
        }

        return null; // Return null for items that don't meet the qty threshold
      });

      // Wait for all item fetches to complete
      const items = await Promise.all(itemPromises);

      // Add items to vendor only if they are valid (non-null)
      vendorData.items = items.filter(item => item !== null) as Item[];

      // Add vendor to the pool only if it has items
      if (vendorData.items.length > 0) {
        pool.vendors.push(vendorData);
      }
    }

    pools.push(pool);
  }

  const batches = await actions.getFeedBatches()



  return (
    <div className="">
      <StockingTable pools={pools} vendors={vendors} batches={batches} />
    </div>
  );
}
