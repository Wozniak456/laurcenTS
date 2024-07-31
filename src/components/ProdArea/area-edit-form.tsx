'use client'
import type {productionareas} from '@prisma/client'
import { useState } from 'react';
import * as actions from '@/actions';

interface ProdAreaEditFormProps{
    area: productionareas
}

export default function ProdAreaEditForm({area} : ProdAreaEditFormProps){
    const safeValue: string = area.description !== null ? area.description : '';

    const [description, setDescription] = useState(area.description)

    const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value);
    };

    const editProdAreaAction = actions.editProdArea.bind(null, area.id, description)

    return(
        <div className="p-3 border rounded border-gray-200">
            <div className='flex gap-4 items-center min-w-full'>
                <label className='self-start p-2'>
                    <b>Edit description:</b>
                </label>
                <textarea 
                    id="description" 
                    name="description"
                    defaultValue={safeValue} 
                    onChange={handleTextAreaChange}
                    cols={50}
                    rows={3}
                    className='border p-2'
                />
            </div>
            <form action={editProdAreaAction}>
                <button type='submit' className='p-2 border rounded'>
                    Save
                </button>
            </form>
            
        </div>
    )
}