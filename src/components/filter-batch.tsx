'use client'
import Link from 'next/link';
import { useState } from 'react';

interface ContentProps{
  id: number,
  contentLine: string
}
interface TabsProps {
  tabContents: {
    title: string,
    content: ContentProps[]
  }[];
}

const Tabs: React.FC<TabsProps> = ({ tabContents }) => {
  const [activeTab, setActiveTab] = useState(0);

  const changeTab = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };


  return (
    <div className="w-full bg-gray-100 rounded-lg mt-4">
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
              className="flex justify-between items-center p-2 hover:bg-gray-200"
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