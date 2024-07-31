'use server'
import { db } from "@/db";
import { redirect } from "next/navigation";

export async function registerGoodsInProduction(
    formState: {message: string}, 
    formData: FormData){
        console.log('registerGoodsInProduction', formData)
    try{
        const header_id : number = parseInt(formData.get('header_id') as string);
        const vendor_id : number = parseInt(formData.get('vendor_id') as string);
        
        const document = await db.documents.create({
            data:{
               location_id: 87, // склад 
               doc_type_id: 8, // Реєстрація партії
               executed_by: 3,
            }
        })

        console.log('створився документ', document.id)

        await db.purchtable.update({
            where: {id : header_id},
            data: {
                doc_id: document.id
            }
        });
        console.log('оновився doc_id')

        const lines = await db.purchaselines.findMany({
            select:{
                id: true,
                item_id: true,
                quantity: true,
                unit_id: true              
            },
            where:{
                purchase_id: header_id
            }
        })

        lines.map(async line => {
            const batch_name_key = `batch_name_${line.id}`;
            const expire_date_key = `expire_date_${line.id}`;
            const packing_key = `packing_${line.id}`;
            const price_key = `price_${line.id}`;

            const batch_name = formData.get(batch_name_key) as string
            const expire_date = formData.get(expire_date_key) as string
            const packing : number = parseFloat(formData.get(packing_key) as string);
            const price : number = parseFloat(formData.get(price_key) as string);

            const batch = await db.itembatches.create({
                data:{
                    name: batch_name,
                    item_id: line.item_id,
                    created_by: 3,
                    expiration_date: new Date(expire_date),
                    packing: packing,
                    price: price
                }
            })

            console.log('створилась партія', batch.id)
            
            const transaction = await db.itemtransactions.create({
                data:{
                    doc_id: document.id,
                    location_id: 87, // склад,
                    batch_id: batch.id,
                    quantity: line.quantity,
                    unit_id: line.unit_id
                }
            })

            console.log('створилась транзакція', transaction.id)

            await db.purchaselines.update({
                where: {id : line.id},
                data: {
                    item_transaction_id: transaction.id
                }
            })

            console.log('оновився рядок', batch.id)
        })        
    }
    catch(err: unknown){
        return{message :'Something went wrong!'}
    }
    redirect('/purchtable/view');
}