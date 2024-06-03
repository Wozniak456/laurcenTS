'use server'
import { db } from "@/db";
import { caviarRegistering } from "@/db/functions"
import { calculation_table } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setTransitionDayForLocation } from '@/actions/stocking'

export async function editProdArea(id: number, description: string | null ) {
    await db.productionareas.update({
        where: {id},
        data: {description}
    });
    redirect(`/prod-areas/${id}`)
}

export async function editPurchline(
    formState: {message: string}, 
    formData: FormData,
    ){
        try{
            console.log('editPurchline', formData)
            const purchase_id: number = parseInt(formData.get('purchase_id') as string);
            const item_id: number = parseInt(formData.get('item_id') as string);
            const quantity: number = parseInt(formData.get('quantity') as string);
            const unit_id: number = parseInt(formData.get('unit_id') as string);
            const id: number = parseInt(formData.get('purch_line_id') as string);
                        
            await db.purchaselines.update({
                where: {id},
                data: {
                    purchase_id,
                    item_id,
                    quantity,
                    unit_id
                }
            });
        }
        catch(err: unknown){
            return{message :'Something went wrong!'}
        }
    redirect('/purchtable/view');
}



export async function editProdLine(id: number, description: string | null ) {
    await db.productionlines.update({
        where: {id},
        data: {description}
    });
    redirect(`/prod-lines/${id}`)
}

// export async function editPurchtableRecord(id: number, vendor_id: number, vendor_doc_number: string ) {
//     await db.purchtable.update({
//         where: {id},
//         data: {
//             vendor_id,
//             vendor_doc_number
//         }
//     });
//     redirect(`/purchtable/${id}`)
// }

export async function editPurchtable(
    formState: {message: string}, 
    formData: FormData,
    ){
        try{
            console.log('editPurchtable', formData)
            const id: number = parseInt(formData.get('header_id') as string);

            const delivery_date_str = formData.get('delivery_date') as string;
            const date_time: Date | undefined = delivery_date_str ? new Date(delivery_date_str) : undefined;

            const vendor_id: number = parseInt(formData.get('vendor_id') as string);
            const vendor_doc_number = formData.get('vendor_doc_id') as string;
            
            const header = await db.purchtable.update({
                where: {id},
                data: {
                    date_time,
                    vendor_id,
                    vendor_doc_number
                }
            });
        }
        catch(err: unknown){
            console.log('error')
            return{message :'Something went wrong!'}
        }
    redirect('/purchtable/view');
}


// export async function editItemBatch(
//     id: bigint,
//     description: string | null,
//     item_id: number,
//     created: Date | null,
//     created_by: number,
//     endpoint: string
//   ) {
//     await db.itembatches.update({
//       where: { id },
//       data: {
//         description,
//         item_id,
//         created,
//         created_by
//       }
//     });
//     redirect(`/${endpoint}/${id}`);
//   }

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
        return{message :'Оновлено!'}
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
    //redirect('/purchtable/view');
}

export async function editPool(
    id: number,
    description: string | null,
    cleaning_frequency: number | null,
    water_temperature: number | null,
    x_location: number | null,
    y_location: number | null,
    pool_height: number | null,
    pool_width: number | null,
    pool_length: number | null
  ) {
    await db.pools.update({
      where: { id },
      data: {
        description,
        cleaning_frequency,
        water_temperature,
        x_location,
        y_location,
        pool_height,
        pool_width,
        pool_length
      }
    });
    redirect(`/pools/${id}`);
  }

export async function deleteProdArea(id: number) {
    await db.productionareas.delete({
        where: {id}
    });
    redirect('/prod-areas/view')
}

export async function deleteProdLine(id: number) {
    await db.productionlines.delete({
        where: {id}
    });
    redirect('/prod-lines/view')
}

export async function deletePool(id: number) {
    await db.locations.deleteMany({
        where: {pool_id : id}
    });
    await db.pools.delete({
        where: {id}
    });
    redirect('/pools/view')
}

export async function deletePurchLine(id: number) {
    console.log(id)
    await db.purchaselines.delete({
        where: { id }
    });
    redirect(`/purchtable/view`);
}

