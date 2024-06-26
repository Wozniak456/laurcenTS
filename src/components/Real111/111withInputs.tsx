'use client'
import Link from "next/link";
import { ChangeEvent, KeyboardEventHandler, useEffect, useState } from "react";
import Header from '@/components/header'
import { useFormState } from "react-dom";
import * as actions from '@/actions';
import Image from "next/image";
import SaveButton from '../../../public/icons/Save.svg'


interface FilterableTableProps {
    date: string,
    poolIndex: number,
    aggregatedData: {
        batchName: string | undefined;
        qty: number | undefined;
        fishWeight: number | undefined;
        feedType: string | undefined;
        updateDate: string | undefined;
        plan_weight?: number
    }   
}

export default function SelectDay({date, poolIndex, aggregatedData }: FilterableTableProps) {

    const todayDate = new Date()
    const today = todayDate.toISOString().split("T")[0]

    const initialFishWeight = aggregatedData.fishWeight

    const [fishWeight, setFishWeight] = useState<number | undefined>(initialFishWeight)

    const handleFishWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        value = value.replace(',', '.');
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue)) {
            setFishWeight(parsedValue);
        } else {
            setFishWeight(undefined);
        }
    };


    const [formState, action] = useFormState(actions.updateSmth, { message: '' })
    const color = getDiff(aggregatedData.plan_weight, aggregatedData.fishWeight)

    return (
        <>
            <td className="px-4 py-2 border text-center border-gray-400"> {aggregatedData.batchName}</td>
            <td className="px-4 py-2 border text-center border-gray-400"> {aggregatedData.qty}</td>
            
            <td className="px-4 py-2 border text-center border-gray-400">{aggregatedData.plan_weight?.toFixed(1)}</td>
            <td className={`px-4 py-2 border text-center border-gray-400 ${fishWeight != initialFishWeight && 'bg-yellow-100'} bg-${color}-200`}>
                <input
                    type="number"
                    step="0.001"
                    value={fishWeight !== undefined ? fishWeight.toString() : ''}
                    onChange={handleFishWeightChange}
                    className="px-2 py-1 rounded-md text-center"
                    disabled={!aggregatedData.batchName || date != today}
                />
            </td>
            <td className="px-4 py-2 border text-center border-gray-400"> {aggregatedData.feedType}</td>
            <td className="px-4 py-2 border text-center border-gray-400"> {aggregatedData.updateDate}</td>
            <td>
                <form action={action}>
                    <input type="hidden" name="location_id_to" value={poolIndex} />
                    <input type="hidden" name="date" value={date} />
                    {fishWeight !== initialFishWeight && <input type="hidden" name="average_fish_mass" value={fishWeight} />}
                    
                    {fishWeight != initialFishWeight ?
                        <div className="w-10 ">
                            <button className=" p-1 rounded hover:bg-green-200">
                                <Image src={SaveButton} alt="save" width={30} />
                            </button>
                        </div> :
                        <div className="w-10 ">
                            <button className=" p-1 rounded hover:bg-green-200">
                                {/* <Image src={SaveButton} alt="save" width={30} /> */}
                            </button>
                        </div>
                    }
                </form>
            </td>
        </>
    );
}

function getDiff(planWeight: number | undefined, actualWeight: number | undefined){
    if (planWeight && actualWeight && planWeight - actualWeight >= 10){
        return 'red'
    } else if (planWeight && actualWeight) {
        return 'green'
    }

}