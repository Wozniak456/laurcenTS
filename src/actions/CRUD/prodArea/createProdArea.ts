'use server'
import { db } from "@/db";
import { redirect } from "next/navigation";

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