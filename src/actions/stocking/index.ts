"use server";
import { db } from "@/db";
import { calculation_table, Prisma } from "@prisma/client";
import * as actions from "@/actions";
import { calculationAndFeed, poolManagingType } from "@/types/app_types";

export async function calculationForLocation(
  location_id: number,
  date: string
) {
  let batch = null;
  let calc = null;
  let feed_type;
  let item;

  //знаходимо стан басейну. чи там щось є на цю дату

  batch = await getBatchesInfo(location_id, date);

  if (!batch.qty) return;

  calc = await db.calculation_table.findFirst({
    where: {
      documents: {
        location_id: location_id,
      },
      date: new Date(date),
    },
    orderBy: {
      id: "desc",
    },
    take: 1,
  });

  //приймаємо рішення чи показуватимемо кнопку редагування на /pool-managing/view

  if (calc) {
    feed_type = await getFeedType(calc.fish_weight);

    if (feed_type) {
      item = await actions.getItemPerType(feed_type.id, location_id);
    }
  }

  const lastTran = await db.itemtransactions.findFirst({
    where: {
      documents: {
        location_id: location_id,
      },
      batch_id: batch?.batch_id,
    },
    orderBy: {
      id: "desc",
    },
    take: 1,
  });

  let allowedToEdit = false;

  if (lastTran?.parent_transaction) {
    const connectedTran = await db.itemtransactions.findFirst({
      where: {
        id: lastTran.parent_transaction,
      },
    });

    if (connectedTran?.location_id == 87) {
      allowedToEdit = true;
    }
  }

  const feed = {
    type_id: feed_type?.id,
    type_name: feed_type?.name,
    item_id: item?.item_id,
    item_name: item?.item_name,
    definedPrio: item?.definedPrio,
  };

  return { batch, calc, feed, location_id, allowedToEdit };
}

export const poolInfo = async (
  location_id: number,
  date: string
): Promise<poolManagingType | undefined> => {
  const dateValue = new Date(date);

  dateValue.setUTCHours(23, 59, 59, 999);

  const lastStocking = await db.documents.findFirst({
    select: {
      id: true,
      date_time: true,
      itemtransactions: {
        select: {
          id: true,
          parent_transaction: true,
          itembatches: true,
          quantity: true,
          location_id: true,
        },
        where: {
          location_id: location_id,
          quantity: {
            gte: 0,
          },
        },
        orderBy: {
          id: "desc",
        },
      },
      stocking: true,
    },
    where: {
      location_id: location_id,
      doc_type_id: 1,
      date_time: {
        lte: dateValue,
      },
      itemtransactions: {
        some: {
          itembatches: {
            items: {
              item_type_id: 1,
            },
          },
        },
      },
    },
    orderBy: {
      date_time: "desc",
    },
  });

  let feedType;

  if (lastStocking) {
    feedType = await getFeedType(lastStocking.stocking[0]?.average_weight);
    console.log("LastStocking = ", lastStocking);
  }

  const batch = lastStocking?.itemtransactions[0]?.itembatches;
  const qty = lastStocking?.itemtransactions[0]?.quantity;
  const fishWeight = lastStocking?.stocking[0].average_weight;
  const updateDate = lastStocking?.date_time.toISOString().split("T")[0];

  let allowedToEdit = false;

  if (lastStocking?.itemtransactions[0]?.parent_transaction) {
    const connectedTran = await db.itemtransactions.findFirst({
      where: {
        id: lastStocking?.itemtransactions[0]?.parent_transaction,
      },
    });

    if (connectedTran?.location_id == 87) {
      allowedToEdit = true;
    }
  }
  if (qty) {
    return { batch, qty, fishWeight, feedType, updateDate, allowedToEdit };
  }
};

//встановлюємо перехід на новий корм
export async function setTransitionDayForLocation(
  location_id: number,
  prisma?: any
) {
  const activeDb = prisma || db;

  const records = await get14CalculationForPool(location_id, activeDb);

  if (records) {
    let currType = await getFeedType(records[0].fish_weight, activeDb);
    let dayIndex = 0;

    for (let i = 1; i < records.length; i++) {
      if (dayIndex > 0 && dayIndex <= 4) {
        await activeDb.calculation_table.update({
          where: {
            id: records[i].id,
          },
          data: {
            transition_day: dayIndex,
          },
        });

        dayIndex++;
        continue;
      }

      const feedType = await getFeedType(records[i].fish_weight, activeDb);

      if (feedType?.id !== currType?.id) {
        currType = feedType;

        await activeDb.calculation_table.update({
          where: {
            id: records[i].id,
          },
          data: {
            transition_day: 1,
          },
        });

        dayIndex = 2; // індекс наступного дня
      }
    }
  }
}

