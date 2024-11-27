'use server'
import { db } from "@/db";
import { getFeedBatchByItemId } from './getFeedBatchByItemId'
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function feedBatch(
    formState: { message: string },
    formData: FormData) {
    try {
        console.log('feedBatch')
        console.log(formData)

        const fish_batch_id: number = parseInt(formData.get('batch_id') as string);
        const executed_by: number = parseInt(formData.get('executed_by') as string);
        const date_time = formData.get('date_time') as string;
        const location_id: number = parseInt(formData.get('location_id') as string);
        const item_id: number = parseInt(formData.get('item_id') as string);


        const times = await db.time_table.findMany();

        for (const time of times) {
            const hours = Number(time.time.split(':')[0])
            const qty: number = parseFloat(formData.get(`time_${hours}`) as string);
            const date = new Date(date_time);
            date.setHours(date.getHours() + hours);

            //ПЕРЕВІРИТИ НА ПЕРШІЙ ІТЕРАЦІЇ ЧИ ДОСТАТНЬО НА СКЛАДІ КОРМУ НА ВЕСЬ ДЕНЬ
            let qtyForWholeDay = qty;

            if (hours === 6) {
                qtyForWholeDay = 0
                times.forEach(time => {
                    const howMuchToAdd = parseFloat(formData.get(`time_${time.time.split(':')[0]}`) as string)
                    console.log('ми додали: ', howMuchToAdd)
                    qtyForWholeDay += howMuchToAdd
                })
            }

            const batches_id = await getFeedBatchByItemId(item_id, qtyForWholeDay)

            const feedDoc = await db.documents.create({
                data: {
                    location_id: location_id,
                    doc_type_id: 9,
                    date_time: date,
                    executed_by: executed_by
                }
            })

            console.log('партія корму: ', batches_id)

            let left_to_feed = qty / 1000

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
                            include: {
                                itemtransactions: true
                            },
                            where: {
                                location_id: location_id
                            },
                            orderBy: {
                                id: 'desc'
                            },
                            take: 1
                        })

                        const record = await db.generation_feed_amount.create({
                            data: {
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
                            include: {
                                itemtransactions: true
                            },
                            where: {
                                location_id: location_id
                            },
                            orderBy: {
                                id: 'desc'
                            },
                            take: 1
                        })

                        const record = await db.generation_feed_amount.create({
                            data: {
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
        };
    }
    catch (err: unknown) {
        if (err instanceof Error) {
            {
                return { message: err.message };
            }
        }
        else {
            return { message: 'Something went wrong!' }
        }
    }
    // revalidatePath(`/summary-feeding-table/day/${formData.get('date_time')}`)
    revalidatePath(`/accumulation/view`)
    revalidatePath('/leftovers/view')
    // return { message: 'успішно' }
    redirect(`/summary-feeding-table/day/${formData.get('date_time')}`);
}
