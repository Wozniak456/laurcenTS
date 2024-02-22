import { db } from "@/db";
import { notFound } from "next/navigation";
import ProdAreaEditForm from "@/components/area-edit-form";

interface ProdAreaEditPageProps {
    params: {
        id: string
    }
}

export default async function ProdAreaEditPage(props: ProdAreaEditPageProps){
    const id = parseInt(props.params.id);
    const area = await db.productionareas.findFirst({
        where: { id }
    });

    if(!area){
        notFound();
    }

    return(
        <div>
            <ProdAreaEditForm area={area} />    
        </div>
    )
}