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

  // Sum all fish transactions for this location up to the given date
  const sumResult = await db.itemtransactions.aggregate({
    _sum: {
      quantity: true,
    },
    where: {
      location_id: location_id,
      documents: {
        date_time: {
          lte: dateValue,
        },
      },
      itembatches: {
        items: {
          item_type_id: 1,
        },
      },
    },
  });
  const qty = sumResult._sum.quantity || 0;

  // Get the latest stocking document for average weight and other info
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
      stocking: {
        select: {
          average_weight: true,
          form_average_weight: true,
        },
      },
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
  if (
    lastStocking &&
    lastStocking.stocking &&
    lastStocking.stocking.length > 0
  ) {
    feedType = await getFeedType(lastStocking.stocking[0]?.average_weight);
  }
  const batch = lastStocking?.itemtransactions[0]?.itembatches;
  const fishWeight = lastStocking?.stocking?.[0]?.average_weight;
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
  return { batch, qty, fishWeight, feedType, updateDate, allowedToEdit };
};

//встановлюємо перехід на новий корм
export async function setTransitionDayForLocationOld(
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

export async function setTransitionDayForLocation(
  location_id: number,
  prisma?: any
) {
  //console.log("DEBUG: setTransitionDayForLocation START", { location_id });
  const activeDb = prisma || db;

  // 1. Find the latest calculation_table record for this location
  const lastCalc = await activeDb.calculation_table.findFirst({
    where: {
      documents: { location_id },
    },
    orderBy: { id: "desc" },
  });
  //console.log("DEBUG: lastCalc", lastCalc);
  if (!lastCalc) return;

  // 2. Get the doc_id from this calculation_table record
  const lastDocId = lastCalc.doc_id;
  //console.log("DEBUG: lastDocId", lastDocId);

  // 3. Get all calculation_table records for this doc_id
  const calcs = await activeDb.calculation_table.findMany({
    where: { doc_id: lastDocId },
    orderBy: { day: "asc" },
  });
  //console.log(
  //"DEBUG: calcs.length",
  //calcs.length,
  //calcs.map((c: calculation_table) => ({
  //  id: c.id,
  //  day: c.day,
  //  date: c.date,
  //  transition_day: c.transition_day,
  //}))
  //);
  if (!calcs.length) return;

  // Fetch the document for lastDocId to get its date_time
  const lastDoc = await activeDb.documents.findUnique({
    where: { id: lastDocId },
    select: { date_time: true },
  });
  //console.log("DEBUG: lastDoc", lastDoc);
  if (!lastDoc) {
    //console.log("DEBUG: lastDoc is falsy, returning early");
    return;
  }
  const dateObj = lastDoc.date_time;

  // 4. Get batch_generation for this location and date (using your SQL logic)
  const batchGen = await getLatestBatchGenerationForLocation(
    activeDb,
    location_id,
    dateObj
  );
  //console.log("DEBUG: batchGen", batchGen);

  // 4.1 Get batch_generation for the end of the day
  const endOfDayDate = new Date(dateObj);
  endOfDayDate.setUTCHours(23, 59, 59, 999);
  const batchGenEndOfDay = await getLatestBatchGenerationForLocation(
    activeDb,
    location_id,
    endOfDayDate
  );
  //console.log("DEBUG: batchGenEndOfDay", batchGenEndOfDay);

  // 4.2 Compare batch generations and handle transition if needed
  let lastUpdatedIndex = -1;
  if (batchGen && batchGenEndOfDay && batchGen.id === batchGenEndOfDay.id) {
    // Get first date from current calculations
    const firstCalcDate = calcs[0].date;
    const prevDayDate = new Date(firstCalcDate);
    prevDayDate.setDate(prevDayDate.getDate() - 1);
    //console.log("DEBUG: firstCalcDate", firstCalcDate);
    //console.log("DEBUG: prevDayDate", prevDayDate);

    // Find previous calculation record
    //console.log("DEBUG: Searching for prevCalc with:", {
    //location_id,
    //lastDocId,
    //prevDayDate,
    //});
    const prevCalc = await activeDb.calculation_table.findFirst({
      where: {
        documents: {
          location_id: location_id,
        },
        doc_id: {
          lt: lastDocId,
        },
        date: prevDayDate,
      },
      orderBy: {
        id: "desc",
      },
    });
    //console.log("DEBUG: prevCalc", prevCalc);
    // we decided to not to continue transition, so we will not use prevCalc
    /*    if (prevCalc?.transition_day !== null) {
      let currentTransitionDay = prevCalc.transition_day;
      //console.log(
        //"DEBUG: Starting transition copy from prevCalc.transition_day =",
        //currentTransitionDay
      //);
      for (let i = 0; i < calcs.length; i++) {
        //console.log(
          //`DEBUG: i=${i}, currentTransitionDay=${currentTransitionDay}`
        //);
        if (currentTransitionDay && currentTransitionDay <= 4) {
          await activeDb.calculation_table.update({
            where: { id: calcs[i].id },
            data: { transition_day: currentTransitionDay },
          });
          //console.log(
            //`DEBUG: Updated calcs[${i}].id=${calcs[i].id} with transition_day=${currentTransitionDay}`
          //);
          currentTransitionDay++;
          lastUpdatedIndex = i;
        } else {
          //console.log(
            //`DEBUG: Breaking at i=${i}, currentTransitionDay=${currentTransitionDay}`
          //);
          break;
        }
      }
    } else {
      //console.log("DEBUG: prevCalc.transition_day is null or undefined");
    }*/
  }

  // 6. Process remaining records with transition logic
  let prevFeedType = await getFeedType(
    calcs[lastUpdatedIndex + 1]?.fish_weight,
    activeDb
  );

  // Process remaining records
  for (let i = lastUpdatedIndex + 1; i < calcs.length; i++) {
    const currentFeedType = await getFeedType(calcs[i].fish_weight, activeDb);

    // Debug log: show current loop state
    //console.log("DEBUG: Loop i=", i, {
    //prevFeedType,
    //currentFeedType,
    //calcsId: calcs[i].id,
    //fish_weight: calcs[i].fish_weight,
    //});

    // Check if feed type changed
    if (
      prevFeedType?.id != null &&
      currentFeedType?.id != null &&
      prevFeedType.id !== currentFeedType.id
    ) {
      // Start new transition sequence
      let transitionDay = 1;
      for (let j = i; j < calcs.length && transitionDay <= 4; j++) {
        //console.log("DEBUG: Transition inner loop", {
        //j,
        //transitionDay,
        //calcsId: calcs[j].id,
        //});
        await activeDb.calculation_table.update({
          where: { id: calcs[j].id },
          data: { transition_day: transitionDay },
        });
        transitionDay++;
        i = j; // Update main loop index to skip processed records
      }
      //console.log(
      //"DEBUG: Transition complete, set prevFeedType = currentFeedType",
      //{ prevFeedType, currentFeedType }
      //);
      prevFeedType = currentFeedType;
    } else {
      // No transition needed
      //console.log("DEBUG: No transition needed for i=", i, {
      //calcsId: calcs[i].id,
      //});
      await activeDb.calculation_table.update({
        where: { id: calcs[i].id },
        data: { transition_day: null },
      });
    }
  }
  //console.log("DEBUG: setTransitionDayForLocation END", { location_id });
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
  const dateValue = new Date(date);

  dateValue.setUTCHours(23, 59, 59, 999);
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
        lte: dateValue,
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

// Helper function to get the latest batch_generation for a location before a given date
async function getLatestBatchGenerationForLocation(
  activeDb: any,
  location_id: number,
  dateObj: Date
) {
  //console.log("DEBUG: getLatestBatchGenerationForLocation START", {
  //location_id,
  //dateObj,
  //});
  // 1. Find all stocking documents for this location and before the given date
  const stockingDocs = await activeDb.documents.findMany({
    where: {
      doc_type_id: 1,
      date_time: { lt: dateObj },
      itemtransactions: {
        some: { location_id },
      },
    },
    select: {
      id: true,
      itemtransactions: {
        select: { location_id: true },
      },
    },
  });
  //console.log("DEBUG: stockingDocs", stockingDocs);

  // 2. Filter to only those docs with more than one unique location in itemtransactions
  const realStockingDocIds = stockingDocs
    .filter(
      (doc: { id: number; itemtransactions: { location_id: number }[] }) => {
        const uniqueLocs = new Set<number>(
          doc.itemtransactions.map(
            (tran: { location_id: number }) => tran.location_id
          )
        );
        return uniqueLocs.size > 1;
      }
    )
    .map((doc: { id: number }) => doc.id);
  //console.log("DEBUG: realStockingDocIds", realStockingDocIds);

  let batchGen = null;
  if (realStockingDocIds.length > 0) {
    // 3. Find the latest batch_generation for this location and those docs
    batchGen = await activeDb.batch_generation.findFirst({
      where: {
        location_id,
        itemtransactions: {
          doc_id: { in: realStockingDocIds },
        },
      },
      orderBy: { id: "desc" },
    });
    //console.log("DEBUG: batchGen found", batchGen);
  } else {
    //console.log("DEBUG: No realStockingDocIds found");
  }
  //console.log("DEBUG: getLatestBatchGenerationForLocation END", { batchGen });
  return batchGen;
}
