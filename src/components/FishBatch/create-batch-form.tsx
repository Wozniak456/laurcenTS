'use client'
import * as actions from '@/actions';
import { useFormState } from 'react-dom';
import type {items, units} from '@prisma/client'
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Image from 'next/image';
import CloseButton from '../../../public/icons/close-square-light.svg'

type ItemBatchCreateFormProps = {
    items: items[],
    units: units[]
}

export default function ItemBatchCreateForm({items, units} : ItemBatchCreateFormProps){
    
    const [formState, action] = useFormState(actions.createItemBatch, {message: ''});

    const [UpdateActionState, UpdateAction] = useFormState(actions.updateBatches, {message: ''});

    return(
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-8 rounded shadow-lg w-2/5">
                <div className='flex justify-between items-center mb-4'>
                    <h2 className="text-lg font-semibold text-center">Створення нової партії</h2>
                    <form action={UpdateAction} className='flex justify-end'> 
                        <button 
                            type="submit" 
                            className="rounded p-2 hover:bg-red-200"
                            >
                            <Image src={CloseButton} alt='Close Button'/>
                        </button>
                    </form>
                    
                </div>
                
                <form action={action}>
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4 flex-wrap items-center">
                            <label className="w-40" htmlFor="item_id">
                                Призначення партії:
                            </label> 
                            <select
                                name="item_id"
                                className="border rounded p-2 flex-grow min-w-32"
                                id="item_id"
                                defaultValue={13}
                                required
                            >
                                {items.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-4 flex-wrap items-center">
                            <label className="w-40" htmlFor="created">
                                Дата створення:
                            </label>
                            <input 
                                name="created"
                                className="border rounded p-2 flex-grow min-w-32"
                                type="date"
                                id="created"
                                required
                            />
                        </div>
                        <div className="flex gap-4 flex-wrap items-center">
                            <label className="w-40" htmlFor="quantity">
                                Кількість:
                            </label>
                            <input 
                                name="quantity"
                                className="border rounded p-2 flex-grow min-w-32"
                                id="quantity"
                                type="number"
                                min={1}
                                required
                            />
                        </div>
                        {/* <input type="hidden" name="batch_id_from" value={String(poolInfo.batch?.batch_id)} /> */}
                        <div className="flex gap-4 flex-wrap items-center">
                            <label className="w-40" htmlFor="unit_id">
                                Одиниця виміру:
                            </label>
                            <select
                                name="unit_id"
                                className="border rounded p-2 flex-grow min-w-32"
                                id="unit_id"
                                required
                            >
                                {units.map(unit => (
                                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                                ))}
                            </select>
                        </div>
                        <input type="hidden" name="created_by" value={3} />
                        {/* <div className="flex gap-4">
                            <label className="w-64" htmlFor="created_by">
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
                        </div>  */}
                        {/* <div className="flex gap-4">
                            <label className="w-64" htmlFor="description">
                                Опис
                            </label>
                            <textarea 
                                name="description"
                                className="border rounded p-2 w-full"
                                id="description"
                            />
                        </div> */}
                        
                        {
                            formState && formState.message ? (
                                <div className={`my-2 p-2 border rounded ${formState.message.includes('успішно') ? 'bg-green-200 border-green-400' : 'bg-red-200 border-red-400'}`}>
                                    {formState.message}
                                </div>
                            ) : null
                        }
                        <div className='flex justify-between flex-wrap gap-2 inline-block'>
                            <button type="submit" className="rounded p-2 bg-green-200">
                                Створити
                            </button>
                           
                        </div>
                    </div>
                </form>
                {/* <Link href="/batches/view" className="border p-2 rounded bg-blue-200">
                    <button type="button">
                        Скасувати
                    </button>
                </Link> */}
                 
                {/* {
                    UpdateActionState && UpdateActionState.message ? (
                        <div className={`my-2 p-2 border rounded ${UpdateActionState.message.includes('успішно') ? 'bg-green-200 border-green-400' : 'bg-red-200 border-red-400'}`}>
                            {UpdateActionState.message}
                        </div>
                    ) : null
                } */}
                
            </div>
        </div>
    )
}
