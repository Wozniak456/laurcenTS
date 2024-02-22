'use server'
import { db } from "@/db";
import caviarRegistering from "@/db/functions"
import { error } from "console";
import { RedirectType, redirect } from "next/navigation";

export async function editProdArea(id: number, description: string | null ) {
    await db.productionareas.update({
        where: {id},
        data: {description}
    });
    redirect(`/prod-areas/${id}`)
}

export async function editProdLine(id: number, description: string | null ) {
    await db.productionlines.update({
        where: {id},
        data: {description}
    });
    redirect(`/prod-lines/${id}`)
}

export async function editItemBatch(
    id: bigint,
    description: string | null,
    item_id: number,
    created: Date,
    created_by: number | null
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
    redirect(`/caviar/${id}`);
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
    await db.pools.delete({
        where: {id}
    });
    redirect('/pools/view')
}

export async function deleteItemBatch(id: bigint) {
    await db.itembatches.delete({
        where: {id}
    });
    redirect('/caviar/view')
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

export async function createProdLine(
    formState: {message: string}, 
    formData: FormData){
        try{
            const prod_area_idString = formData.get('prod_area_id');
            const name = formData.get('name') ;
            const description = formData.get('description') as string;
    
            let prod_area_id: number;

            prod_area_id = parseInt(prod_area_idString as string);
    
            if(typeof name !== 'string' || name.length < 1){
                return{
                    message: 'Name must be longer'
                };
            }
    
            await db.productionlines.create({
                data:{
                    prod_area_id,
                    name,
                    description 
                }
            })
        }
        catch(err: unknown){
            if(err instanceof Error){
                if (err.message.includes('Unique constraint failed')) {
                    return {
                        message: 'A production line with this name already exists.'
                    };
                }
                else if (err.message.includes('Foreign key constraint failed')){
                    return{
                        message: 'There is no any production area with such id.'
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
    redirect('/prod-lines/view');
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

export async function createPool(
    formState: {message: string}, 
    formData: FormData){
        try{
            const prod_line_id: number = parseInt(formData.get('prod_line_id') as string);
            const name = formData.get('name') ;
            const description = formData.get('description') as string;
            const cleaning_frequency: number = parseInt(formData.get('cleaning_frequency') as string);

            const water_temperature: number = parseInt(formData.get('water_temperature') as string);
            const x_location: number = parseInt(formData.get('x_location') as string);
            const y_location: number = parseInt(formData.get('y_location') as string);
            const pool_height: number = parseInt(formData.get('pool_height') as string);
            const pool_width: number = parseInt(formData.get('pool_width') as string);
            const pool_length: number = parseInt(formData.get('pool_length') as string);
    
            if(typeof name !== 'string' || name.length < 1){
                return{
                    message: 'Name must be longer'
                };
            }
    
            await db.pools.create({
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
    redirect('/pools/view');
}