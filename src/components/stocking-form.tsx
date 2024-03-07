'use client'

import { useFormState } from "react-dom";
import * as actions from '@/actions';
import { productionlines } from "@prisma/client";
import { useEffect, useState } from "react";
import {Location, ItemBatch} from '@/components/accordion'

interface StockPoolProps {
    poolId: number,
    locations: Location[],
    batches: ItemBatch[]
}

export default function StockPoolPage({poolId, locations, batches }: StockPoolProps){
    const [formState, action] = useFormState(actions.stockPool, {message: ''});
    const [locationIdFrom, setLocationIdFrom] = useState<number | undefined>(undefined);

    return(
        <form className="container mx-auto px-4 m-4 max-w-[800px]" action={action}>
            <h3 className="font-bold m-3">Зариблення</h3>
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="location_id_from">
                        Звідки:
                    </label>
                    <select
                        name="location_id_from"
                        className="border rounded p-2 w-full"
                        id="location_id_from"
                        required
                        onChange={(e) => {
                            const selectedLocationId = parseInt(e.target.value);
                            setLocationIdFrom(selectedLocationId);
                        }}
                    >
                        {locations.map(location => (
                            <option key={location.id} value={location.id}>{location.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="location_id_to">
                        Куди:
                    </label>
                    <input
                        name="location_id_to"
                        className="border rounded p-2 w-full"
                        id="location_id_to"
                        value={poolId}
                        readOnly>
                    </input>
                </div>
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="batch_id">
                        Партія
                    </label>
                    <select
                        name="batch_id"
                        className="border rounded p-2 w-full"
                        id="batch_id"
                        required
                    >
                        {batches.map(batch => (
                            <option key={batch.id} value={Number(batch.id)}>{batch.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="quantity">
                        Кількість
                    </label>
                    <input 
                        name="quantity"
                        className="border rounded p-2 w-full"
                        id="quantity"
                        required
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="unit_id">
                        Одиниця виміру
                    </label>
                    <input 
                        name="unit_id"
                        className="border rounded p-2 w-full"
                        id="unit_id"
                        value={1}
                        readOnly
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="average_weight">
                        Середня вага, г
                    </label>
                    <input 
                        name="average_weight"
                        className="border rounded p-2 w-full"
                        id="average_weight"
                        required
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="executed_by">
                        executed_by
                    </label>
                    <input 
                        name="executed_by"
                        className="border rounded p-2 w-full"
                        id="executed_by"
                        value={1}
                        required
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="comments">
                        Коментарі
                    </label>
                    <input 
                        name="comments"
                        className="border rounded p-2 w-full"
                        id="comments"
                    />
                </div>

                {
                    formState && formState.message ? (
                        <div className="my-2 p-2 bg-red-200 border rounded border-red-400">
                            {formState.message}
                        </div>
                    ) : null
                }

                <button 
                    type="submit" 
                    className="rounded p-2 bg-blue-200"
                    >
                    Зарибити
                </button>
                
            </div>
        </form>
    )
}