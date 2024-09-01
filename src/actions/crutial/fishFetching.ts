'use server'
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { getFeedAmountsAndNames } from './getFeedAmountsAndNames'
import { createCalcTable } from './createCalcTable'
import { updatePrevPool } from './updatePrevPool'
import { FetchingReasons } from "@/types/fetching-reasons";

type updatePrevPoolProps = {
    formData: FormData,
    formState: { message: string; } | undefined,
    info : { 
        amount_in_pool: number,
        divDocId: bigint
    }
}

export async function fishFetching(
    formState: { message: string } | undefined,
    formData: FormData
): Promise<{ message: string } | undefined> {
    try {
        console.log('fishFetching')
        console.log(formData)

        const location_id_from: number = parseInt(formData.get('location_id_from') as string);
        const batch_id_from: number = parseInt(formData.get('batch_id') as string);
        const fish_qty_in_location_from: number = parseInt(formData.get('fish_qty_in_location_from') as string);
        const commercial_fishing_amount: number = parseInt(formData.get('commercial_fishing_amount') as string);
        const commercial_fishing_total_weight: number = parseFloat(formData.get('commercial_fishing_total_weight') as string);
        const sorted_fishing_amount: number = parseInt(formData.get('sorted_fishing_amount') as string);
        const sorted_fishing_total_weight: number = parseFloat(formData.get('sorted_fishing_total_weight') as string);
        const growout_fishing_amount: number = parseInt(formData.get('growout_fishing_amount') as string);
        const growout_fishing_total_weight: number = parseFloat(formData.get('growout_fishing_total_weight') as string);
        const location_id: number = parseInt(formData.get('location_id') as string);
        const more500_fishing_amount: number = parseInt(formData.get('more500_fishing_amount') as string);
        const more500_fishing_total_weight: number = parseFloat(formData.get('more500_fishing_total_weight') as string);
        const less500_fishing_amount: number = parseInt(formData.get('less500_fishing_amount') as string);
        const less500_fishing_total_weight: number = parseFloat(formData.get('less500_fishing_total_weight') as string);
        const week_num: number = parseFloat(formData.get('week_num') as string);

        const executed_by = 3 
        const comments: string = formData.get('comments') as string;

        
        // // документ вилову
    
        const fetchDoc = await db.documents.create({
            data: {
                location_id: location_id_from, // Отримуємо id локації
                doc_type_id: 13,
                date_time: new Date(),
                executed_by: executed_by,
                comments: comments
            }
        });

        

        // console.log('fetching record', fetching)

        if (!fetchDoc) {
            throw new Error('Помилка при створенні документа вилову');
        }

        console.log(`\n документ вилову для ${location_id_from}`, fetchDoc.id)

        // транзакція для витягування з попереднього басейна stocking_quantity
    
        const commercialfetchTran = await db.itemtransactions.create({
            data: {
                doc_id: fetchDoc.id,
                location_id: location_id_from,
                batch_id: batch_id_from,
                quantity: - commercial_fishing_amount,
                unit_id: 1,
            }
        });

        const commercialpushTran = await db.itemtransactions.create({
            data: {
                doc_id: fetchDoc.id,
                location_id: 88,
                batch_id: batch_id_from,
                quantity: commercial_fishing_amount,
                unit_id: 1,
                parent_transaction: commercialfetchTran.id
            }
        });

        const commercialFetching = await db.fetching.create({
            data:{
                tran_id: commercialpushTran.id,
                fetching_reason: FetchingReasons.CommercialFishing,
                total_weight: commercial_fishing_total_weight,
                weekNumber: week_num
            }
        })

        const sortedfetchTran = await db.itemtransactions.create({
            data: {
                doc_id: fetchDoc.id,
                location_id: location_id_from,
                batch_id: batch_id_from,
                quantity: - sorted_fishing_amount,
                unit_id: 1,
            }
        });

        const sortedpushTran = await db.itemtransactions.create({
            data: {
                doc_id: fetchDoc.id,
                location_id: 88,
                batch_id: batch_id_from,
                quantity: sorted_fishing_amount,
                unit_id: 1,
                parent_transaction: sortedfetchTran.id
            }
        });

        const sortedFetching = await db.fetching.create({
            data:{
                tran_id: sortedpushTran.id,
                fetching_reason: FetchingReasons.Sorted,
                total_weight: sorted_fishing_total_weight,
                weekNumber: week_num
            }
        })

        const growoutfetchTran = await db.itemtransactions.create({
            data: {
                doc_id: fetchDoc.id,
                location_id: location_id_from,
                batch_id: batch_id_from,
                quantity: - growout_fishing_amount,
                unit_id: 1,
            }
        });

        const growoutpushTran = await db.itemtransactions.create({
            data: {
                doc_id: fetchDoc.id,
                location_id: 88,
                batch_id: batch_id_from,
                quantity: growout_fishing_amount,
                unit_id: 1,
                parent_transaction: growoutfetchTran.id
            }
        });

        const GrowOutFetching = await db.fetching.create({
            data:{
                tran_id: growoutpushTran.id,
                fetching_reason: FetchingReasons.GrowOut,
                total_weight: growout_fishing_total_weight,
                weekNumber: week_num
            }
        })

        const more500fetchTran = await db.itemtransactions.create({
            data: {
                doc_id: fetchDoc.id,
                location_id: location_id_from,
                batch_id: batch_id_from,
                quantity: - more500_fishing_amount,
                unit_id: 1,
            }
        });

        const more500pushTran = await db.itemtransactions.create({
            data: {
                doc_id: fetchDoc.id,
                location_id: 88,
                batch_id: batch_id_from,
                quantity: more500_fishing_amount,
                unit_id: 1,
                parent_transaction: more500fetchTran.id
            }
        });

        const MoreThan500Fetching = await db.fetching.create({
            data:{
                tran_id: more500pushTran.id,
                fetching_reason: FetchingReasons.MoreThan500,
                total_weight: more500_fishing_total_weight,
                weekNumber: week_num
            }
        })

        const less500fetchTran = await db.itemtransactions.create({
            data: {
                doc_id: fetchDoc.id,
                location_id: location_id_from,
                batch_id: batch_id_from,
                quantity: - less500_fishing_amount,
                unit_id: 1,
            }
        });

        const less500pullTran = await db.itemtransactions.create({
            data: {
                doc_id: fetchDoc.id,
                location_id: 88,
                batch_id: batch_id_from,
                quantity: less500_fishing_amount,
                unit_id: 1,
                parent_transaction: less500fetchTran.id
            }
        });

        const LessThan500Fetching = await db.fetching.create({
            data:{
                tran_id: less500pullTran.id,
                fetching_reason: FetchingReasons.LessThan500,
                total_weight: less500_fishing_total_weight,
                weekNumber: week_num
            }
        })

        // if (!fetchTran) {
        //     throw new Error('Помилка при створенні транзакції для витягування з попереднього басейна');
        // }

        // console.log(` Витягуємо з попереднього. Tran: `, fetchTran)

        // console.log(` Ікидаємо на кінцевий склад. Tran: `, pullTran)

        // //знайти дані про останнє покоління з попередньої локації

        const prev_generation = await db.batch_generation.findFirst({
            where:{
                location_id: location_id_from
            },
            orderBy:{
                id: 'desc'
            },
            take: 1
        })

        // console.log('prev_generation', prev_generation)

        const first_parent_generation = prev_generation
        const fetching_quantity = commercial_fishing_amount + sorted_fishing_amount + growout_fishing_amount + more500_fishing_amount + less500_fishing_amount

        if (first_parent_generation){
            // знаходимо скільки зїв перший предок
            const grouped_first_ancestor = await getFeedAmountsAndNames(first_parent_generation?.id);
            console.log('grouped_first_ancestor', grouped_first_ancestor);

            //знаходимо який відсоток ми переміщаємо
            
            console.log('stocking_quantity', fetching_quantity, 'fish_qty_in_location_from', fish_qty_in_location_from)
            const part = fetching_quantity / fish_qty_in_location_from
            console.log('переміщаємо :', part, ' %')

            //додаємо записи витягування частини зїдженого з попереднього басейна
            grouped_first_ancestor.map(async record => {
                const fetch_record = await db.generation_feed_amount.create({
                    data:{
                        batch_generation_id: record.batch_generation_id,
                        amount: - record.total_amount * part,
                        feed_batch_id: record.feed_batch_id
                    }
                })

                console.log(`витягнули частку зЇдженого: ${fetch_record.feed_batch_id}: ${fetch_record.amount}`)
            })
        }
        
        //ТЕПЕР ТРЕБА ПІДІГНАТИ ПІД createCalcTable

        formData.set('fish_amount', String(fish_qty_in_location_from - fetching_quantity));
        formData.set('location_id_to', String(location_id_from));
      
        const info : updatePrevPoolProps = {
            formData: formData,
            formState: formState,
            info:{
                amount_in_pool: fish_qty_in_location_from - fetching_quantity,
                divDocId: fetchDoc.id,
            }
        }
        console.log('СКІЛЬКИ МИ БУДЕМО ВКИДАТИ В СТАРИЙ БАСЕЙН', fish_qty_in_location_from - fetching_quantity)

        await updatePrevPool(info)
    } catch (err: unknown) { 
        if (err instanceof Error) {
            if (err.message.includes('Foreign key constraint failed')) {
                return {
                    message: 'There is no any item or purchaseTitle with such id.'
                };
            } else {
                return {
                    message: err.message
                };
            }
        } else {
            return { message: 'Something went wrong!' };
        }
    }

    revalidatePath('/pool-managing/view')
    revalidatePath('/accumulation/view')
    revalidatePath('/summary-feeding-table/week')
}