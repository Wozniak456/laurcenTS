import Tabs from '@/components/filter-batch'
import { db } from '@/db';
import { TabContentType } from '@/types/app_types'

interface GeneralType{
    id: number,
    name: string
}


async function App() {
    let itemTypes : GeneralType[] = []
    let items : GeneralType[] = []
    let units : GeneralType[] = []
    let tabContents : TabContentType[] = []

    const individuals = await db.employees.findMany({
        include:{
            individual: {
                select:{
                    id: true,
                    name: true,
                    surname: true
                }
            }
        }
    })


    try {
        itemTypes = await db.itemtypes.findMany({
            where:{
                id:{
                    not: 3
                }
            }
        });

        items = await db.items.findMany({
            where:{
                item_type_id:{
                    in: itemTypes.map(type => type.id)
                }
            }
        })

        units = await db.units.findMany();

        for (const itemType of itemTypes) {
            const itemTypeName = itemType.name; // риба чи корм
    
            const itemBatches = await db.itembatches.findMany({ // усі партії
                select:{
                    id: true,
                    name: true,
                    items:{
                        select:{
                            itemtypes: true
                        }
                    }
                },
                where:{
                    item_id:{
                        in: items.map(item => item.id)
                    }
                },
                orderBy:{
                    id: 'desc'
                }
            });
    
            const tabContent = {
                title: itemTypeName,
                content: itemBatches
                .filter(itembatch => itembatch.items.itemtypes?.name === itemTypeName)
                .map(itemBatch => ({ 
                    id: itemBatch.id, 
                    contentLine: itemBatch.name 
                })) 
            };
    
            tabContents.push(tabContent);
        }
    
        
    } catch (error) {
        console.error('Error fetching tab contents from DB:', error);
    }
  return (
    <div>
        <div className="flex m-2 justify-between items-center">
            <h1 className="text-xl font-bold">Партії
            </h1>
        </div>
      <Tabs tabContents={tabContents} items={items} units={units} individuals={individuals}/>
    </div>
  );
}

export default App;