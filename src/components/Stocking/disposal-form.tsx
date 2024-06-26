'use client'

import * as actions from '@/actions';
import { useFormState } from 'react-dom';
import { useEffect, useState } from 'react';
import { poolInfo, disposalItem } from '@/types/app_types'

interface DisposalFormPageProps {
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
    },
    setShowDisposalForm : React.Dispatch<React.SetStateAction<boolean>>;
    reasons: disposalItem[]
}

export default function DisposalFormPage({location, poolInfo, setShowDisposalForm, reasons} : DisposalFormPageProps) {
    const [selectedReason, setSelectedReason] = useState<number | undefined>(undefined)

    const handleCloseForm = () => {
        setShowDisposalForm(false)
    }

    function handleReasonChange(reason_id: any){
        setSelectedReason(reason_id)
    }

    const [formState, action] = useFormState(actions.disposal, { message: '' });

    // useEffect(() => {
    //     console.log(selectedReason)
    // }, [selectedReason])

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex justify-center items-center z-10">
            <div className="bg-white p-4 rounded shadow-lg w-1/3">
            <h1 className="font-bold mb-4 text-center text-base">Форма списання риби з басейну {location.name}</h1>
                <form className="mx-auto px-4 m-4" action={action} onSubmit={handleCloseForm}>

                    <input type="hidden" name="batch_id" value={String(poolInfo.batchId)} />
                    <input type="hidden" name="location_id_from" value={String(location.id)} />
                    <input type="hidden" name="fish_amount_in_pool" value={String(poolInfo.qty)} />
                    <input type="hidden" name="average_fish_mass" value={String(poolInfo.fishWeight)} />
                    
                    <div className='flex flex-wrap gap-2 mb-8 justify-between'>
                        <div className='flex flex-col gap-2'>
                            <label className="" htmlFor='reason'>
                                Причина списання:
                            </label>
                            <select
                                name='reason'
                                className="border rounded p-2 w-full"
                                id='reason'
                                required
                                onChange={(event) => {handleReasonChange(event.target.value)}}
                            >
                                <option value="" >Оберіть причину</option>
                                {reasons
                                    .map((reason) => (
                                        <option key={reason.id} value={reason.id}>{reason.reason}</option>
                                    ))}
                            </select>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label className="" htmlFor='qty'>
                                Кількість:
                            </label>
                            <input
                                name='qty'
                                className="border rounded p-2 w-full"
                                id='qty'
                                max={poolInfo.qty}
                                required
                            />
                        </div>
                        
                    </div>
                    
                    <div className='flex justify-between'>
                        <button
                            type="submit"
                            className="rounded p-2 bg-red-500 text-white font-bold"
                            // onClick={handleCloseForm}
                        >
                            Списати
                        </button>
                        <button
                            type="button"
                            className="rounded p-2 bg-blue-200"
                            onClick={handleCloseForm}
                        >
                            Скасувати
                        </button>
                    </div>
                    
                </form>
                
            </div>
        </div>
        
    );
}

