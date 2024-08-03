'use server'
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

            // console.log(documents)

            if (documents.length > 0){
                throw new Error('Ця партія задіяна в інших повязаних транзакціях.');
            }

            await db.$transaction(async (prisma) => {
                await prisma.batch_generation.deleteMany({
                where: {
                    initial_batch_id: id
                }
                });
        
                await prisma.itemtransactions.deleteMany({
                where: {
                    doc_id: create_doc_id
                }
                });
        
                await prisma.documents.delete({
                where: {
                    id: create_doc_id
                }
                });
        
                await prisma.itembatches.delete({
                where: { id }
                });
            });

            // console.log('Transaction successful');
            
            // return{message :'Партію видалено!'}
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
        revalidatePath('/batches/view')
        redirect('/batches/view');
}