'use client'

import { useFormState } from "react-dom";
import * as actions from '@/actions';

interface BatchCreatePageProps {
    items: { 
        id: number, 
        name: string 
    }[],
    units:{
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

export default function BatchCreatePage({items, units, individuals} : BatchCreatePageProps){
    const [formState, action] = useFormState(actions.createItemBatch, {message: ''});
    return(
        <form action={action} className="container mx-auto bg-gray-200 p-4 rounded w-1/2 shadow-lg">
            <h3 className="font-bold m-3">Створити партію</h3>
            <div className="flex flex-col gap-4">
                                
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="item_id">
                        Призначення партії
                    </label>
                    <select
                        name="item_id"
                        className="border rounded p-2 w-full"
                        id="item_id"
                        defaultValue={13}
                        required
                    >
                        {items.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="created">
                        Дата створення
                    </label>
                    <input 
                        name="created"
                        className="border rounded p-2 w-full"
                        type="date"
                        id="created"
                        
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="quantity">
                        Кількість
                    </label>
                    <input 
                        name="quantity"
                        className="border rounded p-2 w-full"
                        id="quantity"
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="unit_id">
                        Одиниця виміру
                    </label>
                    <select
                        name="unit_id"
                        className="border rounded p-2 w-full"
                        id="unit_id"
                        required
                    >
                        {units.map(unit => (
                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="created_by">
                        Ким створено 
                    </label>
                    <select
                        name="created_by"
                        className="border rounded p-2 w-full"
                        id="created_by"
                        required
                    >
                        {individuals.map(employee => (
                            <option key={employee.id} value={employee.id}>{employee.individual.name} {employee.individual.surname}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="description">
                        Опис
                    </label>
                    <textarea 
                        name="description"
                        className="border rounded p-2 w-full"
                        id="description"
                    />
                </div>
                
                {/* {
                    formState.message ? (
                        <div className={`my-2 p-2 border rounded ${formState.message.startsWith('Item batch created successfully') ? 'bg-green-200 border-green-400' : 'bg-red-200 border-red-400'}`}>
                            {formState.message}
                        </div>
                    ) : null
                } */}

                <button type="submit" className="rounded p-2 bg-blue-200">
                    Create
                </button>
            </div>
        </form>
    )
}