export async function getFeedType(
  fish_weight: number | undefined,
  prisma?: any
) {
  const activeDb = prisma || db;
  if (fish_weight !== undefined) {
    const startFeedType = await activeDb.feedtypes.findFirst({
      where: {
        feedconnections: {
          from_fish_weight: {
            lte: fish_weight,
          },
          to_fish_weight: {
            gte: fish_weight,
          },
        },
      },
    });
    return startFeedType;
  }
}

type CalcTableIds = (Prisma.PickEnumerable<
  Prisma.Calculation_tableGroupByOutputType,
  "date"[]
> & {
  _max: {
    id: number | null;
  };
})[];

// export async function get14CalculationForPool(location_id : number, prisma?: any) {
//   const activeDb = prisma || db;

//     const calc_table_ids: CalcTableIds = await activeDb.calculation_table.groupBy({
//       by: ['date'],
//       _max: {
//         id: true,
//       },
//       where:{
//         documents:{
//           location_id: location_id
//         }
//       },
//       orderBy:{
//         date: 'asc'
//       },
//       take: 14
//     });

//     const calc_table14 : calculation_table[] = await activeDb.calculation_table.findMany({
//       where:{
//         id: {
//           in: calc_table_ids.map(record => Number(record._max.id))
//         }
//       },
//       orderBy:{
//         id: 'asc'
//       }
//     })

//     return calc_table14
// }
export async function get14CalculationForPool(
  location_id: number,
  prisma?: any
) {
  const activeDb = prisma || db;

  const calc_table_ids: CalcTableIds = await activeDb.calculation_table.groupBy(
    {
      by: ["date"],
      _max: { id: true },
      where: { documents: { location_id } },
      orderBy: { date: "desc" },
      take: 14,
    }
  );

  // Масив для збереження відповідних записів з calculation_table
  const relatedCalculations: calculation_table[] = [];
  let previousBatchId: bigint | null = null;

  for (const { _max } of calc_table_ids) {
    if (!_max.id) continue;

    // Знаходимо запис у calculation_table за ID
    const calcResult = await db.calculation_table.findFirst({
      where: { id: _max.id },
    });

    if (!calcResult?.doc_id) continue;

    // Знаходимо документ, що є батьківським для calcResult
    const parentDoc = await db.documents.findFirst({
      where: { id: calcResult.doc_id },
    });

    if (!parentDoc?.parent_document) continue;

    // Знаходимо транзакцію з позитивною кількістю, пов'язану з parent_document
    const stockingTransaction = await db.itemtransactions.findFirst({
      where: {
        doc_id: parentDoc.parent_document,
        quantity: { gte: 0 },
      },
    });

    if (!stockingTransaction) continue;

    // Перевіряємо batch_id транзакції
    if (
      previousBatchId === null ||
      stockingTransaction.batch_id === previousBatchId
    ) {
      relatedCalculations.unshift(calcResult); // Додаємо запис calculation_table
      previousBatchId = stockingTransaction.batch_id;
    } else {
      break; // Зупиняємо цикл, якщо batch_id змінився
    }
  }

  return relatedCalculations;
}

export async function getBatchesInfo(location_id: number, date: string) {
  const batch = await db.documents.findFirst({
    select: {
      itemtransactions: {
        select: {
          itembatches: {
            select: {
              id: true,
              name: true,
            },
          },
          quantity: true,
        },
        where: {
          location_id: location_id,
        },
      },
    },
    where: {
      doc_type_id: 1,
      date_time: {
        lte: new Date(date),
      },
      itemtransactions: { some: { location_id: location_id } }, // фільтрація транзакцій
    },
    orderBy: {
      date_time: "desc",
    },
  });

  const result = {
    batch_name: batch?.itemtransactions[0].itembatches.name,
    batch_id: batch?.itemtransactions[0].itembatches.id,
    qty: batch?.itemtransactions[0].quantity,
  };

  return result;
}

//можливо обєднати stockingInfo і getBatchesInfo

