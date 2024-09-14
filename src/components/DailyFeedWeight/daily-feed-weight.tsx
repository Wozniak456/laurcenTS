import LocationComponent from '@/components/DailyFeedWeight/location-info'
import * as feedingActions from "@/actions/feeding"
import * as stockingActions from "@/actions/stocking"
import * as actions from "@/actions"
import { calculationAndFeed, calculationAndFeedExtended } from '@/types/app_types'

type LocationSummary = {
    uniqueItemId: number;
    totalFeed: number;
};

type subRow = {
    qty?: number ,
    feed:{
        id?: number,
        name?: string
    },
    item:{
        id?: number,
        name?: string
    }
}

type Row = {
    location?:{
        id: number ,
        name: string
    },
    rows?: subRow[]
};

interface DailyFeedWeightProps{
    lines: {
        id: number;
        pools: {
            id: number;
            locations: {
                name: string;
                id: number;
            }[];
        }[];
    }[],
    summary: {
        [itemId: number]: LocationSummary;
    },
    items: {
        id: number;
        name: string;
        description: string | null;
        item_type_id: number | null;
        feed_type_id: number | null;
        default_unit_id: number | null;
        parent_item: number | null;
        vendor_id: number | null;
    }[],
    date: string
}

export default async function DailyFeedWeight({lines, summary, items, date}: DailyFeedWeightProps){


    const data: Row[] = [];

    for (const line of lines) {
        for (const pool of line.pools) {
            for (const loc of pool.locations) {
                // перевірка чи локація не пуста
                const isPoolFilled = await feedingActions.isFilled(loc.id);

                let todayCalcExtended: calculationAndFeedExtended | undefined;
                let prevCalcExtended: calculationAndFeedExtended | undefined;

                if (isPoolFilled) {
                    const todayCalc: calculationAndFeed = await stockingActions.calculationForLocation(loc.id, date);

                    if (todayCalc.feed && todayCalc.feed.type_id) {
                        todayCalcExtended = {
                            ...todayCalc,
                            allItems: await actions.getAllItemsForFeedType(todayCalc.feed.type_id)
                        };
                    }

                    if (todayCalc.calc?.transition_day) {
                        const prevCalc = await stockingActions.getPrevCalc(loc.id, todayCalc);

                        if (prevCalc && prevCalc.calc && prevCalc.feed?.type_id) {
                            prevCalcExtended = {
                                ...prevCalc,
                                allItems: await actions.getAllItemsForFeedType(prevCalc.feed?.type_id)
                            };
                        }
                    }
                }

                const transitionDay = todayCalcExtended?.calc?.transition_day;

                let row: Row = {};

                if (transitionDay && todayCalcExtended?.calc?.feed_per_feeding) {
                    row = {
                        location: {
                            id: loc.id,
                            name: loc.name
                        },
                        rows: [
                            {
                                qty: todayCalcExtended?.calc?.feed_per_feeding * (1 - transitionDay * 0.2),
                                feed: {
                                    id: prevCalcExtended?.feed?.type_id,
                                    name: prevCalcExtended?.feed?.type_name
                                },
                                item: {
                                    id: prevCalcExtended?.feed?.item_id,
                                    name: items.find(item => item.id === prevCalcExtended?.feed?.item_id)?.name 
                                }
                            },
                            {
                                qty: todayCalcExtended?.calc?.feed_per_feeding * (transitionDay * 0.2),
                                feed: {
                                    id: todayCalcExtended?.feed?.type_id,
                                    name: todayCalcExtended?.feed?.type_name
                                },
                                item: {
                                    id: prevCalcExtended?.feed?.item_id,
                                    name: items.find(item => item.id === todayCalcExtended?.feed?.item_id)?.name 
                                }
                            },
                        ]
                    };
                } else {
                    row = {
                        location: {
                            id: loc.id,
                            name: loc.name
                        },
                        rows: [
                            {
                                qty: todayCalcExtended?.calc?.feed_per_feeding,
                                feed: {
                                    id: todayCalcExtended?.feed?.type_id,
                                    name: todayCalcExtended?.feed?.type_name
                                },
                                item: {
                                    id: prevCalcExtended?.feed?.item_id,
                                    name: items.find(item => item.id === todayCalcExtended?.feed?.item_id)?.name 
                                }
                            }
                        ]
                    };
                }

                data.push(row);
            }
        }
    }

    const aggregatedData: { [key: string]: number } = {};

    data.forEach(row => {
        row.rows?.forEach(subRow => {
            const itemName = subRow.item.name;
            if (itemName !== undefined) {
                if (!aggregatedData[itemName]) {
                    // Якщо item.name ще не існує, створюємо новий запис
                    aggregatedData[itemName] = subRow.qty || 0;
                } else {
                    // Якщо item.name вже існує, акумулюємо значення qty
                    aggregatedData[itemName] += subRow.qty || 0;
                }
            }
        });
    });

    console.log('aggregatedData', aggregatedData);

    return(
        <>
            <div className="flex justify-between my-4 mx-8">
                <h1 className="text-lg font-bold">Наважка на 1 годування</h1>
                <h1 className="text-lg font-bold">Зведена таблиця</h1>
            </div>
            
            <div className="flex justify-around min-h-screen content-start">
                <table className="w-1/2 bg-white rounded-lg shadow-lg">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="border p-4">№ басейну</th>
                            <th className="border p-4">К-сть, г</th>
                            <th className="border p-4">Тип корму</th>
                            <th className="border p-4">Корм</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lines.map(line => (
                            line.pools.map(pool => (
                                pool.locations.flatMap(async loc => {
                                   
                                    const row = data.find(row => (row.location?.id == loc.id))
                                    
                                    return (
                                        <LocationComponent
                                            key={loc.id}
                                            row={row}
                                            items={items}
                                        />
                                    );
                                })
                            ))
                        ))}
                    </tbody>
                </table>

                <table className="w-1/3 bg-white rounded-lg shadow-lg self-start">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="border p-4">Корм</th>
                            <th className="border p-4">Кількість</th>
                        </tr>
                    </thead>
                    <tbody>
                    {Object.entries(aggregatedData).map(([itemName, qty]) => (
                    <tr key={itemName}>
                        <td className="px-4 h-10 border border-gray-400">{itemName}</td>
                        <td className="px-4 h-10 border border-gray-400">{qty}</td>
                    </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            </>
    )
}