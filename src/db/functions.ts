import { db } from "@/db";

export default async function caviarRegistering(locationId: number, executedBy: number, purchId: number, comments?: string)
: Promise<bigint | null> {
    console.log('we are in caviarRegistering')
    let batchId: bigint | null = null;

    try {
        const date = await db.purchtable.findFirst({
            where: { id: purchId },
            select: { date_time: true },
        });
        if (date) {
            const { date_time } = date;
            const doc_type_id = 4; // реєстрація ікри 
            const doc = await db.documents.create({
                data: {
                    location_id: locationId,
                    doc_type_id: doc_type_id,
                    date_time: date_time,
                    executed_by: executedBy,
                    comments: comments,
                },
            });

            const insertedId = doc.id;

            const purchaseLines = await db.purchaselines.findMany({
                where: {
                    purchase_id: purchId,
                    quantity: {
                        gt: 0,
                    },
                },
            });

            purchaseLines.forEach(async (purchaseLine) => {
                const itemId = purchaseLine.item_id;
                
                await db.purchtable.update({
                    where: { id: purchId },
                    data: { doc_id: insertedId },
                });

                const vendorId = await db.purchtable.findFirst({
                    where: { doc_id: insertedId },
                    select: { vendor_id: true },
                });
            
                const vendorDocNumber = await db.purchtable.findFirst({
                    where: { doc_id: insertedId },
                    select: { vendor_doc_number: true },
                });

                console.log('insertedId: ', insertedId)

                const formattedDate = date_time.toISOString().split('T')[0];
                
                console.log('vendorIdValue', vendorId)
                console.log('vendorDocNumberValue', vendorDocNumber)
                
                const batch = await db.itembatches.create({
                    data: {
                        name: `CA-${formattedDate}-${vendorId?.vendor_id}-${vendorDocNumber?.vendor_doc_number}-${itemId}`,
                        item_id: itemId,
                        created: new Date(),
                        created_by: executedBy,
                    },
                });

                const batchId = batch.id;
            
                const unitId = await db.items.findFirst({
                    where: { id: itemId },
                    select: { default_unit_id: true },
                });

                let transaction = null;

                if (unitId && unitId.default_unit_id !== null) {
                    transaction = await db.itemtransactions.create({
                        data: {
                            doc_id: insertedId,
                            location_id: locationId,
                            batch_id: batchId,
                            quantity: purchaseLine.quantity,
                            unit_id: unitId.default_unit_id,
                        },
                    });

                    const tranId = transaction.id;
            
                    await db.purchaselines.update({
                        where: {
                            id: purchaseLine.id,
                        },
                        data: {
                            item_transaction_id: tranId,
                        },
                    });
                }
            });
        }
    } catch (error) {
        console.error("An unexpected error occurred:", error);
    } finally {
        await db.$disconnect();
        return batchId;
    }
}
