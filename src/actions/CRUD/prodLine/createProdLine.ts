'use server'
import { db } from "@/db";
import { redirect } from "next/navigation";

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