'use server'
import { db } from "@/db";
import { redirect } from "next/navigation";
// import type { purchtable } from "@prisma/client"; 
import { revalidatePath } from "next/cache";
import { z } from 'zod'
import paths from "@/paths";

interface createVendorFormState{
    // errors:{
    //     delivery_date?: string[],
    //     vendor_id?: string[],
    //     vendor_doc_number?: string[],
    //     _form?: string[]
    // }
}

export async function createVendor(
    formState: createVendorFormState, 
    formData: FormData,
    ):Promise<createVendorFormState>{ 
        try{
            console.log(formData)

            const vendor_name = formData.get('name') as string;
            const vendor_description = formData.get('description') as string;
            
            const vendor = await db.vendors.create({
                data:{
                    name: vendor_name,
                    description: vendor_description
                }
            })
            
        }
        catch(err: unknown){
            return{errors:{}}
        }
    revalidatePath('/vendors/view')
    revalidatePath('/purchtable/view')
    revalidatePath('/accumulation/view')
    // revalidatePath('/pool-managing/view')
    
    redirect('/vendors/view');
}