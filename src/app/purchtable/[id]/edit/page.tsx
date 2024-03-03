import { db } from "@/db";
import { notFound } from "next/navigation";
import PurchRecordEditForm from "@/components/purch-record-edit-form";

interface PurchtableEditPageProps {
    params: {
        id: string
    }
}

export default async function PurchtableEditPage(props: PurchtableEditPageProps){
    const id = parseInt(props.params.id);
    const purchRecord = await db.purchtable.findFirst({
        where: { id }
    });

    if(!purchRecord){
        notFound();
    }

    return(
        <div>
            <PurchRecordEditForm purchtableRecord={purchRecord}/>    
        </div>
    )
}