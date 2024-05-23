'use client'

import * as actions from '@/actions';
import { useFormState } from 'react-dom';
import { Area, Location } from "@/components/accordion"
import PoolInfo from "@/components/pool-info"
import { useEffect, useState } from 'react';
import { locations } from '@prisma/client';

interface Pool{
    id: number,
    name: string
}

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
        <form className="container mx-auto px-4 py-8 m-4 bg-white shadow-md rounded-lg" action={action}>
            <h1 className="text-2xl font-bold mb-4">Форма поділу партії</h1>
            <div className="mb-4">
                <label className="text-lg" htmlFor="location_id_from">
                Звідки: {locations.find(loc => loc.id === poolInfo.location_id)?.name}
                    
                </label>
                <input
                    type="hidden"
                    name="location_id_from"
                    value={poolInfo.location_id}
                />
            </div>
            <div className="mb-4">
                <p className="text-lg font-semibold mb-2">Басейни для розподілу:</p>
                {selectedPools.map((selectedPoolId, index) => {
                    
                    return (
                        <div key={index} className='flex gap-4'>
                            <input type="hidden" name="batch_id" value={String(poolInfo.batch?.batch_id)} />
                            <input type="hidden" name="fish_qty_in_location_from" value={poolInfo.batch?.qty} />
                            {/* <input type="hidden" name="average_fish_mass" value={stats.average_weight} /> */}
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
                                <label className="text-lg" htmlFor={`fish_amount_${index}`}>
                                    Скільки рибин:
                                </label>
                                <input
                                    name={`fish_amount_${index}`}
                                    className="border rounded p-2 w-full"
                                    id={`fish_amount_${index}`}
                                    max={poolInfo.batch?.qty}
                                    required
                                />
                            </div>
                            
                        </div>
                    )
                })}
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
                <div className='flex justify-between my-4'>
                    <button 
                        type="button" 
                        className="rounded p-2 bg-blue-200 hover:bg-blue-300"
                        onClick={() => setSelectedPools([...selectedPools, null])}
                    >
                        Додати басейн
                    </button>
                    <button
                        type="submit"
                        className="rounded p-2 bg-blue-200 hover:bg-blue-300"
                    >
                        Розділити
                    </button> 
                </div>
            </div>
        </form>
    );
}

function calculatePartitionStats(locations : location[], location_id: number) {
    let totalQuantity;
    let average_weight;
    let lastPartitionId;

    // const transactions = location.itemtransactions
    //     .filter(tran =>(
    //         tran.itembatches.items.item_type_id === 1
    //     ))
    //     .sort((a, b) => Number(b.id) - Number(a.id));
        
    //     lastPartitionId = transactions[0].itembatches.id
    //     average_weight = transactions[0].documents.stocking[0].average_weight;
    //     const fishQuantities = transactions.map(tran => tran.quantity);
    //     totalQuantity = fishQuantities.reduce((total, quantity) => total + quantity, 0);
    

    return {
        batch_id: lastPartitionId,
        fish_qty_in_location_from: totalQuantity,
        average_weight: average_weight
    };
}