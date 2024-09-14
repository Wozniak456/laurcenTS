'use server'
import { db } from "@/db";

export async function getFeedBatchByItemId(item_id: number, quantity: number) {
    
    const batches = await db.itembatches.findMany({
        include:{
            items: true
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

    const batches_quantity_with_price = batches_quantity.map(bq => {
        const batch = batches.find(batch => batch.id === bq.batch_id);
        return {
            ...bq,
            price: batch ? batch.price : null, // Add price if batch is found, otherwise null
            feed_type_id: batch ? batch.items.feed_type_id : null
        };
    });

    console.log('batches_quantity_with_price', batches_quantity_with_price)
    // console.log('batches_quantity', batches_quantity)

    // Якщо в партії не вистачає корму на годування, то брати з іншої партії
    const batches_array = []; // Масив для зберігання партій
    let totalQuantity = 0; // Змінна для зберігання загальної кількості корму
    quantity = quantity / 1000

    console.log('totalQuantity: ', totalQuantity, 'quantity: ', quantity)

    while (totalQuantity < quantity && batches_quantity_with_price.length > 0) {
        //знаходимо партію з найменшим id (найстарішу)
        const minBatch = batches_quantity_with_price.reduce((min, current) => min.batch_id < current.batch_id ? min : current);

        batches_array.push(minBatch);

        if (minBatch._sum?.quantity !== null) {
            totalQuantity += minBatch._sum.quantity;
        }
        if (totalQuantity >= quantity) {
            break;
        }
    
        const minIndex = batches_quantity_with_price.indexOf(minBatch); // Знаходимо індекс поточної партії
        batches_quantity_with_price.splice(minIndex, 1); // Видаляємо поточну партію з масиву
    }
    
    // Перевірка, чи було знайдено необхідну кількість корму
    if (totalQuantity < quantity) {
        throw new Error('Немає достатньо корму');
    }
    else{
        return batches_array;
    }
}