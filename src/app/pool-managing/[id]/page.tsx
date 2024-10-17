import { db } from "@/db"
import { notFound } from "next/navigation";
import ActualizationPage from "@/components/Pools/actualization-form";
import * as stockingActions from '@/actions/stocking'
import { poolManagingTypeExtended } from "@/types/app_types";

interface PoolManagingShowPageProps {
    params: {
        id: string
    }
}
// poolInfo, location, batches
export default async function PoolManagingShowPage(props: PoolManagingShowPageProps){
    try{
        let location = await db.locations.findFirst({
            where: { id: parseInt(props.params.id) }
        })

        if (!location){
            notFound()
        }

        const today = new Date()

        let poolInfo : poolManagingTypeExtended | undefined = await stockingActions.poolInfo(parseInt(props.params.id), today.toISOString().split("T")[0])

        poolInfo = {
            ...poolInfo,
            location:{
                id: location.id,
                name: location.name
            }
        }

        const batches = await db.itembatches.findMany({
            include:{
              items: true
            },
            where:{
              items:{
                item_type_id: 1
              }
            }
          })

        const feeds = await db.items.findMany({
            where:{
                item_type_id: 3
            }
        })

        return( 
           <>
                <ActualizationPage poolInfo={poolInfo} batches={batches} feeds={feeds} />
           </>
        )
    }
    catch(error){
        console.error("Error fetching batch data:", error);
    }
}