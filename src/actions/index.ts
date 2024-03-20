'use server'
import { db } from "@/db";
import { caviarRegistering } from "@/db/functions"
import { calculation_table } from "@prisma/client";
import { RedirectType, redirect } from "next/navigation";

export async function editProdArea(id: number, description: string | null ) {
    await db.productionareas.update({
        where: {id},
        data: {description}
    });
    redirect(`/prod-areas/${id}`)
}

export async function editPurchline(id: number, purchase_id: bigint, item_id: number, quantity: number, unit_id: number ) {
    await db.purchaselines.update({
        where: {id},
        data: {
            purchase_id,
            item_id,
            quantity,
            unit_id
        }
    });
    redirect(`/purchlines/${id}`)
}

export async function editProdLine(id: number, description: string | null ) {
    await db.productionlines.update({
        where: {id},
        data: {description}
    });
    redirect(`/prod-lines/${id}`)
}

export async function editPurchtableRecord(id: number, vendor_id: number, vendor_doc_number: string ) {
    await db.purchtable.update({
        where: {id},
        data: {
            vendor_id,
            vendor_doc_number
        }
    });
    redirect(`/purchtable/${id}`)
}

export async function editItemBatch(
    id: bigint,
    description: string | null,
    item_id: number,
    created: Date,
    created_by: number,
    endpoint: string
  ) {
    await db.itembatches.update({
      where: { id },
      data: {
        description,
        item_id,
        created,
        created_by
      }
    });
    redirect(`/${endpoint}/${id}`);
  }

export async function editPool(
    id: number,
    description: string | null,
    cleaning_frequency: number,
    water_temperature: number,
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
    await db.purchaselines.delete({
        where: { id }
    });
    redirect(`/purchlines/view`);
}

