'use client'
import { useFormState } from "react-dom";
import * as actions from '@/actions';
import { customers, salestable, saleslines, items, units } from "@prisma/client";
import Image from 'next/image';
import CloseButton from '../../../public/icons/close-square-light.svg'
import { ChangeEvent, useState } from "react";

interface CreateEditSalesLineFormProps{
    header: {
        id: bigint;
        doc_id: bigint | null;
        date_time: Date;
        saleslines: saleslines[],
    },
    items: itemWithUnit[]
}

type itemWithUnit = {
    id: number;
        name: string;
        description: string | null;
        item_type_id: number | null;
        feed_type_id: number | null;
        default_unit_id: number | null;
        parent_item: number | null;
        units: units | null
}

export default function CreateEditSalesHeaderForm({
    header,
    items
} : CreateEditSalesLineFormProps){
    // const [formState, action] = useFormState(actions.createSalesLineRecord, { message: '' });
    // const [UpdateActionState, UpdateAction] = useFormState(actions.updateSalesLines, {message: ''});

    const [chosenItem, setChosenItem ] = useState<itemWithUnit | undefined>(undefined)

    const handleItemChange = (event : ChangeEvent<HTMLSelectElement>) => {
        const item = items.find(item => item.id == Number(event.target.value))
        setChosenItem(item)
    }

    // const handleBatchIdChange = (event: ChangeEvent<HTMLSelectElement>) => {
    //     setBatchId(Number(event.target.value));
    // }
    return(
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-8 rounded shadow-lg w-2/3">
                <div className='flex justify-between items-center mb-8'>
                    <h2 className="text-lg font-semibold text-center">Новий рядок видаткової накладної № {Number(header.id)}</h2>
                    {/* <form action={UpdateAction} className='flex justify-end'> 
                    <input type="hidden" name="header_id" value={String(header?.id)} />
                        <button 
                            type="submit" 
                            className="rounded p-2 hover:bg-red-200"
                            >
                            <Image src={CloseButton} alt='Close Button'/>
                        </button>
                    </form> */}
                    
                </div>
                <form
                    className='flex flex-col flex-wrap gap-4'>
                    <div className="flex flex-wrap gap-4 justify-between">
                        <div className="mb-4 flex flex-col">
                            <label htmlFor="item_id" className="text-gray-700 font-bold mb-2">Товар:</label>
                            <select
                                name="item_id"
                                id="item_id"
                                required
                                className='p-3 border border-gray-200'
                                // value={batchId}
                                onChange={handleItemChange}
                                // disabled={!editionAllowed}
                            >
                                <option>Оберіть...</option>
                                {items.map(item => (
                                    <option key={item.id} value={Number(item.id)}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-4">
                            <label className="text-gray-700 font-bold mb-2" htmlFor="quantity">
                                Чисельність
                            </label>
                            <input 
                                id="quantity" 
                                name="quantity"
                                type="number"
                                required
                                min={0}
                                // defaultValue={quantity} 
                                // onChange={handleQuantityChange}
                                className='p-3 border border-gray-200'
                            />
                        </div>
                        <div className="flex flex-col gap-4">
                            <label className="text-gray-700 font-bold mb-2" htmlFor="unit_id">
                                Одиниця виміру
                            </label>
                            <input 
                            
                                defaultValue={chosenItem && chosenItem.default_unit_id ? chosenItem.units?.name : ''} 
                                // onChange={handleUnitIdChange}
                                className='p-3 border border-gray-200'

                            />
                            <input type="hidden" name="unit_id" value={String(chosenItem?.units?.id)} />
                        </div>
                    </div>
                    <input type="hidden" name="header_id" value={String(header?.id)} />
                    <button type='submit' className='p-2 border rounded bg-blue-200'>
                        Save
                    </button>
                </form>
                {/* {
                    formState && formState.message ? (
                        <div className={`my-2 p-2 border rounded ${formState.message.includes('успішно') ? 'bg-green-200 border-green-400' : 'bg-red-200 border-red-400'}`}>
                            {formState.message}
                        </div>
                    ) : null
                } */}
                
            </div>
        </div>
    )
}