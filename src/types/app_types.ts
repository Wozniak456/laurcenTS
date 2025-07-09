import { calculation_table } from "@prisma/client";

export type BatchWithCreationInfo = {
  id: bigint;
  name: string;
  items: {
    id: number;
    name: string;
  } | null;
  docId?: bigint;
  tranId?: bigint;
  quantity?: number;
  unitId?: number;
  created?: Date | null;
  isNew?: boolean;
  totalQuantity?: number;
};

export type TabContentType = {
  title: string;
  content: {
    id: bigint;
    contentLine: string;
  }[];
};

export type getCurrentFeedCountType = {
  batch_name: string | undefined;
  feed_type_id:
    | {
        id: number;
        name: string;
      }
    | undefined;
  item_name: string | undefined;
  batch_id: bigint;
  _sum: {
    quantity: number | null;
  };
};

export type Feed =
  | {
      feed_type_id: number | undefined;
      feed_type_name: string | undefined;
      feed_list: {
        item_id: number;
        feed_name: string;
      }[];
    }
  | undefined;

export type Prio = {
  item_id: number | undefined;
  item_name: string | undefined;
  priority: number | undefined;
};

export type LocationComponentType =
  | {
      location: {
        id: number | undefined;
        name: string | undefined;
      };
      calculation: {
        feed_per_feeding: number | undefined;
        fish_weight: number | undefined;
      };
      feed: {
        feed_type_id: number | undefined;
        feed_type_name: string | undefined;
        feed_list:
          | {
              item_id: number;
              feed_name: string;
              // prio: number;
            }[]
          | undefined;
      };
    }
  | undefined;

export type batchInfo = {
  batch_name: string | undefined;
  batch_id: bigint | undefined;
  qty: number;
};

export type poolInfo = {
  batch: batchInfo | null | undefined;
  calc: {
    fish_weight: number;
  } | null;
  feed_type_id: number | null | undefined;
  location_id: number;
  location_name?: string;
  allowedToEdit: boolean;
  cost?: number | undefined;
};

export type poolManagingType = {
  batch?:
    | {
        id: bigint;
        name: string;
      }
    | undefined;
  qty?: number | undefined;
  fishWeight?: number | undefined;
  feedType?:
    | {
        id: number;
        name: string;
        feedconnection_id: number | null;
      }
    | null
    | undefined;
  updateDate?: string | undefined;
  allowedToEdit?: boolean;
  wasFetchedThisWeek?: boolean;
  plan_weight?: number;
};

export interface poolManagingTypeExtended extends poolManagingType {
  location?: {
    id: number;
    name: string;
  };
}

export interface calculationAndFeed {
  batch?: {
    batch_name: string | undefined;
    batch_id: bigint | undefined;
    qty?: number;
  } | null;
  calc?: calculation_table | undefined | null;
  feed?: {
    type_id: number | undefined;
    type_name: string | undefined;
    item_id: number | undefined;
    definedPrio: boolean | undefined;
  };
  location_id?: number;
  allowedToEdit?: boolean;
}

export interface calculationAndFeedExtended extends calculationAndFeed {
  allItems?:
    | {
        item_id: number;
        item_name: string;
      }[]
    | undefined;
}

export type disposalItem = {
  id: number;
  reason: string;
};

export type poolInfoType = {
  batch:
    | {
        id: bigint;
        name: string;
      }
    | undefined;
  qty: number | undefined;
  fishWeight: number | undefined;
  feedType:
    | {
        id: number;
        name: string;
        feedconnection_id: number | null;
      }
    | null
    | undefined;
  updateDate: string | undefined;
  allowedToEdit: boolean;
  plan_weight?: number;
};
