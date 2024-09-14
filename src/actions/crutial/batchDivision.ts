'use server'
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { stockPool } from "./stockPool";
import { updatePrevPool } from './updatePrevPool'


type updatePrevPoolProps = {
    formData: FormData,
    formState: { message: string; } | undefined,
    info : { 
        amount_in_pool: number,
        divDocId: bigint
    }
}

export async function batchDivision(
    formState: { message: string } | undefined,
    formData: FormData
): Promise<{ message: string } | undefined> {
    try {
        console.log('ми в batchDivision')
        console.log(formData)

        const location_from : number = parseInt(formData.get('location_id_from') as string);
        const batch_id_from : number = parseInt(formData.get('batch_id_from') as string);
        const fish_qty_in_location_from : number = parseInt(formData.get('fish_qty_in_location_from') as string);
        // const average_fish_mass : number = parseFloat(formData.get('average_fish_mass') as string);
        
        let sum = 0
        let index1 = 0
        while(true){
            const location_id_to : number = parseInt(formData.get(`location_id_to_${index1}`) as string);
            const stocking_fish_amount : number = parseInt(formData.get(`stocking_fish_amount_${index1}`) as string);
            
            if(!location_id_to){
                break;
            }

            sum += stocking_fish_amount

            index1++
        }

        console.log('fish_qty_in_location_from', fish_qty_in_location_from, 'sum', sum) 

        if(isNaN(fish_qty_in_location_from) || fish_qty_in_location_from < sum){
            throw new Error('У басейні немає стільки риби');
        }

        // створюємо документ розділення
        const divDoc = await db.documents.create({
            data:{
                location_id: location_from,
                doc_type_id: 2, // розділення
                date_time: new Date(),
                executed_by: 3
            }
        })

        console.log(`документ розділення для локації ${location_from}`, divDoc)

        //рахуємо скільки ми хочемо витягнути

        let index0 = 0
        while(true){
            const location_id_to : number = parseInt(formData.get(`location_id_to_${index0}`) as string);
            const stocking_fish_amount : number = parseInt(formData.get(`stocking_fish_amount_${index0}`) as string);

            if(!location_id_to){
                break;
            }
            
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

            //якщо у басейні було ненульове зариблення
            let tran
            if (last_stocking && last_stocking.quantity > 0){

                // створюємо транзакцію витягування риби з нового басейну, якщо там щось є
                tran = await db.itemtransactions.create({
                    data:{
                        doc_id: divDoc.id,
                        location_id: location_id_to,
                        batch_id: last_stocking.batch_id,
                        quantity: - last_stocking.quantity,
                        unit_id: 1
                    }
                })
             
                if (!tran) {
                    throw new Error('Помилка при створенні транзакції витягування риби з нового басейну');
                }
                console.log(`транзакція витягування риби з нового басейну ${location_id_to}`, tran)
            }

            //зариблення. підганяємо вхідні ідентифікатори для функції stockPool 

            formData.delete(`location_id_to_${index0}`);
            formData.delete(`stocking_fish_amount_${index0}`);
            formData.delete(`batch_id_from`);

            formData.set('location_id_to', String(location_id_to)) // новий басейн
            formData.set('fish_amount', String(stocking_fish_amount)) // скільки зариблюємо
            formData.set('batch_id', String(batch_id_from)) //партія з попереднього

            formData.set('div_doc_id', String(batch_id_from)) //партія з попереднього
            
            if(last_stocking){
                if (last_stocking.quantity >= stocking_fish_amount){
                    console.log('у басейні більше, ніж прийшло. ', last_stocking.quantity, '>=', stocking_fish_amount)
                    formData.set('batch_id_to', String(last_stocking?.batch_id)) //партія з нового
                }
                else{
                    console.log('у басейні менше, ніж прийшло. ', last_stocking.quantity, '<', stocking_fish_amount)
                    formData.set('batch_id_to', String(batch_id_from)) //партія з старого
                }
            }

            formData.set('fish_amount_in_location_to', String(last_stocking?.quantity)) //скільки у новому басейні

            await stockPool(formState, formData)

            index0 ++;            
        }

        const info : updatePrevPoolProps = {
            formData: formData,
            formState: formState,
            info:{
                amount_in_pool: fish_qty_in_location_from - sum,
                divDocId: divDoc.id,
            }
        }
        console.log('СКІЛЬКИ МИ БУДЕМО ВКИДАТИ В СТАРИЙ БАСЕЙН', fish_qty_in_location_from - sum)


        console.log('що ми передаємо в updatePrevPool', info)
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
    revalidatePath('/summary-feeding-table/week')
    revalidatePath(`/accumulation/view`)
    // revalidatePath('/leftovers/view')
    redirect('/pool-managing/view')
}