'use client'
import type {itembatches} from '@prisma/client'
import { useState } from 'react';
import * as actions from '@/actions';

interface ItemBatchEditFormProps{
    itembatch: itembatches
}

export default function ItemBatchEditForm({itembatch} : ItemBatchEditFormProps){
    const [description, setDescription] = useState(itembatch.description)
    const [item_id, setItemId] = useState(itembatch.item_id)
    const [created, setCreated] = useState(itembatch.created)
    const [created_by, setCreatedBy] = useState(itembatch.created_by)

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value);
    };

    const handleItemIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setItemId(parseInt(event.target.value));
    };

    const handleCreatedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCreated(new Date(event.target.value));
    };

    const handleCreatedByChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCreatedBy(parseInt(event.target.value));
    };

    const editItemBatchAction = actions.editItemBatch.bind(null, itembatch.id, description, item_id, created, created_by)
    
    return(
        <div className="p-3 border rounded border-gray-200">
            <form action={editItemBatchAction} className='flex flex-col'>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="description">
                        Description
                    </label>
                    <textarea 
                    id="description" 
                    name="description"
                    defaultValue={description !== null ? description.toString() : ''} 
                    onChange={handleDescriptionChange}
                    className='p-3 border border-gray-200'
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="item_id">
                        item_id
                    </label>
                    <input 
                    id="item_id" 
                    name="item_id"
                    defaultValue={item_id} 
                    onChange={handleItemIdChange}
                    className='p-3 border border-gray-200'
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="created">
                        created
                    </label>
                    <input 
                    id="created" 
                    name="created"
                    defaultValue={created.toISOString()}
                    onChange={handleCreatedChange}
                    className='p-3 border border-gray-200'
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="created_by">
                        created_by
                    </label>
                    <input 
                    id="created_by" 
                    name="created_by"
                    defaultValue={created_by !== null ? String(created_by) : ''}
                    onChange={handleCreatedByChange}
                    className='p-3 border border-gray-200'
                    />
                </div>
        
                <button type='submit' className='p-2 border rounded'>
                    Save
                </button>
            </form>
        </div>
    )
}