'use client'
import * as actions from '@/actions';
import { useFormState } from 'react-dom';
import type {items, units} from '@prisma/client'
import FormButton from '../common/form-button';

import {
    Input,
} from '@nextui-org/react'
import { useEffect, useState } from 'react';

export default function ItemBatchCreateForm(){
    
    const [formState, action] = useFormState(actions.createItemBatch, {
        errors: {}
    });

    const [defaultFishItem, setDefaultFishItem] = useState<null | items>(null)
    const [units, setUnits] = useState<null | units[]>(null)

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const item = await actions.getItemById(13);
                setDefaultFishItem(item);
            } catch (error) {
                console.error('Error fetching content:', error);
            }
        };
        const fetchUnits = async () => {
            try {
                const units = await actions.getUnits();
                setUnits(units);
            } catch (error) {
                console.error('Error fetching content:', error);
            }
        };
    
        fetchItem();
        fetchUnits()
    }, []);

    return(
        <div className="p-2 w-full">
            <form action={action}>
                <div className="flex flex-col gap-4">
                    <div className="flex gap-4 flex-wrap items-center">
                        <Input 
                            key={defaultFishItem?.id}
                            label="Призначення партії:" 
                            placeholder='Призначення партії:'
                            value={defaultFishItem?.name || ''} // Ensure it's always a string
                            isRequired
                            isDisabled
                        />
                        <input type="hidden" name="item_id" value={defaultFishItem?.id || ''} />

                    </div>
                    <div className="flex gap-4 flex-wrap items-center">
                        <Input 
                            label="Дата створення:" 
                            name="created"
                            placeholder='Дата створення:'
                            type='date'
                            isInvalid={!!formState.errors?.created}
                            errorMessage={formState.errors?.created}
                            isRequired
                        />
                    </div>
                    <div className="flex gap-4 flex-wrap items-center">
                        <Input 
                            label="Кількість:" 
                            name="quantity"
                            // type='number'
                            // min={1}
                            isInvalid={!!formState.errors?.quantity}
                            errorMessage={formState.errors?.quantity}
                            isRequired
                        />
                    </div>
                    <div className="flex gap-4 flex-wrap items-center">
                    <Input 
                        key={defaultFishItem?.default_unit_id} 
                        label="Одиниця виміру:"
                        placeholder="Одиниця виміру:"
                        value={units?.find(unit => unit.id === defaultFishItem?.default_unit_id)?.name || ''} // Ensure it's always a string
                        isRequired
                        isDisabled
                    />

                        <input type="hidden" name="unit_id" value={1} />
                        
                    </div>
                    <input type="hidden" name="created_by" value={3} />
                    
                    <div className='flex justify-center flex-wrap gap-2 inline-block'>
                        {formState.errors._form 
                        ?   <div className='p-2 bg-red-200 border rouded border-red-400'>
                                {formState.errors._form?.join(', ')}
                            </div> 
                        :   null}

                        <FormButton color='primary'>
                            Save
                        </FormButton>
                        
                    </div>
                </div>
            </form>
        </div>
    )
}
