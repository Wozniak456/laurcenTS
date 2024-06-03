import { db } from "@/db";

import CreateEditSalesHeader from '@/components/SalesHeaders/create-new-sales-header'

type NewSalesComponentProps = {
    
}

export default async function NewSalesComponent({} : NewSalesComponentProps){
    try{
        const customers = await db.customers.findMany()

        return(
            <CreateEditSalesHeader customers={customers}/>
        )

    }catch(error){
        console.error("Error fetching batch data:", error);
    }
    // finally {
    //     await db.$executeRaw`SELECT pg_terminate_backend(pid)
    //                          FROM pg_stat_activity
    //                          WHERE state = 'idle';`;
    //     console.log('Disconnected idle sessions successfully.');
    // }
    
}
