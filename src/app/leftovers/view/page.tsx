import { db } from "@/db";
import FilterableTable from '@/components/LeftOvers/filtering-table'

interface Saldos {
    [batchId: string]: {
        qty: number,
        // itemId: number,
        feed_type_name: string,
        itemName: string,
        batchName: string
    };
}

interface DataItem{
    batch_id: string;
    batch_name: string;
    // item_id: number,
    feed_type_name: string,
    item_name: string,
    start_saldo: number;
    incoming: number;
    outcoming: number;
    end_saldo: number;
}

export default async function LeftoversHome() {

    let EndSaldoDate = new Date(); // yyyy-mm-dd
    let StartSaldoDate = new Date(EndSaldoDate);
    StartSaldoDate.setMonth(StartSaldoDate.getMonth() - 1);


    let data: DataItem[] = []

    const end_saldo = await calculateSaldo(undefined, undefined, undefined)
    const start_saldo = await calculateSaldo(undefined, StartSaldoDate, undefined)
    const incoming = await calculateSaldo(StartSaldoDate, EndSaldoDate, { gt: 0 })
    const outcoming = await calculateSaldo(StartSaldoDate, EndSaldoDate, { lt: 0 })

    for (const batch_id in end_saldo){
        if (Object.prototype.hasOwnProperty.call(end_saldo, batch_id)) {
            data.push({
                batch_id: batch_id,
                batch_name: end_saldo[batch_id].batchName,
                // item_id: end_saldo[batch_id]?.itemId,
                feed_type_name: end_saldo[batch_id]?.feed_type_name,
                item_name: end_saldo[batch_id]?.itemName,
                start_saldo: start_saldo[batch_id]?.qty ? start_saldo[batch_id].qty : 0,
                incoming: incoming[batch_id]?.qty ? incoming[batch_id].qty : 0,
                outcoming: outcoming[batch_id]?.qty ? outcoming[batch_id].qty : 0,
                end_saldo: end_saldo[batch_id]?.qty
            });
        }
    }

    
    return (
        <div>
            <FilterableTable data={data} start={StartSaldoDate} end={EndSaldoDate}/>
        </div>
    );
}

interface FilterSpecifier {
    gt?: number;
    lt?: number;
    gte?: number;
    lte?: number;
}

const calculateSaldo = async (startDate: Date | undefined, endDate: Date | undefined, quantityFilter: FilterSpecifier | undefined)
: Promise<Saldos> => {
    const result = await db.itemtransactions.groupBy({
        by: ['batch_id'],
        where: {
            locations: {
                location_type_id: 1
            },
            documents: {
                date_time: {
                    gte: startDate,
                    lt: endDate
                }
            },
            quantity: quantityFilter,
            NOT: {
                itembatches: {
                    items: {
                        feed_type_id: null
                    }
                }
            }
        },
        _sum: {
            quantity: true
        },
    });

    const newView = await db.itembatches.findMany({
        include:{
            items: {
                include: {
                    feedtypes: true
                }
            }
        },
        where:{
            id:{
                in: result.map(result => result.batch_id)
            }
        }
    })

    const mergedResults = newView.map((item: any) => {
        const sumItem = result.find((r: any) => r.batch_id === item.id);
        return {
            ...item,
            _sum: sumItem ? sumItem._sum.quantity : 0
        };
    });

    const saldoData: Saldos = {};

    mergedResults.forEach((batch: any) => {
        saldoData[batch.id.toString()] = {
            qty: batch._sum,
            feed_type_name: batch.items.feedtypes.name,
            // itemId: batch.items.id,
            itemName: batch.items.name,
            batchName: batch.name
        };
    });
    
    return saldoData;
};
