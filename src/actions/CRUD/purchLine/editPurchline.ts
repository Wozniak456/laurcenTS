'use server'
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function editPurchline(
    formState: {message: string}, 
    formData: FormData,
    ){
        try{
            console.log('editPurchline', formData)
            const purchase_id: number = parseInt(formData.get('purchase_id') as string);
            const item_id: number = parseInt(formData.get('item_id') as string);
            const quantity: number = parseFloat(formData.get('quantity') as string);
            const unit_id: number = parseInt(formData.get('unit_id') as string);
            const id: number = parseInt(formData.get('purch_line_id') as string);
                        
            await db.purchaselines.update({
                where: {id},
                data: {
                    purchase_id,
                    item_id,
                    quantity,
                    unit_id
                }
            });
        }
        catch(err: unknown){
            return{message :'Something went wrong!'}
        }
    revalidatePath('/purchtable/view')
    redirect('/purchtable/view');
}