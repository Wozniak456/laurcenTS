'use server'
import { db } from "@/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from 'zod'
// import { auth } from '@/auth'
import { itembatches } from "@prisma/client";
import paths from "@/paths";

const createItemBatchSchema = z.object({
    quantity: z.number().min(1, { message: 'Введіть кількість' }),
    item_id: z.string().min(1, { message: 'Поле має бути визначено' }),
    created: z.string().min(1, { message: 'Поле має бути визначено' }),
    unit_id: z.string().min(1, { message: 'Поле має бути визначено' }),
});

interface CreateItemBatchFormState{
    errors:{
        item_id?: string[];
        quantity?: string[];
        created?: string[];
        unit_id?: string[];
        _form?: string[];
    }
}

//правильне створення партії риби
export async function createItemBatch(
    formState: CreateItemBatchFormState,
    formData: FormData
): Promise<CreateItemBatchFormState> {

    console.log('createItemBatch', formData)

    const result = createItemBatchSchema.safeParse({
        quantity: parseInt(formData.get('quantity') as string),
        item_id:  formData.get('item_id'),
        created: formData.get('created'),
        unit_id: formData.get('unit_id'),
    })

    if (!result.success){
        return{
            errors: result.error.flatten().fieldErrors
        }
    }

    // const session = await auth();

    // if(!session || !session.user){
    //     return{
    //         errors:{
    //             _form: ['You must be sign in to do this.']
    //         }
    //     }
    // }

    let batch : itembatches

    try{
        const created_by: number = parseInt(formData.get('created_by') as string);
        let created = new Date(result.data.created);

        const name = await getBatchName(parseInt(result.data.item_id), created)

        batch = await db.itembatches.create({
            data:{
                name,
                // description,
                item_id: parseInt(result.data.item_id),
                created,
                created_by
            }
        })

        await addingFishBatch(batch.id, result.data.quantity, parseInt(result.data.unit_id), created_by)

    }
    catch(err: unknown){
        if (err instanceof Error){
            return {
            errors: {
                _form: [err.message]
            }
        }
        }
        else{
            return{
                errors:{
                    _form: ['Something went wrong!']
                }
            }
        }
    }
    revalidatePath('/batches/view')
    redirect(paths.batchesItem(batch.id.toString()));
}

async function getBatchName(item_id: number, date: Date) {
    const parts = date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('.');
    return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}/C`;
}

export async function addingFishBatch(batch_id: bigint, quantity: number, unit_id: number, created_by: number){
    try{
        const location_id = 87 // склад
        const document = await db.documents.create({
            data:{
                location_id: location_id, 
                doc_type_id: 8, // Реєстрація партії
                executed_by: created_by,
            }
        })
        if (document) {
            const tran = await db.itemtransactions.create({
                data: {
                    doc_id: document.id,
                    location_id: location_id, // Встановлюємо значення за замовчуванням, якщо document.location_id === null
                    batch_id: batch_id,
                    quantity: quantity,
                    unit_id: unit_id
                }
            });

            //створюємо перше покоління
            await db.batch_generation.create({
                data:{
                    location_id: 87,
                    initial_batch_id: batch_id,
                    transaction_id: tran.id
                }
            })
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
}