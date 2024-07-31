'use client'

import { useFormState } from "react-dom";
import * as actions from '@/actions';
import PartitionForm from "@/components/batch-partition";
import { useState } from "react";
import { itembatches } from "@prisma/client";
import PoolInfo from "@/components/Pools/pool-info"
import { disposalItem } from '@/types/app_types'
import DisposalForm from '@/components/Stocking/disposal-form'

interface StockPoolProps {
    locations: {
        id: number,
        name: string,
        location_type_id: number
    }[],
    location: {
        id: number;
        location_type_id: number;
        name: string;
        pool_id: number | null;
    },
    batches: itembatches[],
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
    disposal_reasons: disposalItem[]
}

export default function StockPoolPage({location, locations, batches, poolInfo, disposal_reasons}: StockPoolProps) {
    const [showPartitionForm, setShowPartitionForm] = useState(false);
    const [showDisposalForm, setShowDisposalForm] = useState(false);

    const handleDisposalFormButton = () => {
        setShowDisposalForm(true)
    }

    
    const [formState, action] = useFormState(actions.stockPool, { message: '' });

    return (
        <div>
            <div className="my-4">
                <h2 className="font-bold">Локація: {location.name}</h2>
            </div> 
            
            {poolInfo.qty && poolInfo.qty > 0 ? <PoolInfo location={location} poolInfo={poolInfo} batches={batches}/> : ''}
            
            <form className="container mx-auto m-4 " action={action}>
            <div className="flex justify-end">
            </div>
            <div className="flex justify-center flex-col gap-4 ">
                
                <input type="hidden" name="location_id_from" value={87} />
                <input type="hidden" name="location_id_to" value={location.id} />
                {(!poolInfo.batch || poolInfo.qty == 0) && 
                <div className="flex flex-wrap items-center gap-4 justify-between">
                    <div className="flex gap-4 items-center flex-wrap ">
                        <label className="min-w-24" htmlFor="batch_id">
                            Партія
                        </label>
                        <select
                            name="batch_id"
                            className="border rounded p-2 max-w-fit"
                            id="batch_id"
                            required
                        >
                            <option>Не обрано</option>
                            {batches.map(batch => (
                                <option key={batch.id} value={Number(batch.id)}>{batch.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-4 items-center flex-wrap ">
                        <label className="min-w-24" htmlFor="fish_amount">
                            Кількість
                        </label>
                        <input
                            name="fish_amount"
                            type="number"
                            className="border rounded p-2 max-w-40"
                            id="fish_amount"
                            min={1}
                            required
                        />
                    </div>
                    <div className="flex gap-4 items-center flex-wrap ">
                        <label className="min-w-24" htmlFor="average_fish_mass">
                            Сер. вага, г
                        </label>
                        <input
                            name="average_fish_mass"
                            className="border rounded p-2 max-w-40"
                            id="average_fish_mass"
                            type="number"
                            min={0.0001}
                            step="any"
                            required
                        />
                    </div>
                </div>}
                {/* <div className={`flex items-center w-full gap-4 ${showMoreFields ? "" : "hidden"}`}>
                    <label className="min-w-24" htmlFor="comments">
                        Коментарі
                    </label>
                    <input
                        name="comments"
                        className="border rounded p-2 flex-grow"
                        id="comments"
                    />
                    </div> */}
                <div className="flex flex-wrap gap-4 justify-end">
                    {(!poolInfo.batch || poolInfo.qty==0) &&
                    
                        <button
                            type="submit"
                            className="rounded p-2 bg-blue-200"
                        >
                            Зарибити зі складу
                        </button>
                    }
                    {poolInfo.qty && poolInfo.qty > 0 ?
                    <>
                    <button
                        type="button"
                        className="rounded p-2 bg-blue-200"
                        onClick={() => setShowPartitionForm(!showPartitionForm)}
                    >
                        Розділити
                    </button>

                    <button
                        type="button"
                        className="rounded p-2 bg-blue-200"
                        onClick={handleDisposalFormButton}
                    >
                        Списати
                    </button>
                    </> : ''
                    }
                    
                    
                </div>
                
                {formState && formState.message && (
                    <div className="my-2 p-2 bg-red-200 border rounded border-red-400">
                        {formState.message}
                    </div>
                )}
            </div>
            
        </form>
        {showPartitionForm && <PartitionForm location={location} poolInfo={poolInfo} locations={locations}/>} 
        {showDisposalForm && <DisposalForm location={location} poolInfo={poolInfo} reasons={disposal_reasons} setShowDisposalForm={setShowDisposalForm}/>}
        </div>
    );
}