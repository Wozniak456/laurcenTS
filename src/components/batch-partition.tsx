'use client'

import * as actions from '@/actions';
import { useFormState } from 'react-dom';
import { useEffect, useState } from 'react';
import deleteImg from '../../public/icons/delete.svg'
import Image from 'next/image';
import FormButton from './common/form-button';
import { Button, Input, Select, SelectItem } from '@nextui-org/react';
import { poolManagingType } from '@/types/app_types'
interface PartitionFormPageProps {
    location: {
        id: number;
        location_type_id: number;
        name: string;
        pool_id: number | null;
    },
    poolInfo: poolManagingType | undefined,
    locations: location[]
}

type location = {
    id: number,
    name: string,
    location_type_id: number
}

export default function PartitionFormPage({location, poolInfo, locations} : PartitionFormPageProps) {
    const [selectedPools, setSelectedPools] = useState<(number | null)[]>([]);
    const [formState, action] = useFormState(actions.batchDivision, { message: '' });
  
    const handleDeleteButton = (index: number) => {
        setSelectedPools(selectedPools.filter(item => item !== index))
    };

    const handlePoolChange = (index: number) => {
        return (e: React.ChangeEvent<HTMLSelectElement>) => {
            const selectedPoolId = parseInt(e.target.value);
            setSelectedPools(prevSelectedPools => {
                const updatedSelectedPools = [...prevSelectedPools];
                updatedSelectedPools[index] = selectedPoolId;
                const uniqueSelectedPools = Array.from(new Set(updatedSelectedPools.filter(pool => pool !== null)));
    
                return uniqueSelectedPools;
            });
        };
    };

    return (
        <form className="" action={action} onSubmit={() => {actions.updatePoolManaging}}>
            <div className="mb-4">
                <input type="hidden" name="location_id_from" value={location.id} />
            </div>
            <div className="mb-4 flex flex-col items-center">
                <div className='flex flex-col my-4'>
                    <p className="font-semibold text-base mb-8">Басейни для розподілу:</p>
                    <input type="hidden" name="batch_id_from" value={String(poolInfo?.batch?.id)} />
                    <input type="hidden" name="fish_qty_in_location_from" value={poolInfo?.qty} />
                    {/* яка попередня сер вага */}
                    <input type="hidden" name="old_average_fish_mass" value={poolInfo?.fishWeight} /> 
                    
                    {selectedPools.map((selectedPoolId, index) => {
                        
                        return (
                            <div key={index} className='flex mb-4'>
                                <div className="flex w-[34px]">
                                    <button
                                        className={`hover:bg-red-100 mr-2 rounded ${!selectedPoolId ? 'hidden' : ''} `}
                                        onClick={() => {
                                            if (selectedPoolId !== null) {
                                                handleDeleteButton(selectedPoolId);
                                            }
                                        }}
                                        type="button"
                                    >
                                        <Image
                                            src={deleteImg}
                                            alt="Delete"
                                            width={30}
                                            height={30}
                                            className=""
                                        />
                                    </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 justify-between w-full">
                                <div className='w-1/2'>
                                    <Select 
                                        label="Басейн:" 
                                        name={`location_id_to_${index}`}
                                        isRequired
                                        onChange={handlePoolChange(index)}
                                    >
                                        {locations
                                            .filter(location => location.location_type_id === 2)
                                            .sort((a, b) => a.id - b.id)
                                            .map((location, index) => (
                                                <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                                            ))}
                                    </Select>
                                    </div>
                                    <div className='w-2/5'>
                                    <Input 
                                        placeholder='Кількість:'
                                        
                                        name={`stocking_fish_amount_${index}`}
                                        type='number'
                                        min={1}
                                        isRequired
                                    />
                                    </div>
                                </div>
                                
                                
                            </div>
                        )
                    })}
                    {selectedPools.length > 0 &&
                        <Input 
                            placeholder='Сер. вага:'
                            name="average_fish_mass"
                            type='number'
                            min={1}
                            isRequired
                        />
                    }
                </div>
                
                
                <div className='flex justify-around m-4 w-full'>
                    <Button color='primary' onClick={() => setSelectedPools([...selectedPools, null])}> 
                        Додати басейн
                    </Button>
                    {selectedPools.length > 0 && selectedPools[0] !== null &&
                    <FormButton color='primary'>
                        Розділити
                    </FormButton>
                    }
                </div>
            </div>
            {
                formState && formState.message && <div className="my-2 p-2 bg-red-200 border rounded border-red-400">{formState.message}</div>
            }
        </form>
    );
}

