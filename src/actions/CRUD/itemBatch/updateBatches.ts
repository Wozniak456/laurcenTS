'use server'
import { redirect } from "next/navigation";

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