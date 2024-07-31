'use server'
import { db } from "@/db";
import { redirect } from "next/navigation";

export async function createPurchLine(
    formState: {message: string}, 
    formData: FormData,
    ){
        try{
            console.log('createPurchLineRecord', formData)
            const purchase_id: number = parseInt(formData.get('purchase_id') as string);
            const item_id: number = parseInt(formData.get('item_id') as string);
            const quantity: number = parseInt(formData.get('quantity') as string);
            const unit_id: number = parseInt(formData.get('unit_id') as string);
                        
            await db.purchaselines.create({
                data:{
                    purchase_id,
                    item_id,
                    quantity,
                    unit_id
                }
            })
        }
        catch(err: unknown){
            return{message :'Something went wrong!'}
        }
    redirect('/purchtable/view');
}