export async function deleteItemBatch(
    formState: {message: string}, 
    formData: FormData) {
        try{
            console.log('ми в deleteItemBatch')
            console.log(formData)
            const id : number = parseInt(formData.get('batch_id') as string);
            const create_doc_id : number = parseInt(formData.get('create_doc_id') as string);

            const documents = await db.itemtransactions.findMany({
                where:{
                    documents:{
                        doc_type_id: {
                            not: 8 // реєстрація партії
                        }
                    },
                    batch_id: id
                }
            })

            console.log(documents)

            if (documents.length > 0){
                throw new Error('Ця партія задіяна в інших повязаних транзакціях.');
            }
            
            await db.itemtransactions.deleteMany({
                where: {
                    doc_id: create_doc_id // Assuming create_doc_id is the unique identifier for the item transaction
                }
            })

            await db.documents.delete({
                where: {
                    id: create_doc_id // Assuming create_doc_id is the unique identifier for the item transaction
                }
            })

            await db.itembatches.delete({
                where: {id}
            });

            return{message :'Партію видалено!'}
        }
        catch(err: unknown){
            console.log('ми в catch Error deleteItemBatch')
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

        // redirect('/batches/view');
}

export async function deleteOneCalculation(id: number) {
    const docId = await db.calculation_table.findUnique({
        select: {
            doc_id: true
        },
        where: {
            id: id
        }
        }).then(result => result?.doc_id);
        
        if (docId) {
            await db.calculation_table.deleteMany({
                where: {
                    doc_id: docId
                }
            });
        }
        
    redirect(`/calculation/view`)
}

export async function deletePurchRecord(id: bigint) {
    await db.purchaselines.deleteMany({
        where:{
            purchase_id: id
        }
    })

    await db.purchtable.delete({
        where: {id}
    });
    redirect(`/purchtable/view`)
}


export async function registerGoodsInProduction(
    formState: {message: string}, 
    formData: FormData){
        console.log('registerGoodsInProduction', formData)
    try{
        const header_id : number = parseInt(formData.get('header_id') as string);
        
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

export async function createProdArea(
    formState: {message: string}, 
    formData: FormData){
    try{
        const name = formData.get('name');
        const description = formData.get('description') as string;

        if(typeof name !== 'string' || name.length < 1){
            return{
                message: 'Name must be longer'
            };
        }

        await db.productionareas.create({
            data:{
                name,
                description 
            }
        })
    }
    catch(err: unknown){
        if(err instanceof Error){
            if (err.message.includes('Unique constraint failed')) {
                return {
                    message: 'A production area with this name already exists.'
                };
            } else {
                return {
                    message: err.message
                };
            }
        }
        else{
            return{message :'Something went wrong!'}
        }
    }
    redirect('/prod-areas/view');
}

export async function createCalcTable(
    formState: {message: string} | undefined, 
    formData: FormData){
        try{
            // console.log('Ми в createCalcTable')
            // console.log(formData)
            const fish_amount: number = parseInt(formData.get('fish_amount') as string);  // скільки зариблюємо
            const average_fish_mass: number = parseFloat(formData.get('average_fish_mass') as string);
            const percentage = 0;//number = parseFloat(formData.get('percentage') as string);
            const location_id_to: number = parseInt(formData.get('location_id_to') as string); 
            const parent_doc: number = parseInt(formData.get('parent_doc') as string)

            if(typeof(fish_amount) !== 'number'){
                return {
                    message: 'Поле "Кількість особин" це число.'
                };
            }
            
            // документ створення калькуляції

            const document_for_location_to = await db.documents.create({
                data:{
                    doc_type_id: 7, //просто виклик калькуляції
                    location_id: location_id_to,
                    executed_by: 3,
                    parent_document: parent_doc
                }
            })

            if (!document_for_location_to) {
                throw new Error('Помилка при створенні документа калькуляції');
            }
            
            console.log('створено документ з doc_type_id: 7', document_for_location_to.id)

            const doc_id = document_for_location_to.id

            if (average_fish_mass < 25){
                const table = await getTableByValues(fish_amount, average_fish_mass, percentage, doc_id)
                if (!table) {
                    throw new Error('Помилка при створенні розрахунку');
                }
                setTransitionDayForLocation(location_id_to)
            }
            else{
                const table = await getTableByValuesOver25(fish_amount, average_fish_mass, percentage, doc_id)
                if (!table) {
                    throw new Error('Помилка при створенні розрахунку');
                }
                setTransitionDayForLocation(location_id_to)
            }
            
        }
        catch(err: unknown){
            return{message :'Усі поля мають бути заповнені числами!'}
        }
}



export async function createProdLine(
    formState: {message: string}, 
    formData: FormData){
        try{
            const name = formData.get('name') ;
            const description = formData.get('description') as string;
            const prod_area_id: number = parseInt(formData.get('prod_area_id') as string);

            const area = await db.productionareas.findFirst({
                where: {
                    id: prod_area_id
                }
            })

            if(typeof name !== 'string' || name.length < 1){
                return{
                    message: 'Name must be longer'
                };
            }

            if(area){
                const prod_area_id = area.id

                await db.productionlines.create({
                    data:{
                        prod_area_id,
                        name,
                        description 
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
    redirect('/prod-lines/view');
}


export async function createSalesTableRecord(
    formState: {message: string}, 
    formData: FormData,
    ){ 
        try{
            // console.log('ми в createSalesTableRecord')
            console.log(formData)
            const dateTimeString = formData.get('delivery_date') as string;
            const customer_id: number = parseInt(formData.get('customer_id') as string);

            const dateTime = new Date(dateTimeString);
                   
            const salesRecord = await db.salestable.create({
                data:{
                    date_time: dateTime,
                    customer_id: customer_id
                }
            })

            if(!salesRecord){
                throw new Error('Помилка')
            }
            return{message: `Видаткову накладну №${salesRecord.id} успішно додано`}
            
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

export async function createSalesLineRecord(
    formState: {message: string}, 
    formData: FormData,
    ){ 
        try{
            console.log('ми в createSalesLineRecord')
            console.log(formData)

            const item_id: number = parseInt(formData.get('item_id') as string);
            const quantity: number = parseInt(formData.get('quantity') as string);
            const unit_id: number = parseInt(formData.get('unit_id') as string);
            const header_id: number = parseInt(formData.get('header_id') as string);
                   
            const salesLineRecord = await db.saleslines.create({
                data:{
                    salestable_id: header_id,
                    item_id: item_id,
                    quantity: quantity,
                    unit_id: unit_id
                }
            })

            if(!salesLineRecord){
                throw new Error('Помилка')
            }

            return{message: `Новий рядок видаткової накладної №${header_id} успішно додано`}
            
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

export async function createPurchTableRecord(
    formState: {message: string}, 
    formData: FormData,
    ){ 
        try{
            const createdString = formData.get('delivery_date') as string;
            const vendor_id: number = parseInt(formData.get('vendor_id') as string);
            const vendor_doc_number = formData.get('vendor_doc_id') as string;

            const date_time = new Date(createdString);
                   
            
            const purchRecord = await db.purchtable.create({
                data:{
                    date_time,
                    vendor_id,
                    vendor_doc_number
                }
            })
            
        }
        catch(err: unknown){
            return{message :'Something went wrong!'}
        }

    redirect('/purchtable/view');
}

async function getBatchName(item_id: number, date: Date) {
    const parts = date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('.');
    return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}/C`;
}


export async function updateSalesTable(
    formState: { message: string } | undefined,
    formData: FormData
){
    try{}
    catch(err: unknown){
        if(err instanceof Error){
            return {
                message: err.message
            };
        }
        else{
            return{message :'Something went wrong!'}
        }
    }
    redirect('/realization/headers/view');
}

export async function updateSalesLines(
    formState: { message: string } | undefined,
    formData: FormData
){
    const header_id : number = parseInt(formData.get('header_id') as string);
    try{}
    catch(err: unknown){
        if(err instanceof Error){
            return {
                message: err.message
            };
        }
        else{
            return{message :'Something went wrong!'}
        }
    }
    redirect(`/realization/headers/${header_id}`);
}

export async function updateBatches(
    formState: { message: string } | undefined,
    formData: FormData
){
    try{}
    catch(err: unknown){
        if(err instanceof Error){
            return {
                message: err.message
            };
        }
        else{
            return{message :'Something went wrong!'}
        }
    }
    redirect('/batches/view');
}

export async function createItemBatch(
    formState: { message: string } | undefined,
    formData: FormData
): Promise<{ message: string } | undefined> {
        console.log('createItemBatch', formData)
        try{
            //const name = formData.get('name') ;
            const description = formData.get('description') as string;
            const item_id: number = parseInt(formData.get('item_id') as string);

            const createdString = formData.get('created') as string;
            const created_by: number = parseInt(formData.get('created_by') as string);

            const quantity: number = parseInt(formData.get('quantity') as string);
            const unit_id: number = parseInt(formData.get('unit_id') as string);

            let created = new Date(createdString);

            const name = await getBatchName(item_id, created)

            const batch = await db.itembatches.create({
                data:{
                    name,
                    description,
                    item_id,
                    created,
                    created_by
                }
            })

            await db.itembatches.update({
                where:{
                    id: batch.id
                },
                data:{
                    generation: String(batch.id)
                }
            })

            await addingFishBatch(batch.id, quantity, unit_id, created_by )
            
            return {
                message: `Партія ${name} успішно створена`
            };
        }
        catch(err: unknown){
            if(err instanceof Error){
                if (err.message.includes('Foreign key constraint failed')){
                    return{
                        message: 'There is no any item or employee with such id.'
                    }
                }
                else if (err.message.includes('Unique constraint failed')){
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

    
    // redirect('/batches/view');
}

export async function createCaviarBatch(
    formState: {message: string}, 
    formData: FormData,
    ){
        try{
            const name = formData.get('name') ;
            const description = formData.get('description') as string;
            const item_id: number = parseInt(formData.get('item_id') as string);
            const createdString = formData.get('created') as string;
            const created_by: number = parseInt(formData.get('created_by') as string);

            let created = new Date();

            if (createdString){
                try{
                    created = new Date(createdString);
                }
                catch(err: unknown){
                    console.log(err)
                }
            }
            
            if(typeof name !== 'string' || name.length < 1){
                return{
                    message: 'Name must be longer'
                };
            }
            
            await caviarRegistering(1, created_by, 1); // 1 - склад ікри
            
        }
        catch(err: unknown){
            if(err instanceof Error){
                if (err.message.includes('Foreign key constraint failed')){
                    return{
                        message: 'There is no any item or employee with such id.'
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
    redirect('/caviar/view');
}

export async function createPurchLineRecord(
    formState: {message: string}, 
    formData: FormData,
    ){
        try{
            console.log('createPurchLineRecord', formData)
            const purchase_id: number = parseInt(formData.get('purchase_id') as string);
            const item_id: number = parseInt(formData.get('item_id') as string);
            const quantity: number = parseInt(formData.get('quantity') as string);
            const unit_id: number = parseInt(formData.get('unit_id') as string);
                        
            await db.purchaselines.create({
                data:{
                    purchase_id,
                    item_id,
                    quantity,
                    unit_id
                }
            })
        }
        catch(err: unknown){
            return{message :'Something went wrong!'}
        }
    redirect('/purchtable/view');
}

export async function createPool(
    formState: {message: string}, 
    formData: FormData){
        try{
            //console.log(formData)
            const prod_line_id: number = parseInt(formData.get('prod_line_id') as string, 10);
            const name = formData.get('name') ;
            const description = formData.get('description') as string;
            
            const cleaning_frequency: number | undefined = parseInt(formData.get('cleaning_frequency') as string);
            const water_temperature: number | undefined = parseInt(formData.get('water_temperature') as string);
            const x_location: number | undefined = parseInt(formData.get('x_location') as string);
            const y_location: number | undefined = parseInt(formData.get('y_location') as string);
            const pool_height: number | undefined = parseInt(formData.get('pool_height') as string);
            const pool_width: number | undefined = parseInt(formData.get('pool_width') as string);
            const pool_length: number | undefined = parseInt(formData.get('pool_length') as string);

    
            if(typeof name !== 'string' || name.length < 2){
                return{
                    message: 'Name must be longer'
                };
            }
    
            const pool = await db.pools.create({
                data:{
                    prod_line_id,
                    name,
                    description,
                    cleaning_frequency,
                    water_temperature,
                    x_location,
                    y_location,
                    pool_height,
                    pool_width,
                    pool_length
                }
            })

            const pool_id = pool.id

            await db.locations.create({
                data: {
                    location_type_id: 2,
                    name: name,
                    pool_id: pool_id
                },
            });  

        }
        catch(err: unknown){
            if(err instanceof Error){
                if (err.message.includes('Unique constraint failed')) {
                    return {
                        message: 'Pool with this name already exists.'
                    };
                }
                else if (err.message.includes('Foreign key constraint failed')){
                    return{
                        message: 'There is no any production line with such id.'
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
    redirect('/prod-areas/view');
}

interface DataTable {
    day: number;
    feedingLevel: number;
    fc: number;
    weight: number;
    voerhoeveelheid: number;
  }
// initialize a datatable

export async function fillDatatableBelow25(
    ){
        const numberOfRecords = 78;
        const weight: number[] = new Array(numberOfRecords).fill(0);
        weight[0] = 0.005;
        const feeding_level: number[] = [
            9, 9, 9, 9, 8.7, 8.5, 8.3, 8, 8, 8, 8, 7.7, 7.5, 7.3, 7, 7, 7, 7, 7, 7, 7,
            6.7, 6.5, 6.3, 6, 6, 6, 6.7, 5.5, 5.3, 5, 5, 5, 5, 5, 5, 5, 5, 4.7, 4.5, 4.3,
            4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4
        ];
        const fc: number[] = [
            0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 
            0.45, 0.46, 0.46, 0.46, 0.46, 0.46, 0.46, 0.46, 0.46, 0.46, 
            0.46, 0.46, 0.47, 0.47, 0.47, 0.47, 0.47, 0.47, 0.47, 0.47, 
            0.47, 0.47, 0.47, 0.47, 0.48, 0.48, 0.48, 0.48, 0.48, 
            0.48, 0.48, 0.48, 0.48, 0.48, 0.48, 0.48, 0.48, 0.48, 0.48, 
            0.48, 0.49, 0.49, 0.49, 0.49, 0.49, 0.49, 0.49, 0.49, 
            0.49, 0.49, 0.49, 0.49, 0.49, 0.49, 0.49, 0.49, 0.50, 0.50, 
            0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50
        ];
    
        const day: number[] = Array.from({ length: numberOfRecords }, (_, i) => i);
        const voerhoeveelheid: number[] = new Array(numberOfRecords).fill(0);
    
        for (let i = 0; i < day.length - 1; i++) {
        voerhoeveelheid[i] = weight[i] * (feeding_level[i] / 100);
        weight[i + 1] = weight[i] + (weight[i] * (feeding_level[i] / 100)) / fc[i];
        }
    
        voerhoeveelheid[numberOfRecords - 1] = weight[numberOfRecords - 1] * (feeding_level[numberOfRecords - 1] / 100);
    
        const data: DataTable[] = day.map((day_val, index) => ({
        day: day_val,
        feedingLevel: feeding_level[index],
        fc: fc[index],
        weight: weight[index],
        voerhoeveelheid: voerhoeveelheid[index]
        }));
    
        for (const record of data) {
            try {
                await db.datatable_below25.create({
                data: {
                    day: record.day,
                    feedingLevel: record.feedingLevel,
                    fc: record.fc,
                    weight: record.weight,
                    voerhoeveelheid: record.voerhoeveelheid
                }
                });
            } catch(err: unknown){
                console.log(err)
            }
        }
        return await db.datatable_below25.findMany()
}


export async function fillDatatableOver25(
    ){
        const numberOfRecords = 209;
        const weight: number[] = [
            7.5, 8.2, 8.9, 9.7, 10.5, 11.40, 12.30, 13.20, 14.20, 15.00, 16.77, 18.66, 20.65, 22.75, 24.96, 27.28, 29.71, 32.26, 34.92, 37.69, 40.57, 43.58, 46.69, 49.92, 53.27, 56.73, 60.32, 64.01, 67.83, 71.77, 75.82, 80.00, 84.29, 88.71, 93.24, 97.90, 102.68, 107.58, 112.60, 117.74, 123.01, 128.40, 133.92, 139.56, 145.32, 151.21, 157.22, 163.36, 169.62, 176.01, 182.53, 189.17, 195.94, 202.83, 209.85, 217.00, 224.28, 231.69, 239.22, 246.89, 254.68, 262.60, 270.65, 278.83, 287.14, 295.58, 304.15, 312.85, 321.68, 330.65, 339.74, 348.97, 358.32, 367.81, 377.43, 387.19, 397.07, 407.09, 417.24, 427.53, 437.95, 448.50, 459.18, 470.00, 480.96, 492.04, 503.27, 514.62, 526.12, 537.74, 549.51, 561.40, 573.44, 585.60, 597.91, 610.35, 622.93, 635.64, 648.49, 661.48, 674.60, 687.87, 701.26, 714.80, 728.48, 742.29, 756.24, 770.32, 784.55, 798.91, 813.42, 828.06, 842.84, 857.76, 872.82, 888.02, 903.35, 918.83, 934.45, 950.20, 966.10, 982.14, 998.32, 1014.63, 1031.09, 1047.69, 1064.43, 1081.31, 1098.34, 1115.50, 1132.80, 1150.25, 1167.84, 1185.57, 1203.44, 1221.45, 1239.61, 1257.91, 1276.35, 1294.93, 1313.66, 1332.53, 1351.54, 1370.70, 1390.00, 1409.44, 1429.02, 1448.75, 1468.62, 1488.64, 1508.80, 1529.10, 1549.55, 1570.15, 1590.88, 1611.76, 1632.79, 1653.96, 1675.28, 1696.74, 1718.34, 1740.09, 1761.99, 1784.03, 1806.22, 1828.55, 1851.03, 1873.66, 1896.43, 1919.34, 1942.40, 1965.61, 1988.97, 2012.47, 2036.12, 2059.91, 2083.85, 2107.94, 2132.18, 2156.56, 2181.09, 2205.77, 2230.59, 2255.56, 2280.68, 2305.95, 2331.36, 2356.93, 2382.64, 2408.50, 2434.50, 2460.66, 2486.96, 2513.41, 2540.02, 2566.76, 2593.66, 2620.71, 2647.91, 2675.25, 2702.74, 2730.39, 2758.18, 2786.12, 2814.21, 2842.45, 2870.84, 2899.38, 2928.07
        ];

        const uitval : number[] = [
            1.0000, 1.0000, 0.9903, 0.9846, 0.9806, 0.9775, 0.9749, 0.9728, 0.9709, 0.9692, 0.9678, 0.9664, 0.9652, 0.9641, 0.9631, 0.9621, 0.9612, 0.9603, 0.9595, 0.9588, 0.9581, 0.9574, 0.9567, 0.9561, 0.9555, 0.9549, 0.9544, 0.9539, 0.9533, 0.9529, 0.9524, 0.9519, 0.9515, 0.9510, 0.9506, 0.9502, 0.9498, 0.9494, 0.9491, 0.9487, 0.9484, 0.9480, 0.9477, 0.9473, 0.9470, 0.9467, 0.9464, 0.9461, 0.9458, 0.9455, 0.9452, 0.9450, 0.9447, 0.9444, 0.9442, 0.9439, 0.9436, 0.9434, 0.9432, 0.9429, 0.9427, 0.9424, 0.9422, 0.9420, 0.9418, 0.9416, 0.9413, 0.9411, 0.9409, 0.9407, 0.9405, 0.9403, 0.9401, 0.9399, 0.9397, 0.9396, 0.9394, 0.9392, 0.9390, 0.9388, 0.9387, 0.9385, 0.9383, 0.9381, 0.9380, 0.9378, 0.9376, 0.9375, 0.9373, 0.9372, 0.9370, 0.9368, 0.9367, 0.9365, 0.9364, 0.9362, 0.9361, 0.9360, 0.9358, 0.9357, 0.9355, 0.9354, 0.9353, 0.9351, 0.9350, 0.9348, 0.9347, 0.9346, 0.9345, 0.9343, 0.9342, 0.9341, 0.9339, 0.9338, 0.9337, 0.9336, 0.9334, 0.9333, 0.9332, 0.9331, 0.9330, 0.9329, 0.9327, 0.9326, 0.9325, 0.9324, 0.9323, 0.9322, 0.9321, 0.9320, 0.9319, 0.9317, 0.9316, 0.9315, 0.9314, 0.9313, 0.9312, 0.9311, 0.9310, 0.9309, 0.9308, 0.9307, 0.9306, 0.9305, 0.9304, 0.9303, 0.9302, 0.9301, 0.9300, 0.9299, 0.9299, 0.9298, 0.9297, 0.9296, 0.9295, 0.9294, 0.9293, 0.9292, 0.9291, 0.9290, 0.9289, 0.9289, 0.9288, 0.9287, 0.9286, 0.9285, 0.9284, 0.9283, 0.9283, 0.9282, 0.9281, 0.9280, 0.9279, 0.9279, 0.9278, 0.9277, 0.9276, 0.9275, 0.9275, 0.9274, 0.9273, 0.9272, 0.9271, 0.9271, 0.9270, 0.9269, 0.9268, 0.9268, 0.9267, 0.9266, 0.9265, 0.9265, 0.9264, 0.9263, 0.9262, 0.9262, 0.9261, 0.9260, 0.9260, 0.9259, 0.9258, 0.9258, 0.9257, 0.9256, 0.9255, 0.9255, 0.9254, 0.9253, 0.9253
        ];

        const voederconversie: number[] = [
            0.5500, 0.5500, 0.5500, 0.5500, 0.5500, 0.5500, 0.5500, 0.5500, 0.5500, 0.5500, 0.5566, 0.5629, 0.5690, 0.5749, 0.5806, 0.5862, 0.5915, 0.5967, 0.6018, 0.6067, 0.6115, 0.6161, 0.6207, 0.6251, 0.6295, 0.6337, 0.6378, 0.6419, 0.6459, 0.6497, 0.6536, 0.6573, 0.6610, 0.6646, 0.6681, 0.6716, 0.6750, 0.6784, 0.6817, 0.6849, 0.6881, 0.6913, 0.6944, 0.6974, 0.7004, 0.7034, 0.7063, 0.7092, 0.7121, 0.7149, 0.7176, 0.7204, 0.7231, 0.7257, 0.7284, 0.7310, 0.7336, 0.7361, 0.7386, 0.7411, 0.7436, 0.7460, 0.7484, 0.7508, 0.7531, 0.7554, 0.7577, 0.7600, 0.7623, 0.7645, 0.7667, 0.7689, 0.7711, 0.7732, 0.7754, 0.7775, 0.7796, 0.7816, 0.7837, 0.7857, 0.7877, 0.7897, 0.7917, 0.7937, 0.7956, 0.7976, 0.7995, 0.8014, 0.8033, 0.8051, 0.8070, 0.8088, 0.8107, 0.8125, 0.8143, 0.8161, 0.8178, 0.8196, 0.8214, 0.8231, 0.8248, 0.8265, 0.8282, 0.8299, 0.8316, 0.8332, 0.8349, 0.8365, 0.8382, 0.8398, 0.8414, 0.8430, 0.8446, 0.8462, 0.8477, 0.8493, 0.8509, 0.8524, 0.8539, 0.8554, 0.8570, 0.8585, 0.8600, 0.8614, 0.8629, 0.8644, 0.8658, 0.8673, 0.8687, 0.8702, 0.8716, 0.8730, 0.8744, 0.8758, 0.8772, 0.8786, 0.8800, 0.8814, 0.8828, 0.8841, 0.8855, 0.8868, 0.8881, 0.8895, 0.8908, 0.8921, 0.8934, 0.8947, 0.8960, 0.8973, 0.8986, 0.8999, 0.9012, 0.9024, 0.9037, 0.9050, 0.9062, 0.9074, 0.9087, 0.9099, 0.9111, 0.9124, 0.9136, 0.9148, 0.9160, 0.9172, 0.9184, 0.9196, 0.9208, 0.9219, 0.9231, 0.9243, 0.9254, 0.9266, 0.9278, 0.9289, 0.9300, 0.9312, 0.9323, 0.9334, 0.9346, 0.9357, 0.9368, 0.9379, 0.9390, 0.9401, 0.9412, 0.9423, 0.9434, 0.9445, 0.9456, 0.9467, 0.9477, 0.9488, 0.9499, 0.9509, 0.9520, 0.9530, 0.9541, 0.9551, 0.9562, 0.9572, 0.9582, 0.9593, 0.9603, 0.9613, 0.9623, 0.9633, 0.9643
        ]

        const voederniveau: number[] = [
            7.5000, 7.5000, 7.5000, 7.5000, 7.5000, 7.5000, 7.5000, 7.5000, 7.5000, 7.5000, 7.5000, 6.5920, 6.0608, 5.6840, 5.3916, 5.1528, 4.9509, 4.7759, 4.6216, 4.4836, 4.3588, 4.2448, 4.1399, 4.0428, 3.9525, 3.8679, 3.7885, 3.7136, 3.6428, 3.5756, 3.5117, 3.4507, 3.3925, 3.3367, 3.2833, 3.2319, 3.1825, 3.1348, 3.0888, 3.0444, 3.0015, 2.9599, 2.9196, 2.8805, 2.8425, 2.8056, 2.7697, 2.7348, 2.7007, 2.6676, 2.6352, 2.6037, 2.5728, 2.5427, 2.5133, 2.4845, 2.4563, 2.4287, 2.4017, 2.3752, 2.3493, 2.3239, 2.2989, 2.2744, 2.2504, 2.2268, 2.2036, 2.1808, 2.1584, 2.1364, 2.1148, 2.0935, 2.0725, 2.0519, 2.0316, 2.0116, 1.9919, 1.9724, 1.9533, 1.9345, 1.9159, 1.8976, 1.8795, 1.8617, 1.8441, 1.8267, 1.8096, 1.7927, 1.7760, 1.7595, 1.7433, 1.7272, 1.7113, 1.6956, 1.6801, 1.6648, 1.6497, 1.6347, 1.6199, 1.6052, 1.5908, 1.5765, 1.5623, 1.5483, 1.5344, 1.5207, 1.5071, 1.4937, 1.4804, 1.4672, 1.4542, 1.4413, 1.4285, 1.4158, 1.4033, 1.3909, 1.3786, 1.3664, 1.3543, 1.3424, 1.3305, 1.3188, 1.3071, 1.2956, 1.2841, 1.2728, 1.2616, 1.2504, 1.2393, 1.2284, 1.2175, 1.2067, 1.1960, 1.1854, 1.1749, 1.1645, 1.1541, 1.1438, 1.1336, 1.1235, 1.1135, 1.1035, 1.0936, 1.0838, 1.0741, 1.0644, 1.0548, 1.0453, 1.0358, 1.0264, 1.0171, 1.0079, 0.9987, 0.9895, 0.9805, 0.9715, 0.9625, 0.9537, 0.9448, 0.9361, 0.9274, 0.9187, 0.9101, 0.9016, 0.8931, 0.8847, 0.8763, 0.8680, 0.8597, 0.8515, 0.8434, 0.8352, 0.8272, 0.8192, 0.8112, 0.8033, 0.7954, 0.7876, 0.7798, 0.7721, 0.7644, 0.7568, 0.7492, 0.7416, 0.7341, 0.7267, 0.7192, 0.7119, 0.7045, 0.6972, 0.6900, 0.6828, 0.6756, 0.6684, 0.6613, 0.6543, 0.6472, 0.6403, 0.6333, 0.6264, 0.6195, 0.6127, 0.6059, 0.5991, 0.5924, 0.5857, 0.5790, 0.5724, 0.5658
        ]

        const av_weight: number[] = weight.map((value, index) => value / uitval[index]);

        const day: number[] = Array.from({ length: numberOfRecords }, (_, i) => i);
        
        const data = day.map(day_val => ({
            day: day_val,
            av_weight: av_weight[day_val],
            weight: weight[day_val],
            uitval: uitval[day_val],
            voederniveau: voederniveau[day_val],
            voederconversie: voederconversie[day_val]
        }));
    
        for (const record of data) {
            try {
                await db.datatable_over25.create({
                    data: {
                        day: record.day,
                        av_weight: record.av_weight,
                        weight: record.weight,
                        uitval: record.uitval,
                        voederniveau: record.voederniveau,
                        voederconversie: record.voederconversie
                    }
                });
            } catch (err) {
                console.log(err);
            }
        }
        return await db.datatable_over25.findMany()
}


export async function getLines(){
    return await db.productionlines.findMany()
}

export async function getAreas(){
    return await db.productionareas.findMany()
}

export async function showDatatableBelow25(){
    const datatable = await db.datatable_below25.findMany();
    return(datatable)
}
export async function showDatatableOver25(){
    const datatable = await db.datatable_over25.findMany();
    return(datatable)
}

export async function showCalcTable(){
    const calcTable = await db.calculation_table.findMany();
    return(calcTable)
}

export async function getTableByValues(fishAmount: number, averageFishMass: number, percentage: number, docId: bigint) {
    
    const numberOfRecords = 10;
    const day = Array.from({ length: numberOfRecords }, (_, i) => i + 1);

    const date = Array.from({ length: numberOfRecords }, (_, i) => {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + i);
        return currentDate;
    });

    const fishAmountInPool = Array(numberOfRecords).fill(fishAmount);

    let generalWeight = Array(numberOfRecords).fill(0.0);
    let fishWeight = Array(numberOfRecords).fill(0.0);
    let feedQuantity = Array(numberOfRecords).fill(0.0);
    let vC = Array(numberOfRecords).fill(0.0);
    let totalWeight = Array(numberOfRecords).fill(0.0);
    let weightPerFish = Array(numberOfRecords).fill(0.0);
    let feedToday = Array(numberOfRecords).fill(0);
    let feedPerDay = Array(numberOfRecords).fill(0.0);
    let feedPerFeeding = Array(numberOfRecords).fill(0.0);

    generalWeight[0] = fishAmount * averageFishMass;
    fishWeight[0] = generalWeight[0] / fishAmountInPool[0];

    for (let i = 0; i < day.length - 1; i++) {
        const fcQuery = await db.datatable_below25.findFirst({
            where: {
                weight: {
                    lte: fishWeight[i],
                },
            },
            orderBy: {
                weight: 'desc',
            },
        });

        if (fcQuery) {
            vC[i] = fcQuery.fc;
            totalWeight[i] = generalWeight[i] + feedQuantity[i] / vC[i];
            weightPerFish[i] = totalWeight[i] / fishAmountInPool[i];

            const feedingLevelQuery = await db.datatable_below25.findFirst({
                where: {
                    weight: {
                        lte: weightPerFish[i],
                    },
                },
                orderBy: {
                    weight: 'desc',
                },
            });

            if (feedingLevelQuery) {
                feedToday[i] = (feedingLevelQuery.feedingLevel / 100) * totalWeight[i];
                feedPerDay[i] = feedToday[i] + (percentage * feedToday[i]);
                feedPerFeeding[i] = feedPerDay[i] / 5;
                generalWeight[i + 1] = totalWeight[i];
                fishWeight[i + 1] = weightPerFish[i];
                feedQuantity[i + 1] = feedPerDay[i];
            }
        }
    }

    const fcQuery = await db.datatable_below25.findFirst({
        where: {
            weight: {
                lte: fishWeight[fishWeight.length - 1],
            },
        },
        orderBy: {
            weight: 'desc',
        },
    });

    if (fcQuery) {
        vC[vC.length - 1] = fcQuery.fc;
        totalWeight[totalWeight.length - 1] = generalWeight[generalWeight.length - 1] + feedQuantity[feedQuantity.length - 1] / vC[vC.length - 1];
        weightPerFish[weightPerFish.length - 1] = totalWeight[totalWeight.length - 1] / fishAmountInPool[fishAmountInPool.length - 1];

        const feedingLevelQuery = await db.datatable_below25.findFirst({
            where: {
                weight: {
                    lte: weightPerFish[weightPerFish.length - 1],
                },
            },
            orderBy: {
                weight: 'desc',
            },
        });

        if (feedingLevelQuery) {
            feedToday[feedToday.length - 1] = (feedingLevelQuery.feedingLevel / 100) * totalWeight[totalWeight.length - 1];
            feedPerDay[feedPerDay.length - 1] = feedToday[feedToday.length - 1] + (percentage * feedToday[feedToday.length - 1]);
            feedPerFeeding[feedPerFeeding.length - 1] = feedPerDay[feedPerDay.length - 1] / 5;
        }
    }
    let dataForTable: calculation_table[] = []
    for (let i = 0; i < day.length; i++) {
        const record = await db.calculation_table.create({
            data: {
                day: day[i],
                date: date[i],
                fish_amount_in_pool: fishAmountInPool[i],
                general_weight: generalWeight[i],
                fish_weight: fishWeight[i],
                feed_quantity: feedQuantity[i],
                v_c: vC[i],
                total_weight: totalWeight[i],
                weight_per_fish: weightPerFish[i],
                feed_today: feedToday[i],
                feed_per_day: feedPerDay[i],
                feed_per_feeding: feedPerFeeding[i],
                doc_id: docId
            },
        }); 
        dataForTable.push(record)
    }
    try {
        return dataForTable
    } catch (error) {
        console.error('Error creating calculation table:', error);
        throw new Error('Error creating calculation table');
    }
}

export async function getTableByValuesOver25(fishAmount: number, averageFishMass: number, percentage: number, docId: bigint) {
    const numberOfRecords = 10;
    const day = Array.from({ length: numberOfRecords }, (_, i) => i + 1);

    const date = Array.from({ length: numberOfRecords }, (_, i) => {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + i);
        return currentDate;
    });

    const fishAmountInPool = Array(numberOfRecords).fill(fishAmount);

    let generalWeight = Array(numberOfRecords).fill(0.0);
    let fishWeight = Array(numberOfRecords).fill(0.0);
    let feedQuantity = Array(numberOfRecords).fill(0.0);
    let fcr = Array(numberOfRecords).fill(0.0);
    let gesch_uitval : number[] = [
        1.0000, 1.0000, 0.9903, 0.9846, 0.9806, 0.9775, 0.9749, 0.9728, 0.9709, 0.9692, 0.9678, 0.9664, 0.9652, 0.9641, 0.9631, 0.9621, 0.9612, 0.9603, 0.9595, 0.9588, 0.9581, 0.9574, 0.9567, 0.9561, 0.9555, 0.9549, 0.9544, 0.9539, 0.9533, 0.9529, 0.9524, 0.9519, 0.9515, 0.9510, 0.9506, 0.9502, 0.9498, 0.9494, 0.9491, 0.9487, 0.9484, 0.9480, 0.9477, 0.9473, 0.9470, 0.9467, 0.9464, 0.9461, 0.9458, 0.9455, 0.9452, 0.9450, 0.9447, 0.9444, 0.9442, 0.9439, 0.9436, 0.9434, 0.9432, 0.9429, 0.9427, 0.9424, 0.9422, 0.9420, 0.9418, 0.9416, 0.9413, 0.9411, 0.9409, 0.9407, 0.9405, 0.9403, 0.9401, 0.9399, 0.9397, 0.9396, 0.9394, 0.9392, 0.9390, 0.9388, 0.9387, 0.9385, 0.9383, 0.9381, 0.9380, 0.9378, 0.9376, 0.9375, 0.9373, 0.9372, 0.9370, 0.9368, 0.9367, 0.9365, 0.9364, 0.9362, 0.9361, 0.9360, 0.9358, 0.9357, 0.9355, 0.9354, 0.9353, 1.9353, 2.9353, 3.9353, 4.9353, 5.9353, 6.9353, 7.9353, 8.9353, 9.9353, 10.9353, 11.9353, 12.9353, 13.9353, 14.9353, 15.9353, 16.9353, 17.9353, 18.9353, 19.9353, 20.9353, 21.9353, 22.9353, 23.9353, 24.9353, 25.9353, 26.9353, 27.9353, 28.9353, 29.9353, 30.9353, 31.9353, 32.9353, 33.9353, 34.9353, 35.9353, 36.9353, 37.9353, 38.9353, 39.9353, 40.9353, 41.9353, 42.9353, 43.9353, 44.9353, 45.9353, 46.9353, 47.9353, 48.9353, 49.9353, 50.9353, 51.9353, 52.9353, 53.9353, 54.9353
    ];
    let gesch_bezetting = Array(numberOfRecords).fill(0.0);
    let gesch_gewicht = Array(numberOfRecords).fill(0.0);

    let voer_per_vis = Array(numberOfRecords).fill(0);

    let feedPerDay = Array(numberOfRecords).fill(0.0);
    let feedPerFeeding = Array(numberOfRecords).fill(0.0);

    generalWeight[0] = fishAmount * averageFishMass / 1000;
    let feedQuery
    for (let i = 0; i < day.length; i++) {

        fishWeight[i] = generalWeight[i]/fishAmountInPool[i] * 1000

        const fcrQuery = await db.datatable_over25.findFirst({
            where: {
                av_weight: {
                    lte: fishWeight[i],
                },
            },
            orderBy: {
                weight: 'desc',
            },
        });
        fcr[i] = fcrQuery?.voederconversie
        gesch_bezetting[i] = generalWeight[i] + feedQuantity[i] / fcr[i]
        generalWeight[i + 1] =  gesch_bezetting[i]
        gesch_gewicht[i] = gesch_bezetting[i] / ((100 - gesch_uitval[i])/100*fishAmountInPool[i])*1000

        feedQuery = await db.datatable_over25.findFirst({
            where: {
                av_weight: {
                    lte: gesch_gewicht[i],
                },
            },
            orderBy: {
                weight: 'desc',
            },
        });

        if (feedQuery){
            feedPerDay[i] = feedQuery?.voederniveau / 100 * gesch_bezetting[i] / 1.11

            feedPerFeeding[i] = feedPerDay[i] / 5

            feedQuantity[i + 1] = feedPerDay[i]
        }
        
    }

    let dataForTable: calculation_table[] = []

    for (let i = 0; i < day.length; i++) {
        const record = await db.calculation_table.create({
            data: {
                day: day[i],
                date: date[i],
                fish_amount_in_pool: fishAmountInPool[i],
                general_weight: generalWeight[i],
                fish_weight: fishWeight[i],
                feed_quantity: feedQuantity[i],
                feed_per_day: feedPerDay[i] * 1000,
                feed_per_feeding: feedPerFeeding[i] * 1000,
                doc_id: docId
            },
        }); 
        dataForTable.push(record)
    }
    
    try {
        return dataForTable
    } catch (error) {
        console.error('Error creating calculation table:', error);
        throw new Error('Error creating calculation table');
    }
}

async function disconnectIdleSessions() {
    try {
      await db.$executeRaw`SELECT pg_terminate_backend(pid)
                             FROM pg_stat_activity
                             WHERE state = 'idle';`;
      console.log('Disconnected idle sessions successfully.');
    } catch (error) {
      console.error('Error disconnecting idle sessions:', error);
    }
  }

export async function connectAndDisconnect() {
    try {
    await disconnectIdleSessions();
    await db.$connect();
    } catch (error) {
    console.error('Error connecting to database:', error);
    } 
}

interface Pool {
    id: number;
    name: string;
    // Other pool properties from your Prisma model
}

interface ProductionLine {
    id: number;
    name: string;
    pools: Pool[];
}

interface ProductionArea {
    id: number;
    name: string;
    productionLines: ProductionLine[];
}

interface AccordionData {
    productionAreas: ProductionArea[];
}

export async function fetchAccordionData(): Promise<AccordionData> {
    const productionAreas = await db.productionareas.findMany({
        include: {
            productionlines: {
                include: {
                    pools: true,
                },
            },
        },
    });

    return {
        productionAreas: productionAreas.map(area => ({
            id: area.id,
            name: area.name,
            productionLines: area.productionlines.map(line => ({
                id: line.id,
                name: line.name,
                pools: line.pools.map(pool => ({
                    id: pool.id,
                    name: pool.name,
                })),
            })),
        })),
    };
}

export async function addingFishBatch(batch_id: bigint, quantity: number, unit_id: number, created_by: number ){
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
            await db.itemtransactions.create({
                data: {
                    doc_id: document.id,
                    location_id: location_id, // Встановлюємо значення за замовчуванням, якщо document.location_id === null
                    batch_id: batch_id,
                    quantity: quantity,
                    unit_id: unit_id
                }
            });
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

type BatchType = {
    batch_id: bigint;
    _sum: {
        quantity: number | null;
    };
};


export async function feedBatch(
    formState: {message: string}, 
    formData: FormData) {
        try{
            console.log('feedBatch')
            console.log(formData)

            const fish_batch_id: number = parseInt(formData.get('batch_id') as string);
            const executed_by: number = parseInt(formData.get('executed_by') as string);
            const location_id: number = parseInt(formData.get('location_id') as string);
            const today_item_id: number = parseInt(formData.get('item_1') as string);
            const prev_item_id: number = parseInt(formData.get('item_0') as string);

            let index = 0

            // спочатку на сьогодні
            while(index < 5){
                const qty: number = parseFloat(formData.get(`input_${index}`) as string);

                const feedDoc = await db.documents.create({
                    data:{
                        location_id: location_id,
                        doc_type_id: 9,
                        date_time: new Date(),
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

                            // console.log(`Витягнули зі складу: ${fetchTran.id} і вкинули в басейн: ${feedTran.id}`)

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
                
                console.log('Витягнули зі складу ')

                index ++;
            }

            // тепер попереднє (якщо є)
            if (prev_item_id){
                while(index < 10){
                    const qty: number = parseInt(formData.get(`input_${index}`) as string);
    
                    console.log(qty)
    
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
    return { message: `успішно` };

    //redirect('/summary-feeding-table/day');
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
        const average_fish_mass : number = parseFloat(formData.get('average_fish_mass') as string);

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

        console.log('HELLO fish_qty_in_location_from', fish_qty_in_location_from, 'sum', sum) 

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
                    },
                    quantity:{
                        gt: 0
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
                    formData.set('batch_id_to', String(batch_id_from)) //партія з нового
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

        await updatePrevPool(info)

        revalidatePath('/feeding/view')

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
    
    redirect('/feeding/view')
}


export async function stockPool(
    formState: { message: string } | undefined,
    formData: FormData
): Promise<{ message: string } | undefined> {
    try {
        console.log('stockPool')
        console.log(formData)
        let location_id_from : number = parseInt(formData.get('location_id_from') as string);
      
        const location_id_to: number = parseInt(formData.get('location_id_to') as string);
        const batch_id_from: number = parseInt(formData.get('batch_id') as string);
        let batch_id_to: number = parseInt(formData.get('batch_id_to') as string);
        const stocking_quantity: number = parseInt(formData.get('fish_amount') as string);
        let quantity_in_location_to: number = parseInt(formData.get('fish_amount_in_location_to') as string);
        const average_weight_str = formData.get('average_fish_mass') as string;
        const average_weight = parseFloat(average_weight_str.replace(',', '.'));

        const executed_by = 3 //number = parseInt(formData.get('executed_by') as string);
        const comments: string = formData.get('comments') as string;

        // const p_tran: number = parseInt(formData.get('p_tran') as string);
        
        // перевірка, щоб зі складу не взяли більше, ніж є

        if (location_id_from == 87){
            const fish_amount_on_warehouse = await db.itemtransactions.groupBy({
                by: ['batch_id'],
                where:{
                    location_id: 87,
                    batch_id: batch_id_from
                },
                _sum:{
                    quantity: true
                }
            })

            const fishQuantityOnWarehouse = fish_amount_on_warehouse[0]?._sum?.quantity || 0;

            if (fishQuantityOnWarehouse === 0 || stocking_quantity > fishQuantityOnWarehouse) {
                throw new Error('Недостатня кількість на складі');
            }
        }

        
        //якщо зі складу, то batch_id_to не визначено, якщо з басейна, то batch_id_to = та партія, якої більше
        if(!batch_id_to){
            batch_id_to = batch_id_from
        }

        // документ зариблення

        const stockDoc = await db.documents.create({
            data: {
                location_id: location_id_to, // Отримуємо id локації
                doc_type_id: 1,
                date_time: new Date(),
                executed_by: executed_by,
                comments: comments,
                // parent_document: p_doc
            }
        });

        if (!stockDoc) {
            throw new Error('Помилка при створенні документа зариблення');
        }

        console.log(`документ зариблення для ${location_id_to}`, stockDoc.id)

        // транзакція для витягування з попереднього басейна stocking_quantity

        const fetchTran = await db.itemtransactions.create({
            data: {
                doc_id: stockDoc.id,
                location_id: location_id_from,
                batch_id: batch_id_from,
                quantity: - stocking_quantity,
                unit_id: 1,
                // parent_transaction: p_tran
            }
        });

        if (!fetchTran) {
            throw new Error('Помилка при створенні транзакції для витягування з попереднього басейна');
        }

        console.log(`Витягуємо з попереднього для ${location_id_to}. Tran: `, fetchTran.id)

        //визначаємо яку кількість зариблювати

        let count_to_stock

        if (quantity_in_location_to){
            count_to_stock = stocking_quantity + quantity_in_location_to
        }
        else{
            // quantity_in_location_to = 0
            count_to_stock = stocking_quantity
        }

        // транзакція для зариблення нового басейна

        const stockTran = await db.itemtransactions.create({
            data: {
                doc_id: stockDoc.id,
                location_id: location_id_to,
                batch_id: batch_id_to, //
                quantity: count_to_stock,
                unit_id: 1,
                parent_transaction: fetchTran.id
            }
        });

        if (!stockTran) {
            throw new Error('Помилка при створенні транзакції для зариблення нового басейна');
        }

        console.log(`Зариблюємо ${location_id_to}. Tran: `, stockTran.id)
        
        // запис зариблення

        const stock = await db.stocking.create({
            data: {
                doc_id: stockDoc.id,
                average_weight: average_weight
            }
        });

        if (!stockTran) {
            throw new Error('Помилка при створенні запису зариблення');
        }

        console.log('Створюємо stocking: ', stock.id)

        // тепер fish_amount це вся риба, яку зариблюємо.
        formData.set('fish_amount', String(count_to_stock));
        formData.set('parent_doc', String(stockDoc.id));

        await createCalcTable(formState, formData)

        console.log('Створили calc table')
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
    revalidatePath('/feeding/view')
    //redirect('/feeding/view')
}

interface FeedConnection{
    id: number;
    fish_id: number;
    feed_type_id: number;
    from_fish_weight: number;
    to_fish_weight: number;
}

export async function getFeedForFish(feedconnections: FeedConnection[], fish_weight: number): Promise<number> {
    const connection = feedconnections.find(connection => {
        return fish_weight >= connection.from_fish_weight && fish_weight <= connection.to_fish_weight;
    });
    return connection ? connection.feed_type_id : 0;
}

export async function getFeedTypeId(fish_weight: number){
    //console.log('fish_weight', fish_weight)
    const feed_type_id = await db.feedconnections.findFirst({
        select:{
            feed_type_id: true
        },
        where:{
            from_fish_weight: {
                lte: fish_weight,
            },
            to_fish_weight:{
                gt: fish_weight
            }
        }
    })
    console.log('feed_id', feed_type_id)
    return feed_type_id;
}

export async function getFeedBatchByItemId(item_id: number, quantity: number) {
    
    const batches = await db.itembatches.findMany({
        select:{
            id: true
        },
        where: {
            item_id: item_id            
        },
    })

    console.log('усі batches', batches)

    const batches_quantity = await db.itemtransactions.groupBy({
        by: ['batch_id'],
        where: {
            batch_id: {
                in: batches.map(batch => batch.id)
            },
            location_id: 87
        },
        _sum: {
            quantity: true // Сумуємо кількість по групам batch_id
        }
    });

    console.log('batches_quantity', batches_quantity)

    // Якщо в партії не вистачає корму на годування, то брати з іншої партії
    const batches_array = []; // Масив для зберігання партій
    let totalQuantity = 0; // Змінна для зберігання загальної кількості корму
    quantity = quantity / 1000

    console.log('totalQuantity: ', totalQuantity, 'quantity: ', quantity)

    while (totalQuantity < quantity && batches_quantity.length > 0) {
        //знаходимо партію з найменшим id (найстарішу)
        const minBatch = batches_quantity.reduce((min, current) => min.batch_id < current.batch_id ? min : current);

        batches_array.push(minBatch);

        if (minBatch._sum?.quantity !== null) {
            totalQuantity += minBatch._sum.quantity;
        }
        if (totalQuantity >= quantity) {
            break;
        }
    
        const minIndex = batches_quantity.indexOf(minBatch); // Знаходимо індекс поточної партії
        batches_quantity.splice(minIndex, 1); // Видаляємо поточну партію з масиву
    }
    
    // Перевірка, чи було знайдено необхідну кількість корму
    if (totalQuantity < quantity) {
        throw new Error('Немає достатньо корму');
    }
    else{
        return batches_array;
    }
}


interface FilterSpecifier {
    gt?: number;
    lt?: number;
    gte?: number;
    lte?: number;
}
interface Saldos {
    [batchId: string]: number;
}

export async function calculateSaldo (startDate: Date | undefined, endDate: Date | undefined, quantityFilter: FilterSpecifier | undefined)
: Promise<Saldos> {
    const result = await db.itemtransactions.groupBy({
        by: ['batch_id'],
        where: {
            locations: {
                location_type_id: 1
            },
            documents: {
                date_time: {
                    gte: startDate,
                    lt: endDate
                }
            },
            quantity: quantityFilter,
            NOT: {
                itembatches: {
                    items: {
                        feed_type_id: null
                    }
                }
            }
        },
        _sum: {
            quantity: true
        },
    });

    const saldoData: Saldos = {};
    result.forEach((item: any) => {
        saldoData[item.batch_id.toString()] = item._sum.quantity;
    });

    return saldoData;
    
};

export async function managePriorities(
    formState: { message: string } | undefined,
    formData: FormData
) {
    try {
        console.log('ми в managePriorities')
        console.log(formData)

        const location_id: number = parseInt(formData.get('location') as string);
        const item_id: number = parseInt(formData.get('feed') as string);

        await db.priorities.deleteMany({
            where: {
                location_id: location_id
            }
        });

        await db.priorities.create({
            data:{
                item_id: item_id,
                location_id: location_id,
                priority: 1
            }
        })

        console.log(`пріоритетність для локації ${location_id} оновлена`);
    }
    catch (err: unknown) {
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
    revalidatePath('/feed-weight/view')
}

type updatePrevPoolProps = {
    formData: FormData,
    formState: { message: string; } | undefined,
    info : { 
        amount_in_pool: number,
        divDocId: bigint
    }
}

async function updatePrevPool({info, formData, formState} : updatePrevPoolProps) {
    console.log('оновлюємо попередній басейн')
    const location_id: number = parseInt(formData.get('location_id_from') as string); 
    const batch_id: number = parseInt(formData.get('batch_id') as string); 
    const av_weight: number = parseFloat(formData.get('average_fish_mass') as string); 

    //створити документ зариблення залишком
    const stockDoc = await db.documents.create({
        data:{
            location_id: location_id,
            doc_type_id: 1,
            date_time: new Date(),
            executed_by: 3
        }
    })
    console.log('документ зариблення залишком', stockDoc)

    //транзакція витягування що там є за документом розподілу

    const fetchTran = await db.itemtransactions.create({
        data:{
            doc_id: info.divDocId,
            location_id: location_id,
            batch_id: batch_id,
            quantity: - info.amount_in_pool,
            unit_id: 2
        }
    })
    console.log('транзакція витягування що там є за документом розподілу', fetchTran)

    //транзакція зариблення тої ж кількості за документом зариблення

    const stockTran = await db.itemtransactions.create({
        data:{
            doc_id: stockDoc.id,
            location_id: location_id,
            batch_id: batch_id,
            quantity: info.amount_in_pool,
            unit_id: 2
        }
    })
    console.log('транзакція зариблення тої ж кількості за документом зариблення', stockTran)

    //створення запису в stocking

    const stocking = await db.stocking.create({
        data:{
            doc_id: stockDoc.id,
            average_weight: av_weight
        }
    })

    console.log('створення запису в stocking', stocking)

    //створення калькуляції
    formData.set('parent_doc', String(stockDoc.id)) 
    formData.set('fish_amount', String(info.amount_in_pool)) 
    formData.set('location_id_to', String(location_id))

    console.log('МИ ОНОВИЛИ fish_amount', info.amount_in_pool)
    
    createCalcTable(formState, formData)
}


// реєстрація списання

export async function disposal(
    formState: { message: string } | undefined,
    formData: FormData
) {
    try {
        console.log('ми в disposal')
        console.log(formData)

        const location_id_from: number = parseInt(formData.get('location_id_from') as string);
        const fish_amount_in_pool : number = parseInt(formData.get('fish_amount_in_pool') as string);
        const batch_id: number = parseInt(formData.get('batch_id') as string);
        const reason_id: number = parseInt(formData.get('reason') as string);
        const qty: number = parseInt(formData.get('qty') as string);
        const average_weight_str = formData.get('average_fish_mass') as string;

        //створення документа списання
        const disposalDoc = await db.documents.create({
            data:{
                location_id: location_id_from,
                doc_type_id: 11,
                date_time: new Date(),
                executed_by: 3
            }
        })

        console.log('документ списання', disposalDoc.id)

        //створення запису із вказанням деталей списання
        const disposalRecord = await db.disposal_table.create
        ({
            data:{
                doc_id: disposalDoc.id,
                reason_id: reason_id,
                qty: qty,
                batch_id: batch_id,
                date: new Date(),
                location_id: location_id_from
            }
        })
        console.log('запис із вказанням деталей списання', disposalRecord.id)

        //створення транзакції списання
        const disposalTran = await db.itemtransactions.create({
            data:{
                doc_id: disposalDoc.id,
                location_id: location_id_from, 
                batch_id: batch_id,
                quantity: - qty,
                unit_id: 1
            }
        })

        console.log('транзакція списання', disposalTran.id)

        formData.set('fish_amount_in_pool', String(fish_amount_in_pool - qty))
        formData.set('location_id_to', String(location_id_from))
        formData.set('fish_amount', String(fish_amount_in_pool - qty))
               

        await stockPool(formState, formData)
    }
    catch (err: unknown) {
        if (err instanceof Error) {
            return {
                message: err.message
            };
        } else {
            return { message: 'Something went wrong!' };
        }
    }
    revalidatePath('/feeding/view')
}


export async function updateCurrentPoolState(
    formState: { message: string } | undefined,
    formData: FormData
) {
    try {
        console.log('ми в updateCurrentPoolState')
        console.log(formData)

        let batch_id_before: number = parseInt(formData.get('batch_id_before') as string);
        let fish_amount_before: number = parseInt(formData.get('fish_amount_before') as string);
        const average_fish_mass_before: number = parseInt(formData.get('average_fish_mass_before') as string);
        const location_id_to: number = parseInt(formData.get('location_id_to') as string);
        const batch_id_from: number = parseInt(formData.get('batch_id') as string);
        const fish_amount: number = parseInt(formData.get('fish_amount') as string);

        if(!batch_id_before && !fish_amount_before && !average_fish_mass_before){
            throw new Error('')
        }

        //перевірка чи вистачає потрібного корму на складі
        const fish_amount_on_warehouse = await db.itemtransactions.groupBy({
            by: ['batch_id'],
            where:{
                location_id: 87,
                batch_id: batch_id_from
            },
            _sum:{
                quantity: true
            }
        })

        const fishQuantityOnWarehouse = fish_amount_on_warehouse[0]?._sum?.quantity || 0; //100

        let newFishQuantityOnWarehouse = fishQuantityOnWarehouse //100

        if(!batch_id_before ){
            console.log('ПАРТІЯ НЕ ЗМІНИЛАСЯ')
            console.log('fish_amount_before: ', fish_amount_before, 'fishQuantityOnWarehouse: ', fishQuantityOnWarehouse)
            newFishQuantityOnWarehouse = fish_amount_before + fishQuantityOnWarehouse//300
        }

        console.log('newFishQuantityOnWarehouse', newFishQuantityOnWarehouse)

        if ( fish_amount > newFishQuantityOnWarehouse) {
            console.log('fish_amount > newFishQuantityOnWarehouse: ', fish_amount > newFishQuantityOnWarehouse)
            throw new Error('Недостатня кількість на складі');
        }

        if(!batch_id_before){
            batch_id_before = batch_id_from
        }

        if(!fish_amount_before){
            fish_amount_before = fish_amount
        }

        
        //повертаємо до складу те, що було перед зміною 

        const arriveDoc = await db.documents.create({
            data:{
                location_id: location_id_to,
                doc_type_id: 12, //повернення до складу
                executed_by: 3
            }
        })

        //витягуємо з басейна

        const fetchTran = await db.itemtransactions.create({
            data:{
                doc_id: arriveDoc.id,
                location_id: location_id_to,
                batch_id: batch_id_before,
                quantity: - fish_amount_before,
                unit_id: 1
            }
        })

        //повертаємо на склад

        const arriveTran = await db.itemtransactions.create({
            data:{
                doc_id: arriveDoc.id,
                location_id: 87,
                batch_id: batch_id_before,
                quantity: fish_amount_before,
                unit_id: 1,
                parent_transaction: fetchTran.id
            }
        })

        formData.set('location_id_from', '87')

       

        await stockPool(formState, formData)

        // return({message: 'hello'})
    }
    catch (err: unknown) {
        if (err instanceof Error) {
            return {
                message: err.message
            };
        } else {
            return { message: 'Something went wrong!' };
        }
    }
    revalidatePath('/feeding/view')
}