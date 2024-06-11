'use client'

import { useFormState } from "react-dom";
import * as actions from '@/actions';
import PartitionForm from "@/components/batch-partition";
import { useEffect, useState } from "react";
// import { ItemBatch} from '@/components/accordion'
import { itembatches } from "@prisma/client";
import PoolInfo from "@/components/pool-info"
import { batchInfo, poolInfo, disposalItem } from '@/types/app_types'
import DisposalForm from '@/components/Stocking/disposal-form'

interface StockPoolProps {
    locations: {
        id: number,
        name: string,
        location_type_id: number
    }[],
    batches: itembatches[],
    poolInfo: poolInfo,
    disposal_reasons: disposalItem[]
}

export default function StockPoolPage({locations, batches, poolInfo, disposal_reasons}: StockPoolProps) {

    // console.log(poolInfo.location_id, poolInfo)
    const [showMoreFields, setShowMoreFields] = useState(false);
    const [showPartitionForm, setShowPartitionForm] = useState(false);
    const [showDisposalForm, setShowDisposalForm] = useState(false);

    const handleDisposalFormButton = () => {
        setShowDisposalForm(true)
    }

    useEffect(() => {
        console.log(showDisposalForm);
    }, [showDisposalForm]);
    
    const [formState, action] = useFormState(actions.stockPool, { message: '' });
    const [locationIdFrom, setLocationIdFrom] = useState<number | undefined>(undefined);

    

    return (
        <div>
            <div className="my-4">
                <h2 className="font-bold">Локація: {locations.find(loc => loc.id === poolInfo.location_id)?.name}</h2>
            </div>
            
            {poolInfo.batch && <PoolInfo poolInfo={poolInfo} batches={batches}/>}
            <form className="container mx-auto m-4 " action={action}>
            <div className="flex justify-end">
                {/* <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => setShowMoreFields(!showMoreFields)}
                >
                    {showMoreFields ? "Згорнути" : "Керувати басейном..."}
                </button> */}
            </div>
            <div className="flex justify-center flex-col gap-4 ">
                
                <input type="hidden" name="location_id_from" value={87} />
                <input type="hidden" name="location_id_to" value={poolInfo.location_id} />
                {!poolInfo.batch && 
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
                    {!poolInfo.batch &&
                    
                        <button
                            type="submit"
                            className="rounded p-2 bg-blue-200"
                        >
                            Зарибити зі складу
                        </button>
                    }
                    {poolInfo.batch &&
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
                    </>
                    }
                    
                    
                </div>
                
                {formState && formState.message && (
                    <div className="my-2 p-2 bg-red-200 border rounded border-red-400">
                        {formState.message}
                    </div>
                )}
            </div>
            
        </form>
        {showPartitionForm && <PartitionForm poolInfo={poolInfo} locations={locations}/>} 
        {showDisposalForm && <DisposalForm poolInfo={poolInfo} reasons={disposal_reasons} setShowDisposalForm={setShowDisposalForm}/>}
        </div>
    );
}