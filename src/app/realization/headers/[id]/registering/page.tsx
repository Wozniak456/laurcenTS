import { db } from "@/db";
import Registering from '@/components/SalesHeaders/registering'


interface RegisteringComponentProps {
    params: {
        id: string
    }
  }

export default async function RegisteringComponent(props: RegisteringComponentProps){
    const salesheader = await db.salestable.findFirst({
        include:{
          saleslines: {
            include:{
                items: {
                    include:{
                        units: true
                    }
                }
            }
          }
        },
        where:{
            id: Number(props.params.id)
        }
    })

    return(
        <>
            <Registering header={salesheader}/>
        </>
    )
}