import Link from "next/link";
import React from "react";
import { db } from "@/db";
import DailyFeedWeightPage from '@/components/DailyFeedWeight/daily-feed-weight'
import * as feedingActions from "@/actions/feeding"
import * as stockingActions from "@/actions/stocking"
import * as actions from '@/actions'
import DaySummaryContent from "@/components/day-summary"
import ExportButton from "@/components/dayFeedingTableToPrint";
import { request } from "http";


interface DayFeedingProps {
    params: {
        index: string;
    };
}

interface LocationInfo {
    location_id: number;
    location_name: string;
    batch_id?: bigint;
    fed_today?: {
        time: string;
        quantity: number;
    }[]
}

interface FeedingInfo {
    date: string;
    locId: number;
    locName: string,
    rowCount?: number;
    feedings?: Feeding[]
    batch?: {
        id: number,
        name: string
    }
}

type editingType = {
    itemtransactions: {
        quantity: number;
    }[];
}

interface Feeding {
    feedType: string;
    feedName?: string;
    feedId?: number,
    feedings?: { [time: string]: { feeding?: string; editing?: string } };
}

type extraData = {
    feedType: string,
    feedName: string,
    date_time: string,
    item_id: number,
    quantity: number,
    location_id: number
}

export default async function DayFeeding(props: DayFeedingProps) {
    const today = props.params.index;

    const currentDate: Date = new Date(today);

    const dates = datesArray(currentDate);

    const lines = await setLines();

    const times = await db.time_table.findMany();

    const items = await db.items.findMany({
        select: {
            id: true,
            name: true,
            feedtypes: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        where: {
            item_type_id: 3
        }
    })

    const summary = await feedingActions.getAllSummary(lines, currentDate)

    const data = await setData(today, times);

    // data.map(data1 => {
    //     console.log('loc: ', data1.locId)
    //     data1.feedings?.map(feeding => {
    //         console.log(feeding)
    //     })

    // })

    return (
        <div className="flex flex-col justify-center ">
            <div className="flex justify-between">
                {dates.map(date => (
                    <div key={date} className="flex-shrink-0 p-2">
                        <div className={` rounded-lg shadow p-1 hover:bg-blue-100 transition duration-200 ${date == today && 'bg-blue-200'}`}>
                            <Link href={`/summary-feeding-table/day/${date}`} >
                                <span className={`text-center cursor-pointer `}>{date}</span>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end my-2">
                <ExportButton times={times} lines={lines} data={data} />
            </div>
            <div>*Кількість вказана у грамах</div>
            <DaySummaryContent data={data} lines={lines} times={times} today={today} feeds={items} />
            <DailyFeedWeightPage lines={lines} summary={summary} items={items} date={today} />
        </div>
    );
}

//set dates to show on page
const datesArray = (currentDate: Date) => {
    let dates = [];
    for (let i = -6; i <= 2; i++) {
        let newDate = new Date();
        newDate.setDate(currentDate.getDate() + i);
        dates.push(newDate.toISOString().split("T")[0]);
    }
    return dates
}


//return an array with eaten feed and not bool
const feedingForLocation = async (locationId: number, today: Date) => {
    const startOfDay = new Date(today);
    const endOfDay = new Date(today);

    endOfDay.setHours(23, 59, 59, 999);

    const query = await db.documents.findMany({
        select: {
            date_time: true,
            itemtransactions: {
                select: {
                    location_id: true,
                    quantity: true
                },
                where: {
                    location_id: locationId
                }
            }
        },
        where: {
            doc_type_id: 9,
            date_time: {
                lte: endOfDay,
                gte: startOfDay
            },
            itemtransactions: {
                some: {
                    location_id: locationId
                }
            }
        }
    });

    const timeQtyArray: { time: string; quantity: number }[] = [];

    for (const record of query) {
        const time = record.date_time.toISOString().split('T')[1].split(':').slice(0, 2).join(':'); // Форматуємо час: HH:MM
        let totalQuantity = 0;

        // Обчислюємо загальну кількість для цього часу
        for (const transaction of record.itemtransactions) {
            totalQuantity += transaction.quantity;
        }

        // Перевіряємо, чи вже існує такий час в масиві
        const existingTime = timeQtyArray.find(item => item.time === time);

        if (existingTime) {
            existingTime.quantity += totalQuantity; // Оновлюємо кількість для цього часу
        } else {
            // Додаємо новий запис для цього часу
            timeQtyArray.push({ time, quantity: totalQuantity });
        }
    }
    return timeQtyArray;
}


const setData = async (today: string, times: { id: number, time: string }[]) => {

    const currentDate = new Date(today);

    const lines = await setLines();

    let data: FeedingInfo[] = [];

    const getEdited = async (hours: number, locId: number, itemId: number) => {

        const todayDate = new Date(today)

        todayDate.setUTCHours(hours, 0, 0, 0);
        const fedAlready = await db.documents.findMany({
            select: {
                itemtransactions: {
                    select: {
                        quantity: true
                    },
                    where: {
                        location_id: locId,
                        itembatches: {
                            items: {
                                id: itemId
                            }
                        }
                    }
                }
            },
            where: {
                location_id: locId,
                doc_type_id: 9,
                date_time: todayDate
            }
        })

        return (fedAlready)
    }

    for (const line of lines) {
        for (const pool of line.pools) {
            for (const loc of pool.locations) {
                const isPoolFilled = await actions.isFilled(loc.id, today);

                let locationInfo: LocationInfo = {
                    location_id: loc.id,
                    location_name: loc.name,
                    fed_today: await feedingForLocation(loc.id, currentDate),
                };

                let todayCalc = null;
                let prevCalc = null;

                let extraFilledRows: Record<number, extraData[]> = {}

                if (isPoolFilled) {
                    todayCalc = await stockingActions.calculationForLocation(loc.id, today);

                    if (todayCalc?.calc?.transition_day !== null) {
                        prevCalc = await stockingActions.getPrevCalc(loc.id, todayCalc);
                    }

                    const batchInfo = await stockingActions.poolInfo(loc.id, today);

                    if (batchInfo) {
                        locationInfo = {
                            ...locationInfo,
                            batch_id: batchInfo.batch?.id,
                        };
                    }

                    extraFilledRows = await getExtraData(loc.id, today, prevCalc?.feed.item_id, todayCalc?.feed.item_id)

                }

                let editings: {
                    [locId: number]: {
                        [itemId: number]: {
                            [time: string]: editingType[]
                        }
                    }
                } = {};

                await Promise.all(
                    times.map(async (time) => {
                        const hours = Number(time.time.split(':')[0]);

                        const itemIds = [
                            todayCalc?.feed.item_id,
                            prevCalc?.feed.item_id,
                        ].filter((itemId): itemId is number => !!itemId); // Фільтруємо `undefined`

                        for (const itemId of itemIds) {
                            const editing = await getEdited(hours, loc.id, itemId);

                            // Ініціалізуємо вкладені об'єкти, якщо їх немає
                            if (!editings[loc.id]) {
                                editings[loc.id] = {};
                            }
                            if (!editings[loc.id][itemId]) {
                                editings[loc.id][itemId] = {};
                            }
                            if (!editings[loc.id][itemId][time.time]) {
                                editings[loc.id][itemId][time.time] = [];
                            }

                            // Додаємо значення до editings
                            editings[loc.id][itemId][time.time] = editing;
                        }
                    })
                );

                const transition = todayCalc?.calc?.transition_day;

                const feedingAmountForPrev =
                    transition && todayCalc?.calc?.feed_per_feeding
                        ? todayCalc.calc.feed_per_feeding * (1 - transition * 0.2)
                        : undefined;

                const feedingAmountForToday =
                    transition && todayCalc?.calc?.feed_per_feeding
                        ? todayCalc.calc.feed_per_feeding * (transition * 0.2)
                        : undefined;

                // Створення загального об'єкта для басейна
                const feedings: Feeding[] = [];

                let feedingsCount = 0;

                if (transition && prevCalc) {
                    feedings.push({
                        feedType: prevCalc.feed.type_name,
                        feedName: prevCalc.feed.item_name,
                        feedId: prevCalc.feed.item_id,
                        feedings: Object.fromEntries(
                            times.map(({ time }) => {
                                // Парсимо години з часу
                                const hours = Number(time.split(':')[0]);
                                const itemId = prevCalc.feed.item_id; // Отримуємо itemId

                                const editing = editings[loc.id]?.[itemId!]?.[time] || [];

                                return [
                                    hours.toString(), // Ключ - години у вигляді рядка
                                    {
                                        feeding: feedingAmountForPrev?.toFixed(1), // Форматуємо feedingAmountForPrev
                                        editing: editing[0]?.itemtransactions[0]?.quantity !== undefined
                                            ? (editing[0].itemtransactions[0].quantity * 1000).toFixed(1)
                                            : '', // Якщо значення є, множимо і форматуємо; якщо ні, повертаємо порожній рядок
                                    },
                                ];
                            })
                        )
                    });
                    feedingsCount++;
                }

                if (transition && todayCalc) {
                    feedings.push({
                        feedType: todayCalc.feed.type_name,
                        feedName: todayCalc.feed.item_name,
                        feedId: todayCalc.feed.item_id,
                        feedings: Object.fromEntries(
                            times.map(({ time }) => {
                                const hours = Number(time.split(':')[0]);
                                const itemId = todayCalc.feed.item_id; // Отримуємо itemId
                                const editing = editings[loc.id]?.[itemId!]?.[time] || [];

                                return [
                                    hours.toString(),
                                    {
                                        feeding: feedingAmountForToday?.toFixed(1),
                                        editing:
                                            editing[0]?.itemtransactions[0]?.quantity !== undefined
                                                ? (editing[0].itemtransactions[0].quantity * 1000).toFixed(1)
                                                : '',
                                    },
                                ];
                            })
                        ),
                    });
                    feedingsCount++;
                } else if (todayCalc) {
                    feedings.push({
                        feedType: todayCalc.feed.type_name,
                        feedName: todayCalc.feed.item_name,
                        feedId: todayCalc.feed.item_id,
                        feedings: Object.fromEntries(
                            times.map(({ time }) => {
                                const hours = Number(time.split(':')[0]);

                                const itemId = todayCalc.feed.item_id; // Отримуємо itemId
                                const editing = editings[loc.id]?.[itemId!]?.[time] || [];

                                // editing.map(data1 => {
                                //     console.log(loc.id)
                                //     data1.itemtransactions.map(feeding => {
                                //         console.log(feeding)
                                //     })
                                // })

                                // console.log(editing)

                                const toReturn = [
                                    hours.toString(),
                                    {
                                        feeding: todayCalc.calc?.feed_per_feeding?.toFixed(1),
                                        editing:
                                            editing[0]?.itemtransactions[0]?.quantity !== undefined
                                                ? (editing[0].itemtransactions[0].quantity * 1000).toFixed(1)
                                                : '',
                                    },
                                ];

                                // console.log(`loc: ${loc.id}`, toReturn)

                                return toReturn
                            })
                        ),
                    });
                    feedingsCount++;
                }


                if (Object.keys(extraFilledRows).length > 0) {
                    Object.keys(extraFilledRows).forEach(feedId => {
                        const feedRows = extraFilledRows[Number(feedId)];

                        // Створюємо об'єкт для зберігання feedings для кожного часу
                        const feedingsForFeedId: Record<string, { feeding: string; editing: string }> = {};

                        // Спочатку додаємо існуючі записи з extraFilledRows
                        feedRows.forEach(row => {
                            const hours = parseInt(row.date_time.split(':')[0], 10);

                            if (!feedingsForFeedId[hours]) {
                                feedingsForFeedId[hours] = {
                                    feeding: '0', // Початкова кількість корму
                                    editing: '0'    // Початкове редагування
                                };
                            }

                            const editingValue = row.quantity ? (row.quantity * 1000).toFixed(1) : '0';
                            feedingsForFeedId[hours].editing = editingValue;
                        });

                        // Потім додаємо записи для годин з масиву times
                        times.forEach(({ time }) => {
                            const hours = parseInt(time, 10);

                            if (!feedingsForFeedId[hours]) {
                                // Якщо запис для цього часу не існує, створюємо його
                                feedingsForFeedId[hours] = {
                                    feeding: '0', // Значення за замовчуванням
                                    editing: '0'    // Редагування за замовчуванням
                                };
                            }
                        });

                        const valueToPush = {
                            feedType: feedRows[0].feedType, // Тип корму
                            feedName: feedRows[0].feedName, // Назва корму
                            feedId: feedRows[0].item_id,    // ID корму
                            feedings: feedingsForFeedId      // Зберігаємо feedings по годинах
                        }

                        // if (loc.id === 47) {
                        //     console.log('hello bitches ', valueToPush)
                        // }
                        // Додаємо цей корм до основного масиву feedings
                        feedings.push(valueToPush);
                    });
                    feedingsCount++;
                }

                // console.log('feedings: ', feedings)

                // Додати до загального масиву
                data.push({
                    locId: loc.id,
                    locName: loc.name,
                    date: today,
                    batch: {
                        id: Number(todayCalc?.batch.batch_id),
                        name: String(todayCalc?.batch.batch_name)
                    },
                    rowCount: feedingsCount,
                    feedings,
                });
            }
        }
    }

    return data
}

const setLines = async () => {
    return await db.productionlines.findMany({
        select: {
            id: true,
            name: true,
            pools: {
                select: {
                    name: true,
                    id: true,
                    locations: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        }
    })
}

async function getExtraData(locId: number, today: string, prevItemId?: number, todayItemId?: number) {

    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const query = await db.documents.findMany({
        select: {
            date_time: true,
            itemtransactions: {
                select: {
                    location_id: true,
                    quantity: true,
                    itembatches: {
                        select: {
                            items: {
                                select: {
                                    id: true,
                                    name: true,
                                    feedtypes: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                where: { location_id: locId }
            },
        },
        where: {
            doc_type_id: 9,
            date_time: { lte: endOfDay, gte: startOfDay },
            itemtransactions: { some: { location_id: locId } },
        },
    });


    // if (locId === 47) {
    //     console.log('hello bitches')
    //     query.map(qu => {
    //         qu.itemtransactions.map(tran => {
    //             console.log(tran)
    //         })
    //     })
    // }

    // Фільтруємо записи, де є транзакції
    const filteredQuery = query.filter(doc => doc.itemtransactions.length > 0);

    // Масив з prevItemId та todayItemId
    const prevAndTodayItemIds = [prevItemId, todayItemId].filter(Boolean);

    // Масив унікальних item_id
    const uniqueItemIds = filteredQuery.flatMap(doc =>
        doc.itemtransactions.flatMap(tran =>
            tran.itembatches.items.id // Доступ до item_id без використання map
                ? [tran.itembatches.items.id] // Якщо item_id є, додаємо його в масив
                : []
        )
    ).filter(itemId => !prevAndTodayItemIds.includes(itemId)); // Фільтруємо item_id, яких немає в prevItemId та todayItemId

    // Групуємо записи по item_id
    const groupedByItemId: Record<number, any[]> = {};

    filteredQuery.forEach(doc => {
        doc.itemtransactions.forEach(tran => {
            const itemId = tran.itembatches.items.id;
            if (uniqueItemIds.includes(itemId)) {
                const record = {
                    feedType: tran.itembatches.items.feedtypes?.name,
                    feedName: tran.itembatches.items.name,
                    date_time: doc.date_time.toISOString().split("T")[1],
                    item_id: itemId,
                    quantity: tran.quantity,
                    location_id: tran.location_id
                };

                if (!groupedByItemId[itemId]) {
                    groupedByItemId[itemId] = []; // Якщо ще немає такого item_id, ініціалізуємо масив
                }

                groupedByItemId[itemId].push(record); // Додаємо запис до масиву для цього item_id
            }
        });
    });

    // // Виведення результату
    // console.log("Групування по item_id:");
    // for (const [itemId, records] of Object.entries(groupedByItemId)) {
    //     console.log(`для item_id = ${itemId}:`, records);
    // }

    // console.log(groupedByItemId)

    return groupedByItemId;
}