export async function createCalcBelow25(
  fishAmount: number,
  averageFishMass: number,
  percentage: number,
  docId: bigint,
  today: string,
  prisma?: any
) {
  const activeDb = prisma || db;

  const numberOfRecords = 10;
  const day = Array.from({ length: numberOfRecords }, (_, i) => i + 1);

  const date = Array.from({ length: numberOfRecords }, (_, i) => {
    const currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() + i + 1);
    return currentDate;
  });

  const fishAmountInPool = Array(numberOfRecords).fill(fishAmount);

  let generalWeight = Array(numberOfRecords).fill(0.0);
  let fishWeight = Array(numberOfRecords).fill(0.0);
  let feedQuantity = Array(numberOfRecords).fill(0.0);
  let vC = Array(numberOfRecords).fill(0.0);
  let totalWeight = Array(numberOfRecords).fill(0.0);
  let weightPerFish = Array(numberOfRecords).fill(0.0);
  let feedToday = Array(numberOfRecords).fill(0);
  let feedPerDay = Array(numberOfRecords).fill(0.0);
  let feedPerFeeding = Array(numberOfRecords).fill(0.0);

  generalWeight[0] = fishAmount * averageFishMass;
  fishWeight[0] = generalWeight[0] / fishAmountInPool[0];

  for (let i = 0; i < day.length - 1; i++) {
    const fcQuery = await activeDb.datatable_below25.findFirst({
      where: {
        weight: {
          lte: fishWeight[i],
        },
      },
      orderBy: {
        weight: "desc",
      },
    });

    if (fcQuery) {
      vC[i] = fcQuery.fc;
      totalWeight[i] = generalWeight[i] + feedQuantity[i] / vC[i];
      weightPerFish[i] = totalWeight[i] / fishAmountInPool[i];

      const feedingLevelQuery = await activeDb.datatable_below25.findFirst({
        where: {
          weight: {
            lte: weightPerFish[i],
          },
        },
        orderBy: {
          weight: "desc",
        },
      });

      if (feedingLevelQuery) {
        feedToday[i] = (feedingLevelQuery.feedingLevel / 100) * totalWeight[i];
        feedPerDay[i] = feedToday[i] + percentage * feedToday[i];
        feedPerFeeding[i] = feedPerDay[i] / 5;
        generalWeight[i + 1] = totalWeight[i];
        fishWeight[i + 1] = weightPerFish[i];
        feedQuantity[i + 1] = feedPerDay[i];
      }
    }
  }

  const fcQuery = await activeDb.datatable_below25.findFirst({
    where: {
      weight: {
        lte: fishWeight[fishWeight.length - 1],
      },
    },
    orderBy: {
      weight: "desc",
    },
  });

  if (fcQuery) {
    vC[vC.length - 1] = fcQuery.fc;
    totalWeight[totalWeight.length - 1] =
      generalWeight[generalWeight.length - 1] +
      feedQuantity[feedQuantity.length - 1] / vC[vC.length - 1];
    weightPerFish[weightPerFish.length - 1] =
      totalWeight[totalWeight.length - 1] /
      fishAmountInPool[fishAmountInPool.length - 1];

    const feedingLevelQuery = await activeDb.datatable_below25.findFirst({
      where: {
        weight: {
          lte: weightPerFish[weightPerFish.length - 1],
        },
      },
      orderBy: {
        weight: "desc",
      },
    });

    if (feedingLevelQuery) {
      feedToday[feedToday.length - 1] =
        (feedingLevelQuery.feedingLevel / 100) *
        totalWeight[totalWeight.length - 1];
      feedPerDay[feedPerDay.length - 1] =
        feedToday[feedToday.length - 1] +
        percentage * feedToday[feedToday.length - 1];
      feedPerFeeding[feedPerFeeding.length - 1] =
        feedPerDay[feedPerDay.length - 1] / 5;
    }
  }
  let dataForTable: calculation_table[] = [];
  for (let i = 0; i < day.length; i++) {
    const record = await activeDb.calculation_table.create({
      data: {
        day: day[i],
        date: date[i],
        fish_amount_in_pool: fishAmountInPool[i],
        general_weight: generalWeight[i],
        fish_weight: fishWeight[i],
        feed_quantity: feedQuantity[i],
        v_c: vC[i],
        total_weight: totalWeight[i],
        weight_per_fish: weightPerFish[i],
        feed_today: feedToday[i],
        feed_per_day: feedPerDay[i],
        feed_per_feeding: feedPerFeeding[i],
        doc_id: docId,
      },
    });
    dataForTable.push(record);
  }

  try {
    return dataForTable;
  } catch (error) {
    console.error("Error creating calculation table:", error);
    throw new Error("Error creating calculation table");
  }
}

