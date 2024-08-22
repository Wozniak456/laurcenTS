'use server'
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { getFeedAmountsAndNames } from './getFeedAmountsAndNames'
import { createCalcTable } from './createCalcTable'
import { updatePrevPool } from './updatePrevPool'

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
        let location_id_from : number = parseInt(formData.get('location_id_from') as string);
      
        const batch_id_from: number = parseInt(formData.get('batch_id') as string);

        const fetching_quantity: number = parseInt(formData.get('fetch_amount') as string);

        const fish_qty_in_location_from : number = parseInt(formData.get('fish_qty_in_location_from') as string);

        const average_weight_str = formData.get('average_fish_mass') as string;
        const average_weight = parseFloat(average_weight_str.replace(',', '.'));

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

        if (!fetchDoc) {
            throw new Error('Помилка при створенні документа вилову');
        }

        console.log(`\n документ вилову для ${location_id_from}`, fetchDoc.id)

        // транзакція для витягування з попереднього басейна stocking_quantity
    
        const fetchTran = await db.itemtransactions.create({
            data: {
                doc_id: fetchDoc.id,
                location_id: location_id_from,
                batch_id: batch_id_from,
                quantity: - fetching_quantity,
                unit_id: 1,
            }
        });

        if (!fetchTran) {
            throw new Error('Помилка при створенні транзакції для витягування з попереднього басейна');
        }

        console.log(` Витягуємо з попереднього. Tran: `, fetchTran)

        //знайти дані про останнє покоління з попередньої локації

        const prev_generation = await db.batch_generation.findFirst({
            where:{
                location_id: location_id_from
            },
            orderBy:{
                id: 'desc'
            },
            take: 1
        })

        console.log('prev_generation', prev_generation)

        const first_parent_generation = prev_generation

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

        // документ зариблення попереднього басейна після вилову
    
        // const stockDoc = await db.documents.create({
        //     data: {
        //         location_id: location_id_from, // Отримуємо id локації
        //         doc_type_id: 1,
        //         date_time: new Date(),
        //         executed_by: executed_by,
        //         comments: comments,
        //         parent_document: fetchDoc.id
        //     }
        // });

        // console.log('документ зариблення попереднього басейна після вилову: ', stockDoc.id)

        // if (!fetchDoc) {
        //     throw new Error('Помилка при створенні документа зариблення');
        // }

        // const stock = await db.stocking.create({
        //     data: {
        //         doc_id: stockDoc.id,
        //         average_weight: average_weight
        //     }
        // });

        // if (!stock) {
        //     throw new Error('Помилка при створенні запису зариблення');
        // }

        // console.log('Створюємо stocking: ', stock.id)

        
        //ТЕПЕР ТРЕБА ПІДІГНАТИ ПІД createCalcTable


        formData.set('fish_amount', String(fish_qty_in_location_from - fetching_quantity));
        formData.set('location_id_to', String(location_id_from));
        // formData.set('parent_doc', String(stockDoc.id));


        await createCalcTable(formState, formData)

        console.log('Створили calc table')

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