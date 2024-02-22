import { db } from "@/db";
import { notFound } from "next/navigation";
import ProdLineEditForm from "@/components/line-edit-form";

interface ProdLineEditPageProps {
    params: {
        id: string
    }
}

export default async function ProdLineEditPage(props: ProdLineEditPageProps){
    const id = parseInt(props.params.id);
    const line = await db.productionlines.findFirst({
        where: { id }
    });

    if(!line){
        notFound();
    }

    return(
        <div>
            <ProdLineEditForm line={line} />    
        </div>
    )
}