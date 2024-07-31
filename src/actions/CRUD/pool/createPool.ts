'use server'
import { db } from "@/db";
import { redirect } from "next/navigation";

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