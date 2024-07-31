import { db } from "@/db"
import { notFound } from "next/navigation";
import Link from "next/link";
import * as actions from '@/actions'

interface PurchTableShowPageProps {
    params: {
        id: string
    }
}

export default async function PurchTableShowPage(props: PurchTableShowPageProps){
    let purch_record;
    try{
        purch_record = await db.purchtable.findFirst({
            where: { id: parseInt(props.params.id) }
        })

        if (!purch_record){
            notFound();
        }

        const deletePurchRecordAction = actions.deletePurchTable.bind(null, purch_record.id)

        return(
            <div>
                <div className="flex m-4 justify-between center">
                    <h1 className="text-xl font-bold">{purch_record.id.toString()}</h1>
                    <div className="flex gap-4">
                        <Link href={`/purchtable/${purch_record.id}/edit`} className="p-2 border rounded">
                            Edit
                        </Link>
                        <form action={deletePurchRecordAction}>
                            <button className="p-2 border rounded">Delete</button>
                        </form>
                    </div>
                </div>
                <div className="p-3 border rounded border-gray-200">
                    <label><b>Date:</b></label>
                    <h2>
                        {purch_record.date_time.toLocaleString()} 
                    </h2>
                </div>
                <div className="p-3 border rounded bg-gray-200 border-gray-200">
                    <label><b>Vendor_id:</b></label>
                    <h2>
                        {purch_record.vendor_id} 
                    </h2>
                </div>
                <div className="p-3 border rounded border-gray-200">
                    <label><b>Vendor_doc_number:</b></label>
                    <h2>
                        {purch_record.vendor_doc_number} 
                    </h2>
                </div>        
            </div>
        )
    }
    catch(error){
        console.error("Error fetching purchtable data:", error);
    }finally {
        await db.$disconnect()
        .then(() => console.log("Disconnected from the database"))
        .catch((disconnectError) => console.error("Error disconnecting from the database:", disconnectError));
    }
}