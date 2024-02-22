import { db } from "@/db"
import { notFound } from "next/navigation";
import Link from "next/link";
import * as actions from '@/actions'

interface CaviarShowPageProps {
    params: {
        id: string
    }
}

export default async function CaviarShowPage(props: CaviarShowPageProps){
    let caviar;
    try{
        caviar = await db.itembatches.findFirst({
            where: { id: parseInt(props.params.id) }
        })

        if (!caviar){
            notFound();
        }

        const deleteCaviarAction = actions.deleteItemBatch.bind(null, caviar.id)

        return(
            <div>
                <div className="flex m-4 justify-between center">
                    <h1 className="text-xl font-bold">{caviar.name}</h1>
                    <div className="flex gap-4">
                        <Link href={`/caviar/${caviar.id}/edit`} className="p-2 border rounded">
                            Edit
                        </Link>
                        <form action={deleteCaviarAction}>
                            <button className="p-2 border rounded">Delete</button>
                        </form>
                    </div>
                </div>
                <div className="p-3 border rounded bg-gray-200 border-gray-200">
                    <label><b>Description:</b></label>
                    <h2>
                        {caviar.description} 
                    </h2>
                </div>
                <div className="p-3 border rounded border-gray-200">
                    <label><b>item_id:</b></label>
                    <h2>
                        {caviar.item_id} 
                    </h2>
                </div>
                <div className="p-3 border rounded border-gray-200">
                    <label><b>created:</b></label>
                    <h2>
                        {caviar.created.toLocaleString()} 
                    </h2>
                </div>
                <div className="p-3 border rounded border-gray-200">
                    <label><b>created_by:</b></label>
                    <h2>
                        {caviar.created_by} 
                    </h2>
                </div>
            </div>
        )
    }
    catch(error){
        console.error("Error fetching caviar data:", error);
    }finally {
        await db.$disconnect()
        .then(() => console.log("Disconnected from the database"))
        .catch((disconnectError) => console.error("Error disconnecting from the database:", disconnectError));
    }
}