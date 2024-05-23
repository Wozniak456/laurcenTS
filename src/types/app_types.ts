export type getCurrentFeedCountType = {
    batch_name : string | undefined;
    feed_type_id: {
        id: number;
        name: string;
    } | undefined;
    item_name: string | undefined;
    batch_id: bigint;
    _sum: {
        quantity: number | null;
    } 
}

export type Feed = {
    feed_type_id: number | undefined,
    feed_type_name: string | undefined,
    feed_list: {
        item_id: number,
        feed_name: string
    }[] 
} | undefined

export type Prio = {
    item_id: number | undefined; 
    item_name: string | undefined,
    priority: number | undefined;
}