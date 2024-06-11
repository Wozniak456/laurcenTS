'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TabContentType } from '@/types/app_types'

interface ContentProps{
  id: number,
  contentLine: string
}
interface TabsProps {
  tabContents: TabContentType[],
  items:{
    id: number,
    name: string
  }[],
  units: {
    id: number,
    name: string
  }[],
  individuals: {
    id: number;
    individual_id: number;
    empl_position_id: number | null;
    date_from: Date | null;
    date_to: Date | null;
    individual: {
        id: number;
        name: string;
        surname: string;
    };
}[]
}

const Tabs: React.FC<TabsProps> = ({ tabContents, items, units, individuals }) => {
  // const [isCreateFormVisible, setCreateFormVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const changeTab = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };


  return (
    <div className="container p-4 w-full bg-gray-100 rounded-lg mt-4">
      <div className="flex">
        {tabContents.map((content, index) => (
          <div
            key={index}
            className={`cursor-pointer px-6 py-3 border-b-2 ${
              activeTab === index
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => changeTab(index)}
          >
            {content.title}
          </div>
        ))}
      </div>
      <div className='flex justify-end'>
        <Link href="/batches/new" className="border p-2 rounded">
        Додати партію
        </Link>
      </div>
      
      <div className="p-6">
        {tabContents.map((content, index) => (
          <div
            key={index}
            className={`${activeTab === index ? 'block' : 'hidden'}`}
          >
            {content.content.map((item, itemIndex) => (
              <Link 
              key={itemIndex}
              href={`/batches/${item.id}`}
              className="flex justify-between items-center p-2 hover:bg-gray-200 border-b border-gray-300 pb-2"
              >
                <div>{item.contentLine}</div>
                <div className='text-sm text-gray-400'>Перегляд</div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;