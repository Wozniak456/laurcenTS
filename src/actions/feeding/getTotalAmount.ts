'use server'

import * as actions from "@/actions"

//акумуляція по зїдженому корму та ціною корму
export const getTotalAmount = async (generationId : bigint, itemId: number) => {
    const data = await actions.getFeedAmountsAndNames(generationId);

    const amount =  data
      .filter((entry) => entry.item_id === itemId)
      .reduce((total, entry) => total + entry.total_amount, 0);

    const price = data
      .filter((entry) => entry.item_id === itemId && entry.price !== null)
      .reduce((total, entry) => total + (entry.price ?? 0) / 1000 * entry.total_amount, 0);

    return { amount, price };
};