import { db } from "@/db"
import { notFound } from "next/navigation";
import Link from "next/link";
import * as actions from '@/actions'
import type {calculation_table} from '@prisma/client'

interface CalculationPageProps {
    params: {
        id: string
    }
}

export default async function CalculationShowPage(props: CalculationPageProps){
    console.log('Sofiia', props.params.id)
    let calc_10_records: calculation_table[] = [];
    try{
        const docId = await db.calculation_table.findUnique({
            select: {
                doc_id: true
            },
            where: {
                id: parseInt(props.params.id)
            }
            }).then(result => result?.doc_id);
            
        if (docId) {
            calc_10_records = await db.calculation_table.findMany({
                where: {
                    doc_id: docId
                }
            });
        }

        if (!calc_10_records) {
            notFound();
        }

        const deleteOneCalculationAction = actions.deleteOneCalculation.bind(null, calc_10_records[0].id)

        return(
            <div>
                <div className="flex m-4 justify-between center">
                    <h1 className="text-xl font-bold">{calc_10_records[0].doc_id.toString()}</h1>
                    <div className="flex gap-4">
                        <form action={deleteOneCalculationAction}>
                            <button className="p-2 border rounded">Delete</button>
                        </form>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr className="bg-blue-200">
                            <th className="border border-blue-500 px-4 py-2">Days</th>
                            <th className="border border-blue-500 px-4 py-2">Data</th>
                            <th className="border border-blue-500 px-4 py-2">Fish in pool</th>
                            <th className="border border-blue-500 px-4 py-2">Gen weight</th>
                            <th className="border border-blue-500 px-4 py-2">Fish weight</th>
                            <th className="border border-blue-500 px-4 py-2">Feed quantity</th>
                            <th className="border border-blue-500 px-4 py-2">vc</th>
                            <th className="border border-blue-500 px-4 py-2">Total weight</th>
                            <th className="border border-blue-500 px-4 py-2">Fish weight</th>
                            <th className="border border-blue-500 px-4 py-2">Feed today</th>
                            <th className="border border-blue-500 px-4 py-2">Feed per day</th>
                            <th className="border border-blue-500 px-4 py-2">Feed per feeding</th>
                            <th className="border border-blue-500 px-4 py-2">doc_id</th>
                        </tr>
                    </thead>
                    <tbody>
                        {calc_10_records.map((record) => (
                            <tr key={record.id} className="bg-gray-100">
                            <td className="border border-blue-500 px-4 py-2">{record.day}</td>
                            <td className="border border-blue-500 px-4 py-2" style={{ width: 'auto', whiteSpace: 'nowrap' }}>{record.date.toISOString().split("T")[0]}</td>
                            <td className="border border-blue-500 px-4 py-2">{record.fish_amount_in_pool}</td>
                            <td className="border border-blue-500 px-4 py-2">{record.general_weight.toFixed(3)}</td>
                            <td className="border border-blue-500 px-4 py-2">{record.fish_weight.toFixed(3)}</td>
                            <td className="border border-blue-500 px-4 py-2">{record.feed_quantity.toFixed(3)}</td>
                            <td className="border border-blue-500 px-4 py-2">{record.v_c}</td>
                            <td className="border border-blue-500 px-4 py-2">{record.total_weight.toFixed(3)}</td>
                            <td className="border border-blue-500 px-4 py-2">{record.weight_per_fish.toFixed(3)}</td>
                            <td className="border border-blue-500 px-4 py-2">{record.feed_today.toFixed(3)}</td>
                            <td className="border border-blue-500 px-4 py-2">{record.feed_per_day.toFixed(3)}</td>
                            <td className="border border-blue-500 px-4 py-2">{record.feed_per_feeding.toFixed(3)}</td>
                            <td className="border border-blue-500 px-4 py-2">{record.doc_id.toString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }
    catch(error){
        console.error("Error fetching batch data:", error);
    }finally {
        await db.$disconnect()
        .then(() => console.log("Disconnected from the database"))
        .catch((disconnectError) => console.error("Error disconnecting from the database:", disconnectError));
    }
}