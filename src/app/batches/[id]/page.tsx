import { db } from "@/db"
import { notFound } from "next/navigation";
import Link from "next/link";
import * as actions from '@/actions'

interface BatchesShowPageProps {
    params: {
        id: string
    }
}

export default async function BatchesShowPage(props: BatchesShowPageProps){
    let batch;
    try{
        batch = await db.itembatches.findFirst({
            where: { id: parseInt(props.params.id) }
        })

        if (!batch){
            notFound();
        }

        const deleteBatchAction = actions.deleteItemBatch.bind(null, batch.id, 'batches')

        return(
            <div>
                <div className="flex m-4 justify-between center">
                    <h1 className="text-xl font-bold">{batch.name}</h1>
                    <div className="flex gap-4">
                        <Link href={`/batches/${batch.id}/edit`} className="p-2 border rounded">
                            Edit
                        </Link>
                        <form action={deleteBatchAction}>
                            <button className="p-2 border rounded">Delete</button>
                        </form>
                    </div>
                </div>
                <div className="p-3 border rounded bg-gray-200 border-gray-200">
                    <label><b>Description:</b></label>
                    <h2>
                        {batch.description} 
                    </h2>
                </div>
                <div className="p-3 border rounded border-gray-200">
                    <label><b>item_id:</b></label>
                    <h2>
                        {batch.item_id} 
                    </h2>
                </div>
                <div className="p-3 border rounded border-gray-200">
                    <label><b>created:</b></label>
                    <h2>
                        {batch.created ? batch.created.toLocaleString() : 'No Date'} 
                    </h2>
                </div>
                <div className="p-3 border rounded border-gray-200">
                    <label><b>created_by:</b></label>
                    <h2>
                        {batch.created_by} 
                    </h2>
                </div>
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