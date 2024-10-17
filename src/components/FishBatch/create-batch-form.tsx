'use client'
import * as actions from '@/actions';
import { useFormState } from 'react-dom';
import type {items, units} from '@prisma/client'
import FormButton from '../common/form-button';

import {
    Input,
} from '@nextui-org/react'

type ItemBatchCreateFormProps = {
    items: items[],
    units: units[]
}

export default function ItemBatchCreateForm({items, units} : ItemBatchCreateFormProps){
    
    const [formState, action] = useFormState(actions.createItemBatch, {
        errors: {}
    });

    return(
        <div className="p-2 w-full">
                <form action={action}>
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4 flex-wrap items-center">
                            <Input 
                                label="Призначення партії:" 
                                // name="item_id"
                                placeholder='Призначення партії:'
                                defaultValue={items.find(item => item.id === 13)?.name}
                                // isInvalid={!!formState.errors?.created}
                                // errorMessage={formState.errors?.created}
                                isRequired
                                isDisabled
                            />
                            <input type="hidden" name="item_id" value={13} />

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
                                label="Одиниця виміру:"
                                // name="item_id"
                                placeholder="Одиниця виміру:"
                                defaultValue={units.find(unit => unit.id === 1)?.name}
                                // isInvalid={!!formState.errors?.created}
                                // errorMessage={formState.errors?.created}
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
