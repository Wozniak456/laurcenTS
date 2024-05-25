'use client'
import { LocationComponentType } from '@/types/app_types';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useFormState } from 'react-dom';
import * as actions from '@/actions';

type PriorityFormType = {
    location: LocationComponentType,
    setShowForm: React.Dispatch<React.SetStateAction<boolean>>,
    priorities: {
        item_id: number;
        item_name: string | undefined;
        location_id: number
    }[]
}

interface SelectedFeeds {
    [key: string]: number;
}

export default function PriorityForm({location, setShowForm, priorities} : PriorityFormType) {
    // const [priority, setpriority] = useState<number | undefined>(undefined);  
    
    const priority = priorities.find(prio => prio.location_id === location?.location.id)
    console.log( priority)
          
    function handleCloseModal() {
        setShowForm(prev => !prev);
    }

    const [formState, action] = useFormState(actions.managePriorities, { message: '' });

    return( 
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-8 rounded shadow-lg w-1/3">
                <h2 className="text-lg font-semibold mb-4">Редагування пріоритетності</h2>
                
                <form  className="mb-4 flex flex-col gap-4" action={action} onSubmit={handleCloseModal}>

                <div className="flex gap-2 items-center justify-center">
                    <h1 className="text-lg font-semibold min-w-24" >
                        {location?.location.name} 
                    </h1>
                    <div className="flex flex-col gap-1">
                        {location?.feed.feed_list
                        ?.map((item, index) => (
                            <div key={index} className="flex items-center">
                                <input 
                                    type="radio" 
                                    id={`feed_${item.item_id}_${index}`} 
                                    name={`feed`} 
                                    value={item.item_id} 
                                    className="mr-2"
                                    defaultChecked={priority?.item_id == item.item_id ? true : false}
                                />
                                <label htmlFor={`feed_${item.item_id}_${index}`} className="text-sm">{item.feed_name}</label>
                            </div>
                        ))}
                    </div>
                    <input type="hidden" name={`location`} value={location?.location.id} />
                </div>
                            
                
                <div className="flex justify-between mt-4">
                    <button 
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        type="submit"
                        >
                        Зберегти
                    </button>
                    <button className="hover:bg-blue-500 hover:text-white border font-bold py-2 px-4 rounded" 
                        onClick={handleCloseModal}>
                        Скасувати
                    </button>
                </div>
                
                </form>
                
            </div>
        </div>
    )
}