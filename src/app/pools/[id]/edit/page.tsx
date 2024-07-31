import { db } from "@/db";
import { notFound } from "next/navigation";
import PoolEditForm from "@/components/Pools/pool-edit-form";

interface PoolEditPageProps {
    params: {
        id: string
    }
}

export default async function PoolEditPage(props: PoolEditPageProps){
    const id = parseInt(props.params.id);
    const pool = await db.pools.findFirst({
        where: { id }
    });

    if(!pool){
        notFound();
    }

    return(
        <div>
            <PoolEditForm pool={pool} />    
        </div>
    )
}