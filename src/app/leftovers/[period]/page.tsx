import { db } from "@/db"
import { notFound } from "next/navigation";
import ItemBatchComponent from '@/components/FishBatch/batch-element'
import { BatchWithCreationInfo } from '@/types/app_types'
import Link from "next/link";

interface LeftoversPerPeriodProps {
    params: {
        period: string
    }
}

interface DataItem{
    batch_id: string;
    batch_name: string;
    feed_type_name: string,
    item_name: string,
    start_saldo: number;
    incoming: number;
    outcoming: number;
    end_saldo: number;
}

export default async function LeftoversPerPeriod(props: LeftoversPerPeriodProps){
    const parts = props.params.period.split('_');
    
    try{
        
        let StartSaldoDate = new Date(parts[0])
        const EndSaldoDate1 = new Date(parts[1])

        const EndSaldoDate: Date = new Date(EndSaldoDate1);
        EndSaldoDate.setDate(EndSaldoDate.getDate() + 1 );
        
        
        const end_saldo = await calculateSaldo(undefined, undefined, undefined)
        const start_saldo = await calculateSaldo(undefined, StartSaldoDate, undefined)
        const incoming = await calculateSaldo(StartSaldoDate, EndSaldoDate, { gt: 0 })
        const outcoming = await calculateSaldo(StartSaldoDate, EndSaldoDate, { lt: 0 })

        let data: DataItem[] = []

        for (const batch_id in end_saldo){
            if (Object.prototype.hasOwnProperty.call(end_saldo, batch_id)) {
                data.push({
                    batch_id: batch_id,
                    batch_name: end_saldo[batch_id].batchName,
                    feed_type_name: end_saldo[batch_id]?.feed_type_name,
                    item_name: end_saldo[batch_id]?.itemName,
                    start_saldo: start_saldo[batch_id]?.qty ? start_saldo[batch_id].qty : 0,
                    incoming: incoming[batch_id]?.qty ? incoming[batch_id].qty : 0,
                    outcoming: outcoming[batch_id]?.qty ? outcoming[batch_id].qty : 0,
                    end_saldo: end_saldo[batch_id]?.qty
                });
            }
        }

        return( 
           <div className="my-4 flex flex-col gap-4">
            <div className="flex justify-end w-full ">
                <Link 
                    href={`/leftovers/view`}
                    className="py-2 w-40 text-center font-bold text-blue-500 hover:underline underline-offset-2">
                    Назад
                </Link>
            </div>
            <div>
                <div className="flex justify-between p-2 text-lg font-bold">
                    <h1>Початок: {StartSaldoDate.toISOString().split("T")[0]}</h1>
                    <h1>Кінець: {EndSaldoDate1.toISOString().split("T")[0]}</h1>
                </div>
                <table className="table-auto border-collapse w-full">
                    <thead className="bg-gray-200">
                    <tr className="bg-blue-100">
                    <th className="px-2 py-2 border-gray-400">ID партії</th>
                        <th className="px-2 py-2 border-gray-400">Назва партії</th>
                        <th className="px-2 py-2 border-gray-400">Тип корму</th>
                        <th className="px-2 py-2 border-gray-400">Назва товару</th>
                        <th className="px-2 py-2 border-gray-400 w-32">На початку розрахунку</th>
                        <th className="px-2 py-2 border-gray-400 w-32">Прибуло</th>
                        <th className="px-2 py-2 border-gray-400 w-32">Списано</th>
                        <th className="px-2 py-2 border-gray-400 w-32">Зараз на складі</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {data
                    .sort((a, b) => a.feed_type_name.localeCompare(b.feed_type_name))
                    .map((item, index) => (
                        <tr key={index}>
                        <td className="px-2 py-2 border border-gray-400 text-center">{item.batch_id}</td>
                        <td className="px-2 py-2 border border-gray-400 text-center">{item.batch_name}</td>
                        <td className="px-2 py-2 border border-gray-400 text-center">{item.feed_type_name}</td>
                        <td className="px-2 py-2 border border-gray-400 text-center">{item.item_name}</td>
                        <td className="px-2 py-2 border border-gray-400 text-center">{item.start_saldo.toFixed(2)}</td>
                        <td className="px-2 py-2 border border-gray-400 text-center">{item.incoming.toFixed(2)}</td>
                        <td className="px-2 py-2 border border-gray-400 text-center">{item.outcoming.toFixed(2)}</td>
                        <td className="px-2 py-2 border border-gray-400 text-center">{item.end_saldo.toFixed(2)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table> 
            </div>
           </div>
        )

        
    }
    catch(error){
        console.error("Error fetching batch data:", error);
    }
    finally {
        await db.$executeRaw`SELECT pg_terminate_backend(pid)
                             FROM pg_stat_activity
                             WHERE state = 'idle';`;
        console.log('Disconnected idle sessions successfully.');
    }
}


interface Saldos {
    [batchId: string]: {
        qty: number,
        // itemId: number,
        feed_type_name: string,
        itemName: string,
        batchName: string
    };
}

interface FilterSpecifier {
    gt?: number;
    lt?: number;
    gte?: number;
    lte?: number;
}

const calculateSaldo = async (startDate: Date | undefined, endDate: Date | undefined, quantityFilter: FilterSpecifier | undefined)
: Promise<Saldos> => {

    console.log('endDate', endDate)
    const result = await db.itemtransactions.groupBy({
        by: ['batch_id'],
        where: {
            locations: {
                location_type_id: 1
            },
            documents: {
                date_time: {
                    gte: startDate,
                    lte: endDate
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
