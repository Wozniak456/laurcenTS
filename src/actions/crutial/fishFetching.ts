'use server'
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { getFeedAmountsAndNames } from './getFeedAmountsAndNames'
import { createCalcTable } from './createCalcTable'
import { updatePrevPool } from './updatePrevPool'
import { FetchingReasons } from "@/types/fetching-reasons";
import { stockPool } from "@/actions";

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
        const location_id_to: number = parseInt(formData.get('location_id') as string);
        const more500_fishing_amount: number = parseInt(formData.get('more500_fishing_amount') as string);
        const more500_fishing_total_weight: number = parseFloat(formData.get('more500_fishing_total_weight') as string);
        const less500_fishing_amount: number = parseInt(formData.get('less500_fishing_amount') as string);
        const less500_fishing_total_weight: number = parseFloat(formData.get('less500_fishing_total_weight') as string);
        const week_num: number = parseFloat(formData.get('week_num') as string);
        const average_fish_mass : number = parseFloat(formData.get('average_fish_mass') as string);

        const executed_by = 3 
        const comments: string = formData.get('comments') as string;

        
        // документ вилову
    
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

        console.log(`\n документ вилову для ${location_id_from}`, fetchDoc)

        // транзакція для витягування з попереднього басейна stocking_quantity
    
        if (commercial_fishing_amount){
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
        }

        console.log(`\n commercial успішно`)

        if (sorted_fishing_amount){
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
        }

        
        console.log(`\n sortedFetching успішно`)

        if(growout_fishing_amount){
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

            // зариблюємо басейн з причиною доріст

            // знаходимо останнє зариблення для нового басейна
            const last_stocking = await db.itemtransactions.findFirst({
                where:{
                    location_id: location_id_to,
                    documents:{
                        doc_type_id: 1
                    }
                },
                orderBy:{
                    id: 'desc'
                }
            })

            formData.delete('location_id_to')
            formData.set('location_id_to', String(location_id_to))
            formData.set('fish_amount', String(growout_fishing_amount))

            formData.set('batch_id_to', String(last_stocking?.batch_id))
            formData.set('fish_amount_in_location_to', String(last_stocking?.quantity))
            formData.delete('average_fish_mass')
            formData.set('average_fish_mass', String(growout_fishing_total_weight / growout_fishing_amount))
            await stockPool(formState, formData)
            
        }

        if(more500_fishing_amount){
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
        }

        if(less500_fishing_amount){
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
        }

        console.log('все успішно')


        const prev_generation = await db.batch_generation.findFirst({
            where:{
                location_id: location_id_from
            },
            orderBy:{
                id: 'desc'
            },
            take: 1
        })

        const first_parent_generation = prev_generation
        const fetching_quantity = 
            (isNaN(commercial_fishing_amount) ? 0 : commercial_fishing_amount) + 
            (isNaN(sorted_fishing_amount) ? 0 : sorted_fishing_amount) + 
            (isNaN(growout_fishing_amount) ? 0 : growout_fishing_amount) + 
            (isNaN(more500_fishing_amount) ? 0 : more500_fishing_amount) + 
            (isNaN(less500_fishing_amount) ? 0 : less500_fishing_amount);

        if (first_parent_generation){
            // знаходимо скільки зїв перший предок
            const grouped_first_ancestor = await getFeedAmountsAndNames(first_parent_generation?.id);
            console.log('grouped_first_ancestor', grouped_first_ancestor);

            //знаходимо який відсоток ми переміщаємо
            
            const NEW_fish_qty_in_location_from = fish_qty_in_location_from - (isNaN(growout_fishing_amount) ? 0 : growout_fishing_amount);

            console.log('stocking_quantity', fetching_quantity, 'NEW_fish_qty_in_location_from', NEW_fish_qty_in_location_from)
            const part = (fetching_quantity - (isNaN(growout_fishing_amount) ? 0 : growout_fishing_amount)) / NEW_fish_qty_in_location_from
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
        formData.set('average_fish_mass', String(average_fish_mass))
      
        
        console.log('СКІЛЬКИ МИ БУДЕМО ВКИДАТИ В СТАРИЙ БАСЕЙН', fish_qty_in_location_from - fetching_quantity)

        const info : updatePrevPoolProps = {
            formData: formData,
            formState: formState,
            info:{
                amount_in_pool: fish_qty_in_location_from - fetching_quantity,
                divDocId: fetchDoc.id,
            }
        }

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
    revalidatePath('/fetching/view')
}