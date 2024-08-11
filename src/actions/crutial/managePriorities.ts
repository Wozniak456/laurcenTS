'use server'
import { db } from "@/db";
import { revalidatePath } from "next/cache";

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
    revalidatePath(`/summary-feeding/day/${formData.get('date')}`)
    // revalidatePath(`/summary-feeding/day/${formData.get('date')}`)
}