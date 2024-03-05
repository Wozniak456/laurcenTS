'use client'
import Link from 'next/link';
import { useState } from 'react';
import BatchCreateForm from '@/components/create-batch-form';

interface ContentProps{
  id: number,
  contentLine: string
}
interface TabsProps {
  tabContents: {
    title: string,
    content: ContentProps[]
  }[],
  items:{
    id: number,
    name: string
  }[],
  units: {
    id: number,
    name: string
  }[]
}

const Tabs: React.FC<TabsProps> = ({ tabContents, items, units }) => {
  const [isCreateFormVisible, setCreateFormVisible] = useState(false);
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
        <button 
          onClick={() => setCreateFormVisible(prevState => !prevState)}
          className="bg-gray-500 hover:bg-yellow-900 text-white py-2 px-2 rounded mb-4 w-fit ">
          Додати партію
        </button>
      </div>
      {isCreateFormVisible && <BatchCreateForm items={items} units={units}/>}
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
                <div>View</div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;