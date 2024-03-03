import { db } from "@/db";
import { notFound } from "next/navigation";
import CaviarEditForm from "@/components/item-batch-edit-form";

interface CaviarEditPageProps {
    params: {
        id: string
    }
}

export default async function CaviarEditPage(props: CaviarEditPageProps){
    const id = parseInt(props.params.id);
    const caviar = await db.itembatches.findFirst({
        where: { id }
    });

    if(!caviar){
        notFound();
    }

    return(
        <div>
            <CaviarEditForm itembatch={caviar} endpoint={'caviar'}/>    
        </div>
    )
}