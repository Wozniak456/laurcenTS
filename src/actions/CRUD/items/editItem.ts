'use server'
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface editItemFormState{
    // errors:{
    //     delivery_date?: string[],
    //     vendor_id?: string[],
    //     vendor_doc_number?: string[],
    //     _form?: string[]
    // }
}

export async function editItem(
    formState: editItemFormState, 
    formData: FormData,
    ):Promise<editItemFormState>{ 
        try{
            console.log('editItem', formData)
            const item_name = formData.get('name') as string;
            const item_type_id: number = parseInt(formData.get('item_type_id') as string);
            const item_id: number = parseInt(formData.get('item_id') as string);
            const default_unit_id: number = parseInt(formData.get('default_unit_id') as string);
            const vendor_id: number = parseInt(formData.get('vendor_id') as string);
            const feed_type_id: number = parseInt(formData.get('feed_type_id') as string);
            const item_description = formData.get('description') as string;
            
            const item = await db.items.update({
                where: {id : item_id},
                data: {
                    name: item_name,
                    description: item_description,
                    item_type_id: item_type_id,
                    default_unit_id: default_unit_id,
                    feed_type_id: feed_type_id,
                    vendor_id: vendor_id
                }
            });
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