export async function deleteItemBatch(id: bigint, endpoint: string) {
    await db.itembatches.delete({
        where: {id}
    });
    redirect(`/${endpoint}/view`)
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
    await db.purchtable.delete({
        where: {id}
    });
    redirect(`/purchtable/view`)
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
        //console.log(formData);
        let calculationId
        try{
            const fish_amount: number = parseInt(formData.get('fish_amount') as string);
            const average_fish_mass: number = parseFloat(formData.get('average_fish_mass') as string);
            const percentage: number = parseFloat(formData.get('percentage') as string);
            const pool_id: number = parseInt(formData.get('location_id_to') as string);
            const batch_id: number = parseInt(formData.get('batch_id') as string);
            const unit_id: number = parseInt(formData.get('unit_id') as string);

            if(typeof(fish_amount) !== 'number'){
                return {
                    message: 'Поле "Кількість особин" це число.'
                };
            }

            const location_to = await db.locations.findFirst({
                select: {
                    id: true
                },
                where: {
                    pool_id: pool_id
                }
            });
            

            const document = await db.documents.create({
                data:{
                    doc_type_id: 7, //просто виклик калькуляції
                    location_id: location_to?.id,
                    executed_by: 1
                }
            })
            let transaction
            const doc_id = document.id
            if (location_to){
                transaction = await db.itemtransactions.create({
                    data:{
                        doc_id: doc_id,
                        location_id: location_to?.id,
                        batch_id: batch_id,
                        quantity: fish_amount,
                        unit_id: unit_id
                    }
                })
            }

            const calculation = await getTableByValues(fish_amount, average_fish_mass, percentage, doc_id)
            calculationId = calculation[0].id;
        }
        catch(err: unknown){
            return{message :'Усі поля мають бути заповнені числами!'}
        }
        //redirect(`/calculation/${calculationId}`);
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

export async function createPurchTableRecord(
    formState: {message: string}, 
    formData: FormData,
    ){
        try{
            const createdString = formData.get('created') as string;
            const vendor_id: number = parseInt(formData.get('vendor_id') as string);
            const vendor_doc_number = formData.get('vendor_doc_number') ;

            let date_time = new Date();

            if (createdString){
                try{
                    date_time = new Date(createdString);
                }
                catch(err: unknown){
                    console.log(err)
                }
            }
            
            if(typeof vendor_doc_number !== 'string' || vendor_doc_number.length < 1){
                return{
                    message: 'vendor_doc_number must be longer'
                };
            }
            
            await db.purchtable.create({
                data:{
                    date_time,
                    vendor_id,
                    vendor_doc_number
                }
            })
        }
        catch(err: unknown){
            if(err instanceof Error){
                if (err.message.includes('Foreign key constraint failed')){
                    return{
                        message: 'There is no any vendor with such id.'
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
    redirect('/purchtable/view');
}

export async function createItemBatch(
    formState: {message: string}, 
    formData: FormData,
    ){
        try{
            const name = formData.get('name') ;
            const description = formData.get('description') as string;
            const item_id: number = parseInt(formData.get('item_id') as string);

            const createdString = formData.get('created') as string;
            const created_by: number = parseInt(formData.get('created_by') as string);

            const quantity: number = parseInt(formData.get('quantity') as string);
            const unit_id: number = parseInt(formData.get('unit_id') as string);

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
            
            const batch = await db.itembatches.create({
                data:{
                    name,
                    description,
                    item_id,
                    created,
                    created_by
                }
            
            })
            await addingFishBatch(batch.id, quantity, unit_id, created_by )

            return {
                message: 'Item batch created successfully'
            };
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
            // await db.itembatches.create({
            //     data:{
            //         name,
            //         description,
            //         item_id,
            //         created,
            //         created_by
            //     }
            // })
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
            if(err instanceof Error){
                if (err.message.includes('Foreign key constraint failed')){
                    return{
                        message: 'There is no any item or purchaseTitle with such id.'
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
    redirect('/purchlines/view');
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

export async function fillDatatable(
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
                await db.datatable.create({
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
        return await db.datatable.findMany()
}

export async function getLines(){
    return await db.productionlines.findMany()
}

export async function getAreas(){
    return await db.productionareas.findMany()
}

export async function showDataTable(){
    const datatable = await db.datatable.findMany();
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
        const fcQuery = await db.datatable.findFirst({
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

            const feedingLevelQuery = await db.datatable.findFirst({
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

    const fcQuery = await db.datatable.findFirst({
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

        const feedingLevelQuery = await db.datatable.findFirst({
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
        const document = await db.documents.create({
            data:{
                location_id: 87, // Початковий склад
                doc_type_id: 8, // Реєстрація партії
                executed_by: created_by
            }
        })
        if (document && document.id !== null) {
            await db.itemtransactions.create({
                data: {
                    doc_id: document.id,
                    location_id: document.location_id || 0, // Встановлюємо значення за замовчуванням, якщо document.location_id === null
                    batch_id: batch_id,
                    quantity: quantity,
                    unit_id: unit_id
                }
            });
        } 
    }
    catch{

    }
}

export async function stockPool(
    formState: { message: string } | undefined,
    formData: FormData
): Promise<{ message: string } | undefined> {
    //console.log(formData);
    try {
        const location_id_from: number = parseInt(formData.get('location_id_from') as string);
        const pool_id_to: number = parseInt(formData.get('location_id_to') as string);
        const batch_id: number = parseInt(formData.get('batch_id') as string);
        const quantity: number = parseInt(formData.get('fish_amount') as string);
        const unit_id: number = parseInt(formData.get('unit_id') as string);
        const average_weight: number = parseFloat(formData.get('average_fish_mass') as string);
        const executed_by: number = parseInt(formData.get('executed_by') as string);
        const comments: string = formData.get('comments') as string;

        const location_id_to = await db.locations.findFirst({
            select: {
                id: true
            },
            where: {
                pool_id: pool_id_to
            }
        });
        //console.log("location_id_to = ", location_id_to)

        if (location_id_to) {
            const doc = await db.documents.create({
                data: {
                    location_id: location_id_to.id, // Отримуємо id локації
                    doc_type_id: 1,
                    date_time: new Date(),
                    executed_by: executed_by,
                    comments: comments
                }
            });

            const pTransaction = await db.itemtransactions.create({
                data: {
                    doc_id: doc.id,
                    location_id: location_id_from,
                    batch_id: batch_id,
                    quantity: -quantity,
                    unit_id: unit_id
                }
            });

            await db.itemtransactions.create({
                data: {
                    doc_id: doc.id,
                    location_id: location_id_to.id,
                    batch_id: batch_id,
                    quantity: quantity,
                    unit_id: unit_id,
                    parent_transaction: pTransaction.id
                }
            });

            await db.stocking.create({
                data: {
                    doc_id: doc.id,
                    average_weight: average_weight
                }
            });
            
            //return { message: 'Success!' };
        }
        
        await createCalcTable(formState, formData)
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
    
    redirect('/prod-areas/view')
}

interface FeedConnection{
    id: number;
    fish_id: number;
    feed_id: number;
    from_fish_weight: number;
    to_fish_weight: number;
}

export async function getFeedForFish(feedconnections: FeedConnection[], fish_weight: number): Promise<number> {
    const connection = feedconnections.find(connection => {
        return fish_weight >= connection.from_fish_weight && fish_weight <= connection.to_fish_weight;
    });
    return connection ? connection.feed_id : 0;
}

