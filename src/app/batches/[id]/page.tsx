import { db } from "@/db"
import { notFound } from "next/navigation";
import ItemBatchComponent from '@/components/FishBatch/batch-element'
import { BatchWithCreationInfo } from '@/types/app_types'
import * as actions from '@/actions'

interface BatchesShowPageProps {
    params: {
        id: string
    }
}

export default async function BatchesShowPage(props: BatchesShowPageProps){
    try{
        let batch : BatchWithCreationInfo | undefined | null = await actions.getFishBatch(parseInt(props.params.id))

        if (!batch){
            notFound()
        }

        const transactionOfCreation = await db.itemtransactions.findFirst({
            select:{
                id: true,
                quantity: true,
                documents:{
                    select:{
                        id: true,
                        date_time: true
                    }
                }
            },
            where:{
                documents:{
                    doc_type_id: 8 // реєстрація партії,
                },
                batch_id: parseInt(props.params.id)
            }
        })

        batch = {
            ...batch,
            docId: transactionOfCreation?.documents.id,
            tranId: transactionOfCreation?.id,
            quantity: transactionOfCreation?.quantity,
            isNew: true
        }

        // визначаємо чи нова ця партія
        const AllTransactions = await db.itemtransactions.findMany({
            where:{
                documents:{
                    doc_type_id: {
                        not: 8 // реєстрація партії
                    }
                },
                batch_id: parseInt(props.params.id)
            }
        })

        if(AllTransactions.length > 0){
            batch = {
                ...batch,
                isNew: false
            }
        }

        const items = await db.items.findMany({
            select: {
                id: true,
                name: true
            },
            where:{
                item_type_id:{
                    in: [1, 2]
                }
            }
        })

        return( 
           <ItemBatchComponent batch={batch} items={items}/>
        )
    }
    catch(error){
        console.error("Error fetching batch data:", error);
    }
}