'use server'
import { db } from "@/db";
import { getFeedBatchByItemId } from './getFeedBatchByItemId'
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function onefeeding(
    formState: {message: string}, 
    formData: FormData) {
        try{
            console.log('onefeeding')
            console.log(formData)

            const executed_by: number = parseInt(formData.get('executed_by') as string);
            const date_time = formData.get('date_time') as string; 
            const location_id: number = parseInt(formData.get('location_id') as string);
            const today_item_id: number = parseInt(formData.get('item_0') as string); // попереднє, існує завжди
            const qty: number = parseFloat(formData.get('qty') as string);

            const date = new Date(date_time);

            const feedDoc = await db.documents.create({
                data:{
                    location_id: location_id,
                    doc_type_id: 9,
                    date_time: date,
                    executed_by: executed_by
                }
            })

            console.log('today_item_id', today_item_id)
            
            const batches_id = await getFeedBatchByItemId(today_item_id, qty)

            console.log('партія корму: ', batches_id)

            let left_to_feed = qty / 1000

            // console.log(left_to_feed)
            for (const batch of batches_id) {
                if (batch._sum.quantity) {

                    // Якщо вистачає корму в першій партії
                    if (batch._sum.quantity >= left_to_feed) {
                        const fetchTran = await db.itemtransactions.create({
                            data: {
                                doc_id: feedDoc.id,
                                location_id: 87,
                                batch_id: batch.batch_id,
                                quantity: - left_to_feed,
                                unit_id: 2
                            }
                        });

                        console.log('Витягнули зі складу: ', fetchTran)

                        const feedTran = await db.itemtransactions.create({
                            data: {
                                doc_id: feedDoc.id,
                                location_id: location_id,
                                batch_id: batch.batch_id,
                                quantity: left_to_feed,
                                unit_id: 2
                            }
                        });

                        console.log('Вкинули в басейн: ', feedTran)

                        //Знайти останню собівартість і останнє покоління

                        const latestGeneration = await db.batch_generation.findFirst({
                            include:{
                                itemtransactions: true
                            },
                            where:{
                                location_id: location_id
                            },
                            orderBy: {
                                id: 'desc'
                            },
                            take: 1
                        })

                        console.log('Остання собівартість: ', latestGeneration)

                        console.log(`Витягнули зі складу: ${fetchTran.id} і вкинули в басейн: ${feedTran.id}`)
                        console.log(`Собівартість змінилася, ${qty}`)

                        left_to_feed = 0;
                        break; // Виходимо з циклу, бо всю необхідну кількість взято
                    } else {
                        // Якщо потрібно використовувати ще одну партію
                        const fetchTran = await db.itemtransactions.create({
                            data: {
                                doc_id: feedDoc.id,
                                location_id: 87,
                                batch_id: batch.batch_id,
                                quantity: - batch._sum.quantity,
                                unit_id: 2
                            }
                        });

                        const feedTran = await db.itemtransactions.create({
                            data: {
                                doc_id: feedDoc.id,
                                location_id: location_id,
                                batch_id: batch.batch_id,
                                quantity: batch._sum.quantity,
                                unit_id: 2
                            }
                        });

                        console.log(`Витягнули зі складу: ${fetchTran.id} і вкинули в басейн: ${feedTran.id}`)
                        left_to_feed -= batch._sum.quantity; // Віднімаємо використану кількість
                        console.log('left_to_feed = ', left_to_feed)
                    }
                }
            }

            if (left_to_feed > 0) {
                console.log(`Не вдалося знайти достатню кількість корму для годування. Залишилося ${left_to_feed}.`);
            }
            
            console.log('кінець oneFeeding ')      
        }
        catch(err: unknown){
            if(err instanceof Error){
                {
                    return {message: err.message};
                }
            }
            else{
                return{message :'Something went wrong!'}
            }
        }
    // return { message: `успішно` };
    // revalidatePath(`/summary-feeding-table/day/${formData.get('date_time')}`)
    // revalidatePath(`/accumulation/view`)
    // revalidatePath('/leftovers/view')
    // redirect(`/summary-feeding-table/day/${formData.get('date_time')}`);
    }