'use client'

import { useFormState } from "react-dom";
import * as actions from '@/actions';
import { productionlines } from "@prisma/client";
import { useEffect, useState } from "react";

export default function PoolCreatePage(){
    const [formState, action] = useFormState(actions.createPool, {message: ''});
    const [areas, setAreas] = useState<productionlines[]>([]);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const linesData = await actions.getLines();
                setAreas(linesData);
            } catch (error) {
                console.error('Error fetching areas:', error);
            }
        };

        fetchData();
    }, []);

    return(
        <form className="container mx-auto px-4 m-4 max-w-[800px]" action={action}>
            <h3 className="font-bold m-3">Create a Pool</h3>
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="prod_line_id">
                        prod_line_id
                    </label>
                    <select
                    name="prod_line_id"
                    className="border rounded p-2 w-full"
                    id="prod_line_id"
                    >
                        {areas.map(area => (
                            <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                    </select>
                </div>
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="name">
                        Name
                    </label>
                    <input 
                        name="name"
                        className="border rounded p-2 w-full"
                        id="name"
                        required
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="description">
                        Description
                    </label>
                    <textarea 
                        name="description"
                        className="border rounded p-2 w-full"
                        id="description"
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="cleaning_frequency">
                        cleaning_frequency
                    </label>
                    <input 
                        name="cleaning_frequency"
                        className="border rounded p-2 w-full"
                        id="cleaning_frequency"
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="water_temperature">
                        water_temperature
                    </label>
                    <input 
                        name="water_temperature"
                        className="border rounded p-2 w-full"
                        id="water_temperature"
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="x_location">
                        x_location
                    </label>
                    <input 
                        name="x_location"
                        className="border rounded p-2 w-full"
                        id="x_location"
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="y_location">
                        y_location
                    </label>
                    <input 
                        name="y_location"
                        className="border rounded p-2 w-full"
                        id="y_location"
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="pool_height">
                        pool_height
                    </label>
                    <input 
                        name="pool_height"
                        className="border rounded p-2 w-full"
                        id="pool_height"
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="pool_width">
                        pool_width
                    </label>
                    <input 
                        name="pool_width"
                        className="border rounded p-2 w-full"
                        id="pool_width"
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-auto" htmlFor="pool_length">
                        pool_length
                    </label>
                    <input 
                        name="pool_length"
                        className="border rounded p-2 w-full"
                        id="pool_lengths"
                    />
                </div>

                {
                    formState.message ? <div className="my-2 p-2 bg-red-200 border rounded border-red-400">{formState.message}</div> : null
                }

                <button type="submit" className="rounded p-2 bg-blue-200">
                    Create
                </button>
            </div>
        </form>
    )
}