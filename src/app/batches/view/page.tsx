import BatchesComponent from '@/components/filter-batch'
import { db } from '@/db';

export default async function FishBatchesComponent() {

    const batches = await db.itembatches.findMany({
        select:{
            id: true,
            name: true,
            items:{
                select:{
                    id: true,
                    name: true,
                    units:{
                        select:{
                            name: true
                        }
                    }
                }
            },
            
        },
        where:{
            items:{
                item_type_id: 1 // риба
            }
        }
    })

    const items = await db.items.findMany({
        where:{
            item_type_id: {
                not: 3
            }
        }
    })
    const units = await db.units.findMany()

    return (
    <div>
        <div>
            <h1 className="text-xl font-bold m-2">Партії</h1>
        </div>
        <div>
            <BatchesComponent batches={batches} items={items} units={units}/>
        </div>      
    </div>
  );
}