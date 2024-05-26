'use client'

import * as actions from '@/actions';
import { useFormState } from 'react-dom';
import { useEffect, useState } from 'react';
import deleteImg from '../../public/icons/delete.svg'
import Image from 'next/image';

interface PartitionFormPageProps {
    poolInfo: {
        batch: batchInfo | null;
        calc: {
            fish_weight: number;
        } | null;
        feed_type_id: string | null | undefined,
        location_id: number;
    },
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

export default function PartitionFormPage({poolInfo, locations} : PartitionFormPageProps) {
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
        <form className="container mx-auto px-4 py-8 m-4 bg-white shadow-md rounded-lg" action={action}>
            <h1 className="text-2xl font-bold mb-4">Форма поділу партії</h1>
            <div className="mb-4">
                <label className="text-lg" htmlFor="location_id_from">
                Звідки: {locations.find(loc => loc.id === poolInfo.location_id)?.name}
                </label>
                <input type="hidden" name="location_id_from" value={poolInfo.location_id} />
            </div>
            <div className="mb-4">
                <p className="text-lg font-semibold mb-2">Басейни для розподілу:</p>
                <input type="hidden" name="batch_id_from" value={String(poolInfo.batch?.batch_id)} />
                <input type="hidden" name="fish_qty_in_location_from" value={poolInfo.batch?.qty} />
                {selectedPools.map((selectedPoolId, index) => {
                    
                    return (
                        <div key={index} className='flex gap-4'>
                           <div>
                                <label className="text-lg" htmlFor={`location_id_to_${index}`}>
                                    Басейн:
                                </label>
                                <select
                                    name={`location_id_to_${index}`}
                                    className="border rounded p-2 w-full"
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
                            <div>
                                <label className="text-lg" htmlFor={`stocking_fish_amount_${index}`}>
                                    Скільки рибин:
                                </label>
                                <input
                                    name={`stocking_fish_amount_${index}`}
                                    className="border rounded p-2 w-full"
                                    id={`stocking_fish_amount_${index}`}
                                    max={poolInfo.batch?.qty}
                                    required
                                />
                            </div>
                            {selectedPoolId && 
                            <div className='flex items-end'>
                                <button 
                                className="hover:bg-red-100 rounded " 
                                onClick={() => handleDeleteButton(selectedPoolId)}
                                type="button"
                                >
                                    <Image
                                        src={deleteImg}
                                        alt="Delete"
                                        width={43}
                                        height={43}
                                        className='self-end'
                                    />
                                </button>
                            </div>
                            }
                        </div>
                    )
                })}
                {selectedPools.length > 0 &&
                    <div>
                        <label className="text-lg" htmlFor="average_fish_mass">
                            Середня вага:
                        </label>
                        <input
                            name="average_fish_mass"
                            className="border rounded p-2 w-full"
                            id="average_fish_mass"
                            required
                        />
                    </div>
                }
                
                <div className='flex justify-between my-4'>
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

