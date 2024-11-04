'use server'
import { db } from "@/db";
import { getFeedBatchByItemId } from './getFeedBatchByItemId'
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function feedBatch(
    formState: {message: string}, 
    formData: FormData) {
        try{
            console.log('feedBatch')
            console.log(formData)

            const fish_batch_id: number = parseInt(formData.get('batch_id') as string);
            const executed_by: number = parseInt(formData.get('executed_by') as string);
            const date_time = formData.get('date_time') as string; 
            const location_id: number = parseInt(formData.get('location_id') as string);
            const new_item_id: number = parseInt(formData.get('item_1') as string); // нове або поточне, існує коли є перехід
            const today_item_id: number = parseInt(formData.get('item_0') as string); // попереднє, існує завжди

            let index = 0

            // спочатку на сьогодні
            while(index < 5){
                const qty: number = parseFloat(formData.get(`input_${index}`) as string);
                const time = formData.get(`time_${index}`) as string;

                const date = new Date(date_time);
                const [hours, minutes] = time?.split(':').map(Number);

                date.setUTCHours(hours, minutes, 0, 0);

                const feedDoc = await db.documents.create({
                    data:{
                        location_id: location_id,
                        doc_type_id: 9,
                        date_time: date,
                        executed_by: executed_by
                    }
                })

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
                                    quantity: -left_to_feed,
                                    unit_id: 2
                                }
                            });

                            const feedTran = await db.itemtransactions.create({
                                data: {
                                    doc_id: feedDoc.id,
                                    location_id: location_id,
                                    batch_id: batch.batch_id,
                                    quantity: left_to_feed,
                                    unit_id: 2
                                }
                            });

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

                            const record = await db.generation_feed_amount.create({
                                data:{
                                    batch_generation_id: latestGeneration?.id as bigint,
                                    feed_batch_id: batch.batch_id,
                                    amount: qty
                                }
                            })

                            console.log(`Витягнули зі складу: ${fetchTran.id} і вкинули в басейн: ${feedTran.id}`)
                            console.log(`Собівартість змінилася, ${record}`)

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

                            const record = await db.generation_feed_amount.create({
                                data:{
                                    batch_generation_id: latestGeneration?.id as bigint,
                                    feed_batch_id: batch.batch_id,
                                    amount: qty
                                }
                            })

                            console.log(`Витягнули зі складу: ${fetchTran.id} і вкинули в басейн: ${feedTran.id}`)
                            console.log(`Собівартість змінилася, ${record}`)

                            left_to_feed -= batch._sum.quantity; // Віднімаємо використану кількість
                            console.log('left_to_feed = ', left_to_feed)
                        }
                    }
                }

                if (left_to_feed > 0) {
                    console.log(`Не вдалося знайти достатню кількість корму для годування. Залишилося ${left_to_feed}.`);
                }
                
                console.log('Витягнули зі складу ')

                index ++;
            }

            // тепер попереднє (якщо є)
            if (new_item_id){
                while(index < 10){
                    const qty: number = parseFloat(formData.get(`input_${index}`) as string);
                    const time = formData.get(`time_${index}`) as string;

                    const date = new Date(date_time);
                    const [hours, minutes] = time?.split(':').map(Number);
    
                    date.setUTCHours(hours, minutes, 0, 0);

                    const feedDoc = await db.documents.create({
                        data:{
                            location_id: location_id,
                            doc_type_id: 9,
                            date_time: date,
                            executed_by: executed_by
                        }
                    })

                    const batches_id = await getFeedBatchByItemId(new_item_id, qty)

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
                                        quantity: -left_to_feed,
                                        unit_id: 2
                                    }
                                });

                                const feedTran = await db.itemtransactions.create({
                                    data: {
                                        doc_id: feedDoc.id,
                                        location_id: location_id,
                                        batch_id: batch.batch_id,
                                        quantity: left_to_feed,
                                        unit_id: 2
                                    }
                                });

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

                                const record = await db.generation_feed_amount.create({
                                    data:{
                                        batch_generation_id: latestGeneration?.id as bigint,
                                        feed_batch_id: batch.batch_id,
                                        amount: qty
                                    }
                                })

                                console.log(`Витягнули зі складу: ${fetchTran.id} і вкинули в басейн: ${feedTran.id}`)
                                console.log(`Собівартість змінилася, ${record}`)

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

                                const record = await db.generation_feed_amount.create({
                                    data:{
                                        batch_generation_id: latestGeneration?.id as bigint,
                                        feed_batch_id: batch.batch_id,
                                        amount: qty
                                    }
                                })

                                console.log(`Витягнули зі складу: ${fetchTran.id} і вкинули в басейн: ${feedTran.id}`)
                                console.log(`Собівартість змінилася, ${record}`)
                                left_to_feed -= batch._sum.quantity; // Віднімаємо використану кількість
                                console.log('left_to_feed = ', left_to_feed)
                        }
                    }
                }

                if (left_to_feed > 0) {
                    console.log(`Не вдалося знайти достатню кількість корму для годування. Залишилося ${left_to_feed}.`);
                }
                
                console.log('Витягнули зі складу ')

                index ++;
                }
            }
                       
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
    revalidatePath(`/summary-feeding-table/day/${formData.get('date_time')}`)
    revalidatePath(`/accumulation/view`)
    revalidatePath('/leftovers/view')
    redirect(`/summary-feeding-table/day/${formData.get('date_time')}`);
    }