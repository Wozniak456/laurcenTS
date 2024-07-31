import Link from 'next/link';
import {
  Input,
  Button, 
  Textarea,
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@nextui-org/react'
import BatchCreatePage from '@/app/batches/new/page'

interface BatchesComponentProps {
  batches: {
    id: bigint;
    name: string,
    items: {
        id: number;
        units: {
            name: string;
        } | null;
        name: string;
    };
  }[],
}

export default function BatchesComponent({batches} : BatchesComponentProps) {  
  return (
    <div className="container p-4 w-full bg-gray-100 rounded-lg mt-4">
      <div className='flex justify-end'>
      <Popover placement='left'>
        <PopoverTrigger>
          <Button color='primary' className='z-1'>Add a new batch</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <BatchCreatePage />
        </PopoverContent>
      </Popover>
      </div>

      {/* <div className='flex justify-end'>
        <Link href="/batches/new" className="border p-2 rounded">
        Додати партію
        </Link>
      </div> */}
      
      <div className="p-6">
          <div>
            {batches
            .sort((a, b) => Number(b.id) - Number(a.id))
            .map((batch, batchIndex) => (
              <Link 
              key={batchIndex}
              href={`/batches/${batch.id}`}
              className="flex justify-between items-center p-2 hover:bg-gray-200 border-b border-gray-300 pb-2"
              >
                <div>{batch.name}</div>
                <div className='text-sm text-gray-400'>Перегляд</div>
              </Link>
            ))}
          </div>
     
      </div>
    </div>
  );
};