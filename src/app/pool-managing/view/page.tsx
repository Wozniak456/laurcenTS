import { db } from "@/db";
import StockingComponent from "@/components/feeding-component"
import * as stockingActions from '@/actions/stocking'
import * as actions from '@/actions'
import { calculation_table, itemtransactions, Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic'

export default async function StockingHome() {

  // const debugLocation = 72
  // const debugResult = await setTransitionDayForLocation(debugLocation)
  // console.log('debugResult: ', debugResult)

  const today = new Date()

  const areas = await actions.getAreas()

  const locations = await actions.getPools()

  const batches = await actions.getCatfishBatches()
  
  const disposal_reasons = await db.disposal_reasons.findMany()

  const weekNum = actions.getWeekOfYear(today)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-sm">
      <div className="flex justify-end w-full">
        <p>Тиждень: {weekNum}</p>
      </div>
      {areas.map(area => (
        <div key={area.id} className="w-full">
          <div className="text-3xl font-bold">{area.name}</div>
          {area.productionlines.map(line => (
            <div key={line.id} className="">
              <div className="text-xl font-bold my-4">{line.name}</div>
              {line.pools
              
              .sort((a, b) => {
                const numA = parseInt(a.name.split('/')[0].slice(1)); // відкидаємо перший символ "Б" і перетворюємо на число
                const numB = parseInt(b.name.split('/')[0].slice(1)); // відкидаємо перший символ "Б" і перетворюємо на число
                return numA - numB; 
              })

              .map(pool => (
                pool.locations.map(async loc => {

                  //інформація про басейн на момент дати на компютері
                  let poolInfo = await stockingActions.poolInfo(loc.id, today.toISOString().split("T")[0])

                  poolInfo = {
                    ...poolInfo,
                    wasFetchedThisWeek : await wasFetchedThisWeek(loc.id, weekNum)
                  }

                  return(
                    <div key={pool.id} className="shadow-xl mb-4 px-4 py-0.5 bg-blue-100">
                      <StockingComponent locations={locations} location={loc} batches={batches} poolInfo={poolInfo} disposal_reasons={disposal_reasons} weekNum={weekNum} />
                    </div>
                  )
                })
              ))
              }
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}


async function wasFetchedThisWeek (location_id: number, weekNum: number){
  const fetch = await db.fetching.findMany({
    include:{
      itemtransactions:{
        include:{
          documents: true,
        }
      }
    },
    where:{
      itemtransactions:{
        documents:{
          location_id: location_id
        }
      },
      weekNumber: weekNum
    }
  })

  if(fetch.length > 0){
    return true
  } else{
    return false
  }
}

//встановлюємо перехід на новий корм
export async function setTransitionDayForLocation(location_id: number, prisma?: any){
  const activeDb = prisma || db;
  
  //витягнути останні 14 днів для цієї партії (якщо є)
  const records = await get14CalculationForPool1(location_id, activeDb)
  // console.log('records: ', records)
  
  //якщо для басейнв є розрахунок
  if (records){
    //для першого дня знаходимо тип корму
    let currType = await stockingActions.getFeedType(records[0].fish_weight, activeDb)
    let dayIndex = 0

    for (let i = 1; i < records.length; i++) {

      const feedType = await stockingActions.getFeedType(records[i].fish_weight, activeDb);
      console.log(`feedType для ${location_id} day_${i}:`, feedType)
      
      if (dayIndex > 0 && dayIndex <= 4){
        await activeDb.calculation_table.update({
          where:{
            id: records[i].id
          },
          data:{
            transition_day: dayIndex
          }
        })

        dayIndex ++
        continue;
      }

      if (feedType?.id !== currType?.id){
          currType = feedType

          await activeDb.calculation_table.update({
            where:{
              id: records[i].id
            },
            data:{
              transition_day: 1
            }
          })
          
          dayIndex = 2 // індекс наступного дня
      }

      
      
    }
}  
}

type CalcTableIds = (Prisma.PickEnumerable<Prisma.Calculation_tableGroupByOutputType, "date"[]> & {
  _max: {
      id: number | null;
  };
})[]

// export async function get14CalculationForPool1(location_id : number, prisma?: any) {
  
//   const activeDb = prisma || db;
  
//   const calc_table_ids: CalcTableIds = await activeDb.calculation_table.groupBy({
//     by: ['date'],
//     _max: { id: true },
//     where: { documents: { location_id } },
//     orderBy: { date: 'desc' },
//     take: 14,
//   });

//   const transactionsWithSameBatch: itemtransactions[] = [];
//   let previousBatchId: bigint | null = null;

//   for (const { _max } of calc_table_ids) {
//     if (!_max.id) continue;

//     // Знаходимо калькуляцію за ID
//     const calcResult = await db.calculation_table.findFirst({
//       where: { id: _max.id },
//     });

//     if (!calcResult?.doc_id) continue;

//     // Знаходимо документ, що є батьківським для calcResult
//     const parentDoc = await db.documents.findFirst({
//       where: { id: calcResult.doc_id },
//     });

//     if (!parentDoc?.parent_document) continue;

//     // Знаходимо наступний документ, що є батьківським
//     const grandParentDoc = await db.documents.findFirst({
//       where: { id: parentDoc.parent_document },
//     });

//     if (!grandParentDoc) continue;

//     // Знаходимо транзакцію з позитивною кількістю
//     const stockingTransaction = await db.itemtransactions.findFirst({
//       where: {
//         doc_id: grandParentDoc.id,
//         quantity: { gte: 0 },
//       },
//     });

//     if (!stockingTransaction) continue;

//     // Перевіряємо batch_id для зупинки, якщо партія змінилася
//     if (previousBatchId === null || stockingTransaction.batch_id === previousBatchId) {
//       transactionsWithSameBatch.push(stockingTransaction);
//       previousBatchId = stockingTransaction.batch_id;
//     } else {
//       break; // Зупиняємо цикл, якщо batch_id змінився
//     }
//   }

//   // Результат транзакцій, що відносяться до однієї партії
//   // console.log('Transactions with the same batch:', transactionsWithSameBatch);

//   // const calc_table14: calculation_table[] = await activeDb.calculation_table.findMany({
//   //   where: {
//   //     id: { in: transactionsWithSameBatch.map((record) => Number(record.id)) },
//   //   },
//   //   orderBy: { id: 'desc' },
//   // });

//   return calc_table14;
// }

export async function get14CalculationForPool1(location_id: number, prisma?: any) {
  const activeDb = prisma || db;

  const calc_table_ids: CalcTableIds = await activeDb.calculation_table.groupBy({
    by: ['date'],
    _max: { id: true },
    where: { documents: { location_id } },
    orderBy: { date: 'desc' },
    take: 14,
  });

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
    if (previousBatchId === null || stockingTransaction.batch_id === previousBatchId) {
      relatedCalculations.unshift(calcResult); // Додаємо запис calculation_table
      previousBatchId = stockingTransaction.batch_id;
    } else {
      break; // Зупиняємо цикл, якщо batch_id змінився
    }
  }
  
  return relatedCalculations;
}
