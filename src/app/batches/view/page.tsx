import BatchesComponent from '@/components/filter-batch'
import { db } from '@/db';
import * as actions from '@/actions'

export default async function FishBatchesComponent() {

    const batches = await actions.getCatfishBatches()

    const items = await db.items.findMany({
        where: {
            item_type_id: {
                not: 3
            }
        }
    })

    const units = await db.units.findMany()

    return (
        <div>
            <h1 className="text-xl font-bold m-2">Партії</h1>
            <div>
                <BatchesComponent batches={batches} items={items} units={units} />
            </div>
        </div>
    );
}