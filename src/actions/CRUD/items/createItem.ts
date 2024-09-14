'use server'
import { db } from "@/db";
import { redirect } from "next/navigation";
// import type { purchtable } from "@prisma/client"; 
import { revalidatePath } from "next/cache";
import { z } from 'zod'
import paths from "@/paths";

interface createItemFormState{
    // errors:{
    //     delivery_date?: string[],
    //     vendor_id?: string[],
    //     vendor_doc_number?: string[],
    //     _form?: string[]
    // }
}

export async function createItem(
    formState: createItemFormState, 
    formData: FormData,
    ):Promise<createItemFormState>{ 
        try{
            console.log(formData)

            const item_name = formData.get('name') as string;
            const item_type_id: number = parseInt(formData.get('item_type_id') as string);
            const default_unit_id: number = parseInt(formData.get('default_unit_id') as string);
            const vendor_id: number = parseInt(formData.get('vendor_id') as string);
            const feed_type_id: number = parseInt(formData.get('feed_type_id') as string);
            const item_description = formData.get('description') as string;
            
            const item = await db.items.create({
                data:{
                    name: item_name,
                    description: item_description,
                    item_type_id,
                    default_unit_id,
                    feed_type_id,
                    vendor_id
                }
            })
            
        }
        catch(err: unknown){
            return{errors:{}}
        }

    revalidatePath('/vendors/view')
    revalidatePath('/summary-feeding-table/week')
    revalidatePath('/purchtable/view')
    revalidatePath('/accumulation/view')
    redirect('/vendors/view');
}