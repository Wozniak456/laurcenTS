'use client'

import * as actions from '@/actions';
import { useFormState } from 'react-dom';
import { useEffect, useState } from 'react';
import deleteImg from '../../public/icons/delete.svg'
import Image from 'next/image';
import {  poolInfo, disposalItem } from '@/types/app_types'

interface PartitionFormPageProps {
    location: {
        id: number;
        location_type_id: number;
        name: string;
        pool_id: number | null;
    },
    poolInfo: {
        batchId: bigint | undefined;
        batchName: string | undefined;
        qty: number | undefined;
        fishWeight: number | undefined;
        feedType: string | undefined;
        updateDate: string | undefined;
        allowedToEdit: boolean;
    }
    locations: location[]
}

type location = {
    id: number,
    name: string,
    location_type_id: number
}

type batchInfo = {
    batch_name: string | undefined,
    batch_id: bigint | undefined,
    qty: number
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

    // useEffect(() => {console.log(selectedPools)}, [selectedPools])

    return (
        <form className="container mx-auto px-4 py-4 m-4 bg-white shadow-md rounded-lg" action={action}>
            {/* <h1 className="font-bold mb-4 text-center text-base">Форма поділу партії</h1> */}
            <div className="mb-4">
                <input type="hidden" name="location_id_from" value={location.id} />
            </div>
            <div className="mb-4 flex flex-col items-center">
                <div className='flex flex-col my-4'>
                    <p className="font-semibold text-base mb-8">Басейни для розподілу:</p>
                    <input type="hidden" name="batch_id_from" value={String(poolInfo.batchId)} />
                    <input type="hidden" name="fish_qty_in_location_from" value={poolInfo.qty} />
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
                                <div className='flex flex-wrap gap-4'>
                                    <div className='flex items-center gap-2'>
                                        <div className="w-24">
                                            <label htmlFor={`location_id_to_${index}`}>
                                                Басейн:
                                            </label>
                                        </div> 
                                        
                                        <select
                                            name={`location_id_to_${index}`}
                                            className="border rounded p-2 max-w-40"
                                            id={`location_id_to_${index}`}
                                            required
                                            onChange={handlePoolChange(index)}
                                            value={selectedPoolId !== null ? selectedPoolId.toString() : ""}
                                        >
                                            <option value="" disabled hidden>Виберіть басейн</option>
                                            {locations
                                                .filter(location => location.location_type_id === 2)
                                                .sort((a, b) => a.id - b.id)
                                                .map((location, index) => (
                                                    <option key={index} value={location.id}>{location.name}</option>
                                                ))}
                                        </select>
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <div className="w-24">
                                            <label className="" htmlFor={`stocking_fish_amount_${index}`}>
                                                Кількість:
                                            </label>
                                        </div>
                                        <input
                                            name={`stocking_fish_amount_${index}`}
                                            className="border rounded p-2  max-w-40"
                                            id={`stocking_fish_amount_${index}`}
                                            type='number'
                                            min={1}
                                            // max={poolInfo.batch?.qty}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                
                            </div>
                        )
                    })}
                    {selectedPools.length > 0 &&
                        <div className='ml-[34px] flex gap-2 items-center'>
                            <div className="min-w-24">
                                <label className="" htmlFor="average_fish_mass">
                                    Сер. вага:
                                </label>
                            </div>
                            
                            <input
                                name="average_fish_mass"
                                className="border rounded p-2 w-full"
                                id="average_fish_mass"
                                required
                            />
                        </div>
                    }
                </div>
                
                
                <div className='flex justify-around m-4 w-full'>
                    <button 
                        type="button" 
                        className="rounded p-2 bg-blue-200 hover:bg-blue-300"
                        onClick={() => setSelectedPools([...selectedPools, null])}
                    >
                        Додати басейн
                    </button>
                    {selectedPools.length > 0 && selectedPools[0] !== null &&
                    <button
                    type="submit"
                    className="rounded p-2 bg-blue-200 hover:bg-blue-300"
                    >
                    Розділити
                    </button> 
                    }
                </div>
            </div>
            {
                formState && formState.message && <div className="my-2 p-2 bg-red-200 border rounded border-red-400">{formState.message}</div>
            }
        </form>
    );
}

