'use server'
import { db } from "@/db";

type GroupedResult = {
    batch_generation_id: bigint;
    name: string;
    total_amount: number;
    feed_batch_id: bigint;
    vendor_id: number | null;
    feed_type_id: number | null,
    item_id: number,
    price: number | null
};

export async function getFeedAmountsAndNames( ancestorId: bigint): Promise<GroupedResult[]> {
    const feedAmounts = await db.generation_feed_amount.findMany({
        where: {
            batch_generation_id: ancestorId,
        },
        include: {
            feed_batches: {
                select: {
                    name: true,
                    items:{
                        select:{
                            id: true,
                            vendor_id: true,
                            feed_type_id: true
                        }
                    },
                    price: true
                },
            },
        },
    });

    // Group by feed_batch name and batch_generation_id
    const groupedResults = feedAmounts.reduce((acc, curr) => {
        const key = `${curr.batch_generation_id}-${curr.feed_batches.name}`;
        if (!acc[key]) {
            acc[key] = {
                batch_generation_id: curr.batch_generation_id,
                name: curr.feed_batches.name,
                total_amount: 0,
                feed_batch_id: curr.feed_batch_id,
                vendor_id: curr.feed_batches.items.vendor_id,
                feed_type_id: curr.feed_batches.items.feed_type_id,
                item_id: curr.feed_batches.items.id,
                price: curr.feed_batches.price
            };
        }
        acc[key].total_amount += curr.amount;
        return acc;
    }, {} as Record<string, GroupedResult>);
    return Object.values(groupedResults);
}