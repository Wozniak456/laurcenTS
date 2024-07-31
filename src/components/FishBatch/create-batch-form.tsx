'use client'
import * as actions from '@/actions';
import { useFormState } from 'react-dom';
import type {items, units} from '@prisma/client'
import FormButton from '../common/form-button';

import {
    Input,
    Button, 
    Select, 
    SelectItem,
} from '@nextui-org/react'
import { format } from 'path';

type ItemBatchCreateFormProps = {
    items: items[],
    units: units[]
}

export default function ItemBatchCreateForm({items, units} : ItemBatchCreateFormProps){
    
    const [formState, action] = useFormState(actions.createItemBatch, {
        errors: {}
    });

    const [UpdateActionState, UpdateAction] = useFormState(actions.updateBatches, {message: ''});


    {/* <form>
            <div className='flex flex-col gap-4 p-4 w-80'>
              <h3>Create a topic</h3>
              <Input 
                label="Name" 
                labelPlacement='outside' 
                placeholder='Name'/>
              <Textarea 
                label='Description' 
                labelPlacement='outside' 
                placeholder='Describe your topic'/>
                <Button type='submit'>Submit</Button>
            </div>
          </form> */}
    return(
        <div className="p-2 w-full">
            {/* <div className=""> */}
            <h2 className="text-lg font-semibold text-center mb-4">Створення нової партії</h2>
                {/* <div className='flex justify-between gap-4 items-center mb-4'>
                    
                    <form action={UpdateAction} className='flex justify-end'> 
                        <button 
                            type="submit" 
                            className="rounded hover:bg-red-200"
                            >
                            <Image src={CloseButton} alt='Close Button'/>
                        </button>
                    </form>
                </div> */}
                
                <form action={action}>
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4 flex-wrap items-center">
                            {/* <label className="w-40" htmlFor="item_id">
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
                            </select> */}

                            <Select 
                                label="Призначення партії:" 
                                name="item_id"
                                required
                                isInvalid={!!formState.errors && !!formState.errors?.item_id}
                                errorMessage={formState.errors && formState.errors?.item_id}
                                // placeholder="Призначення партії:" 
                                isRequired
                            >
                                {items.map(type => (
                                    <SelectItem key={type.id} value={type.id}>
                                        {type.name}
                                    </SelectItem >
                                ))}
                            </Select>
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
                            {/* <label className="w-40" htmlFor="created">
                                Дата створення:
                            </label> */}
                            
                            {/* <input 
                                name="created"
                                className="border rounded p-2 flex-grow min-w-32"
                                type="date"
                                id="created"
                                required
                            /> */}
                        </div>
                        <div className="flex gap-4 flex-wrap items-center">
                            {/* <label className="w-40" htmlFor="quantity">
                                Кількість:
                            </label>
                            <input 
                                name="quantity"
                                className="border rounded p-2 flex-grow min-w-32"
                                id="quantity"
                                type="number"
                                min={1}
                                required
                            /> */}
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
                            {/* <label className="w-40" htmlFor="unit_id">
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
                            </select> */}

                            <Select 
                                label="Одиниця виміру:" 
                                name="unit_id"
                                required
                                isInvalid={!!formState.errors?.unit_id}
                                errorMessage={formState.errors?.unit_id}
                                isRequired
                                // placeholder="Призначення партії:" 
                            >
                                {units.map(unit => (
                                    <SelectItem key={unit.id} value={unit.id}>
                                        {unit.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                        <input type="hidden" name="created_by" value={3} />
                        
                        
                        {/* {
                            formState && formState.message ? (
                                <div className={`my-2 p-2 border rounded ${formState.message.includes('успішно') ? 'bg-green-200 border-green-400' : 'bg-red-200 border-red-400'}`}>
                                    {formState.message}
                                </div>
                            ) : null
                        } */}
                        <div className='flex justify-center flex-wrap gap-2 inline-block'>
                            {/* <button type="submit" className="rounded p-2 bg-blue-200">
                                Створити
                            </button> */}

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
            {/* </div> */}
        </div>
    )
}
