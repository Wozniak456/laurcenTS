'use server'
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
// import { redirect } from "next/navigation";


export async function editItemBatch(
    formState: {message: string}, 
    formData: FormData,
    ){
        try{
            console.log('editItemBatch', formData)
            const batch_id: number = parseInt(formData.get('batch_id') as string);
            const item_id: number = parseInt(formData.get('item_id') as string);
            const dateStr = formData.get('date') as string;
            const qty: number = parseInt(formData.get('qty') as string);
            const doc_id: number = parseInt(formData.get('doc_id') as string);
            const tran_id: number = parseInt(formData.get('tran_id') as string);
    
            let date_to_insert = new Date(dateStr)
            let item_id_to_insert = item_id
    
            // якщо треба змінити кількість
            if(qty){
                await db.itemtransactions.update({
                    where:{
                        id: tran_id
                    },
                    data:{
                        quantity: qty
                    }
                })
            }
            // якщо треба змінити item_id чи дату реєстрації
            else if (item_id || dateStr){
                const itemBatch = await db.itembatches.findFirst({
                    where:{
                        id: batch_id
                    }
                })
    
                if(itemBatch){
                    if(!item_id){
                        item_id_to_insert = itemBatch?.item_id
                    }
                    if(!dateStr){
                        date_to_insert = itemBatch.created as Date
                    }
    
                    //якщо треба змінити дату
                    if (dateStr){
    
                        const name = await getBatchName(item_id_to_insert as number, date_to_insert)
            
                        await db.itembatches.update({
                            where:{
                                id: batch_id
                            },
                            data:{
                                created: date_to_insert,
                                name: name
                            }
                        })
                    }
    
                    if (item_id){
    
                        const name = await getBatchName(item_id_to_insert as number, date_to_insert)
            
                        await db.itembatches.update({
                            where:{
                                id: batch_id
                            },
                            data:{
                                item_id: item_id_to_insert,
                                name: name
                            }
                        })
                    }
    
                }
    
            }
            else{
                throw new Error('Ви нічого не змінили!');
            }
            // return{message :'Оновлено!'}
        }
        catch(err: unknown){
            console.log('ми в catch Error editItemBatch')
            if(err instanceof Error){
                 if (err.message.includes('Unique constraint failed')){
                    return{
                        message: `Партія з цією назвою вже існує`
                    }
                }
                else {
                    return {
                        message: err.message
                    };
                }
            }
            else{
                return{message :'Something went wrong!'}
            }
        }
        revalidatePath(`/batches/${formData.get('batch_id')}`)
        redirect(`/batches/${formData.get('batch_id')}`);
    }

async function getBatchName(item_id: number, date: Date) {
    const parts = date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('.');
    return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}/C`;
}