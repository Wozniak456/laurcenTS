'use client'
import type {productionlines} from '@prisma/client'
import { useState } from 'react';
import * as actions from '@/actions';

interface ProdLineEditFormProps{
    line: productionlines
}

export default function ProdLineEditForm({line} : ProdLineEditFormProps){
    const safeValue: string = line.description !== null ? line.description : '';

    const [description, setDescription] = useState(line.description)

    const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value);
    };

    const editProdLineAction = actions.editProdLine.bind(null, line.id, description)
    return(
        <div className="p-3 border rounded border-gray-200">
            <form action={editProdLineAction}>
                <textarea 
                    id="description" 
                    name="description"
                    defaultValue={safeValue} 
                    onChange={handleTextAreaChange}
                />
                <button type='submit' className='p-2 border rounded'>
                    Save
                </button>
            </form>
            
        </div>
    )
}