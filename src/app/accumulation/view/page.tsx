import { db } from "@/db";
import * as actions from "@/actions/index"
import * as feeding_actions from "@/actions/feeding"
import React from "react";
import StockingTable from "@/components/accu-table";
import { Item, PoolType, vendorType } from "@/components/accu-table";

export const dynamic = 'force-dynamic'

export default async function StockingHome() {
  // Fetch generations (batches)
  const generations = await db.batch_generation.findMany({
    select: {
      id: true,
      location: {
        select: {
          id: true,
          name: true,
        },
      },
      itembatches: {
        select: {
          name: true,
        },
      },
    },
  });

  // Fetch vendors
  const vendors = await db.vendors.findMany({
    select: {
      id: true,
      name: true,
      items: {
        select: {
          id: true,
          feedtypes: {
            select: {
              name: true,
              feedconnections: {
                select: {
                  from_fish_weight: true,
                  to_fish_weight: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const pools: PoolType[] = [];

  // Filter generations
  const getFilteredGenerations = async () => {
    const genWithData = [];

    for (const generation of generations) {
      const data = await actions.getFeedAmountsAndNames(generation.id);
      const hasData = data.some((element) => element.total_amount > 0);
      if (hasData) {
        genWithData.push(generation);
      }
    }

    return genWithData;
  };

  const filteredGenerations = await getFilteredGenerations();

  // Process each generation to form pools
  for (const generation of filteredGenerations) {
    const pool: PoolType = {
      location_id: generation.location.id,
      location_name: generation.location.name,
      vendors: [] // Initialize an empty array for vendors
    };

    for (const vendor of vendors) {
      const vendorData: vendorType = {
        vendor_id: vendor.id, 
        items: []
      };

      for (const item of vendor.items) {
        const generationData = await feeding_actions.getTotalAmount(
          generation.id,
          item.id
        );
        const qty = generationData?.amount || 0;

        if (qty > 0) {
          const feedTypeName = item.feedtypes?.name;
          const feedItem: Item = {
            item_id: item.id,
            qty,
          };

          vendorData.items.push(feedItem);
        }
      }

      // Add vendor to the pool only if it has items
      if (vendorData.items.length > 0) {
        pool.vendors.push(vendorData);
      }
    }

    pools.push(pool);
  }

  const batches = await db.itembatches.findMany({
    where:{
      items:{
        item_type_id: 3
      }
    }
  })

  // console.log(pools)

  return (
    <div className="">
      <StockingTable pools={pools} vendors={vendors} batches={batches} />
    </div>
  );
}

