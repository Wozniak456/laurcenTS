'use client'

import EditButton from '../../../public/icons/edit.svg'
import SaveButton from '../../../public/icons/Save.svg'
import Image from 'next/image'
import { ChangeEvent, useEffect, useState } from 'react'
import { itembatches } from "@prisma/client";
import { useFormState } from 'react-dom'
import * as actions from '@/actions';
import { Input, Select, SelectItem } from '@nextui-org/react'

interface Pool{
    id: number,
    name: string
}

type PoolInfoProps = {
    location: {
        id: number;
        location_type_id: number;
        name: string;
        pool_id: number | null;
    },
    poolInfo: {
        batch: {
            id: bigint;
            name: string;
        } | undefined;
        qty: number | undefined;
        fishWeight: number | undefined;
        feedType: {
            id: number;
            name: string;
            feedconnection_id: number | null;
        } | null | undefined;
        updateDate: string | undefined;
        allowedToEdit: boolean;
    },
    batches: itembatches[]
}

export default function PoolInfoComponent({location, poolInfo, batches} : PoolInfoProps){
    const [editionAllowed, setEditionAllowed] = useState<boolean>(false)

    const initialBatchId = Number(poolInfo.batch?.id);
    const initialCount = Number(poolInfo.qty);
    const initialAvMass = Number(poolInfo.fishWeight);

    // Стан для змінних
    const [batchId, setBatchId] = useState<number>(Number(poolInfo.batch?.id));
    const [count, setCount] = useState<number>( Number(poolInfo.qty));
    const [avMass, setAvMass] = useState<number>(Number(poolInfo.fishWeight));

    const handleBatchIdChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setBatchId(Number(event.target.value));
    }

    const handleCountChange = (event: ChangeEvent<HTMLInputElement>) => {
        setCount(Number(event.target.value));
    }

    const handleAvMassChange = (event: ChangeEvent<HTMLInputElement>) => {
        setAvMass(Number(event.target.value));
    }

    const [formState, updatePoolInfoAction] = useFormState(actions.updateCurrentPoolState, { message: '' })

    return (
        <div className='w-full'>
            <div className='flex gap-4 flex-wrap'> 
                    <Select 
                        label="Партія" 
                        name="batch_id"
                        className={`focus:outline-none focus:ring focus:border-blue-300 ${
                            !editionAllowed ? 'text-gray-800 opacity-90 cursor-not-allowed' : 'border-gray-900'
                          }`}
                        // isInvalid={!!formState.errors?.unit_id}
                        // errorMessage={formState.errors?.unit_id}
                        isRequired
                        value={batchId}
                        onChange={handleBatchIdChange}
                        disabled={!editionAllowed} 
                    >
                        {batches.map(batch => (
                            <SelectItem key={Number(batch.id)} value={Number(batch.id)}>{batch.name}</SelectItem>
                        ))}
                    </Select>
                    <Input 
                        label="Кількість:" 
                        name="quantity"
                        value={count.toString()}
                        type='number'
                        onChange={handleCountChange}
                        disabled={!editionAllowed}
                        isRequired
                        className={`focus:outline-none focus:ring focus:border-blue-300 ${
                            !editionAllowed ? ' text-gray-800 opacity-90 cursor-not-allowed' : 'border-gray-900'
                          }`}
                    />
                    <Input 
                        label="Сер. вага, г" 
                        name="fishWeight"
                        type='number'
                        min={0.0001}
                        step="any"
                        value={avMass.toFixed(1)}
                        onChange={handleAvMassChange}
                        disabled={!editionAllowed}
                        className={`focus:outline-none focus:ring focus:border-blue-300 ${
                            !editionAllowed ? 'text-gray-800 opacity-90 cursor-not-allowed' : 'border-gray-900'
                        }`}
                        isRequired
                    />             
            </div>
            {poolInfo.allowedToEdit &&
            <div className='flex gap-4'>
                <button 
                    className="hover:bg-blue-100 font-bold rounded transition duration-100 ease-in-out transform active:scale-75 active:shadow-none hover:shadow-lg"
                    type='button'
                    onClick={()=>{setEditionAllowed(!editionAllowed)}}

                >
                    <Image src={EditButton} alt='Edit' height={30} width={30}/>
                </button>
                {editionAllowed && 
                <form 
                    className='flex content-center' 
                    action={updatePoolInfoAction}
                    onSubmit={() => {setEditionAllowed(false)}}
                 >
                    {/* <input type="hidden" name="location_id_from" value={poolInfo.location_id} /> */}
                    <input type="hidden" name="location_id_to" value={location.id} />

                    {batchId != initialBatchId && <input type="hidden" name="batch_id_before" value={initialBatchId} />}
                    {count != initialCount && <input type="hidden" name="fish_amount_before" value={initialCount} />}
                    {avMass != initialAvMass && <input type="hidden" name="average_fish_mass_before" value={initialAvMass} />}
                    
                    <input type="hidden" name="fish_amount" value={count} />
                    <input type="hidden" name="batch_id" value={batchId} />
                    <input type="hidden" name="average_fish_mass" value={avMass} />
                    <button 
                        className="hover:bg-blue-100 font-bold rounded transition duration-100 ease-in-out transform active:scale-75 active:shadow-none hover:shadow-lg"
                        type='submit'

                    >
                        <Image src={SaveButton} alt='Save' height={30} width={30}/>
                    </button>
                </form>}
                {
                    formState && formState.message ? (
                        <div className={`my-2 p-2 border rounded ${formState.message.includes('успішно') ? 'bg-green-200 border-green-400' : 'bg-red-200 border-red-400'}`}>
                            {formState.message}
                        </div>
                    ) : null
                }
            </div>}
            
        </div>
      );
}