export async function createCalcOver25(
  fishAmount: number,
  averageFishMass: number,
  percentage: number,
  docId: bigint,
  today: string,
  prisma?: any
) {
  const activeDb = prisma || db;

  try {
    const numberOfRecords = 10;
    const day = Array.from({ length: numberOfRecords }, (_, i) => i + 1);

    const date = Array.from({ length: numberOfRecords }, (_, i) => {
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() + i + 1);
      return currentDate;
    });

    const fishAmountInPool = Array(numberOfRecords).fill(fishAmount);

    let generalWeight = Array(numberOfRecords).fill(0.0);
    let fishWeight = Array(numberOfRecords).fill(0.0);
    let feedQuantity = Array(numberOfRecords).fill(0.0);
    let fcr = Array(numberOfRecords).fill(0.0);
    let gesch_bezetting = Array(numberOfRecords).fill(0.0);
    let gesch_gewicht = Array(numberOfRecords).fill(0.0);
    let feedPerDay = Array(numberOfRecords).fill(0.0);
    let feedPerFeeding = Array(numberOfRecords).fill(0.0);

    let gesch_uitval: number[] = [
      1.0, 1.0, 0.9903, 0.9846, 0.9806, 0.9775, 0.9749, 0.9728, 0.9709, 0.9692,
    ];

    generalWeight[0] = (fishAmount * averageFishMass) / 1000;

    let feedQuery;
    for (let i = 0; i < day.length; i++) {
      fishWeight[i] = (generalWeight[i] / fishAmountInPool[i]) * 1000;

      const fcrQuery = await activeDb.datatable_over25.findFirst({
        where: {
          av_weight: {
            lte: fishWeight[i],
          },
        },
        orderBy: {
          weight: "desc",
        },
      });

      fcr[i] = fcrQuery?.voederconversie;

      gesch_bezetting[i] = generalWeight[i] + feedQuantity[i] / fcr[i];

      generalWeight[i + 1] = gesch_bezetting[i];

      gesch_gewicht[i] =
        (gesch_bezetting[i] /
          (((100 - gesch_uitval[i]) / 100) * fishAmountInPool[i])) *
        1000;

      feedQuery = await activeDb.datatable_over25.findFirst({
        where: {
          av_weight: {
            lte: gesch_gewicht[i],
          },
        },
        orderBy: {
          weight: "desc",
        },
      });

      if (feedQuery) {
        feedPerDay[i] =
          ((feedQuery?.voederniveau / 100) * gesch_bezetting[i]) / 1.11;
        feedPerFeeding[i] = feedPerDay[i] / 5;
        feedQuantity[i + 1] = feedPerDay[i];
      }
    }

    for (let i = 0; i < day.length; i++) {
      const record = await activeDb.calculation_table.create({
        data: {
          day: day[i],
          date: date[i],
          fish_amount_in_pool: fishAmountInPool[i],
          general_weight: generalWeight[i],
          fish_weight: fishWeight[i],
          feed_quantity: feedQuantity[i],
          feed_per_day: feedPerDay[i] * 1000,
          feed_per_feeding: feedPerFeeding[i] * 1000,
          doc_id: docId,
        },
      });
    }
  } catch (error) {
    throw new Error("Error creating calculation table");
  }
}

//отримання калькуляції до попереднього корму
export async function getPrevCalc(
  location_id: number,
  calc: calculationAndFeed | undefined
) {
  const records14 = await get14CalculationForPool(location_id);

  if (calc !== null) {
    let index = records14.findIndex((record) => record.id === calc?.calc?.id);

    while (true) {
      if (index <= 0) {
        return null;
      }

      if (records14[index - 1].transition_day === null) {
        const feed_type = await getFeedType(records14[index - 1].fish_weight);

        let item;

        if (feed_type) {
          item = await actions.getItemPerType(feed_type.id, location_id);
        }

        return {
          calc: records14[index - 1],
          feed: {
            type_id: feed_type?.id,
            type_name: feed_type?.name,
            item_id: item?.item_id,
            item_name: item?.item_name,
            definedPrio: item?.definedPrio,
          },
          location_id: location_id,
        };
      }

      index--;
    }
  }
}
