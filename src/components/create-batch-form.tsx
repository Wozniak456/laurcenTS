'use client'

import { useFormState } from "react-dom";
import * as actions from '@/actions';

interface BatchCreatePageProps {
    items: { 
        id: number, 
        name: string 
    }[]
}

export default function BatchCreatePage({items: items} : BatchCreatePageProps){
    const [formState, action] = useFormState(actions.createItemBatch, {message: ''});
    return(
        <form action={action} className="container mx-auto bg-gray-200 p-4 rounded w-1/2 shadow-lg">
            <h3 className="font-bold m-3">Create an ItemBatch</h3>
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="name">
                        Name
                    </label>
                    <input 
                        name="name"
                        className="border rounded p-2 w-full"
                        id="name"
                        required
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="description">
                        Description
                    </label>
                    <textarea 
                        name="description"
                        className="border rounded p-2 w-full"
                        id="description"
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="item_id">
                        Item
                    </label>
                    <select
                        name="item_id"
                        className="border rounded p-2 w-full"
                        id="item_id"
                        required
                    >
                        {items.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="created">
                        created at
                    </label>
                    <input 
                        name="created"
                        className="border rounded p-2 w-full"
                        id="created"
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="created_by">
                        created_by
                    </label>
                    <input 
                        name="created_by"
                        className="border rounded p-2 w-full"
                        id="created_by"
                        value={1}
                        required
                    />
                </div>
                
                {
                    formState.message ? (
                        <div className={`my-2 p-2 border rounded ${formState.message.startsWith('Item batch created successfully') ? 'bg-green-200 border-green-400' : 'bg-red-200 border-red-400'}`}>
                            {formState.message}
                        </div>
                    ) : null
                }

                <button type="submit" className="rounded p-2 bg-blue-200">
                    Create
                </button>
            </div>
        </form>
    )
}