import Tabs from '@/components/filter-batch'
import { db } from '@/db';
import Link from 'next/link';

async function App() {
    let tabContents : any[] = []
    const allItemBatches = await db.itembatches.findMany({ select: { id: true, name: true } });
        tabContents.push({
            title: 'Усі партії',
            content: allItemBatches.map(itemBatch => ({ id: itemBatch.id, contentLine: itemBatch.name })) // Змінено структуру об'єкта content
        });
    try {
        const itemTypes = await db.itemtypes.findMany({ select: { name: true } });

        for (const itemType of itemTypes) {
            const itemTypeName = itemType.name;
    
            const itemBatches = await db.itembatches.findMany({
                select: { id: true, name: true }, 
                where: {
                    items: {
                        itemtypes: { name: itemTypeName }
                    }
                }
            });
    
            const tabContent = {
                title: itemTypeName,
                content: itemBatches.map(itemBatch => ({ id: itemBatch.id, contentLine: itemBatch.name })) // Змінено структуру об'єкта content
            };
    
            tabContents.push(tabContent);
        }
    
        
    } catch (error) {
        console.error('Error fetching tab contents from DB:', error);
    }
  return (
    <div>
        <div className="flex m-2 justify-between items-center">
        <h1 className="text-xl font-bold">Партії</h1>
        <Link href="/batches/new" className="border p-2 rounded">
          New
        </Link>
      </div>
      <Tabs tabContents={tabContents} />
    </div>
  );
}

export default App;