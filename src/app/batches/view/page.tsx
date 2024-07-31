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

    return (
    <div>
        <div>
            <h1 className="text-xl font-bold m-2">Партії</h1>
        </div>
        <div>
            <BatchesComponent batches={batches}/>
        </div>      
    </div>
  );
}