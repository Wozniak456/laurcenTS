import { db } from "@/db";
import { notFound } from "next/navigation";
import BatchEditForm from "@/components/item-batch-edit-form";

interface BatchEditPageProps {
    params: {
        id: string
    }
}

export default async function BatchEditPage(props: BatchEditPageProps){
    const id = parseInt(props.params.id);
    const batch = await db.itembatches.findFirst({
        where: { id }
    });

    if(!batch){
        notFound();
    }

    return(
        <div>
            <BatchEditForm itembatch={batch} endpoint="batches"/>    
        </div>
    )
}