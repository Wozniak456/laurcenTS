'use client'

import { useFormState } from "react-dom";
import * as actions from '@/actions';
import { useEffect, useState } from "react";
import type {productionareas} from '@prisma/client'

export default function ProdLineCreatePage(){
    const [formState, action] = useFormState(actions.createProdLine, {message: ''});
    const [areas, setAreas] = useState<productionareas[]>([]);

    return(
        <form className="flex flex-col justify-center" action={action}>
            <h3 className="font-bold m-3">Create a Production Line</h3>
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="prod_area_id">
                        Секція
                    </label>
                    <select
                    name="prod_area_id"
                    className="border rounded p-2 w-full"
                    id="prod_area_id"
                    >
                        {areas.map(area => (
                            <option key={area.id} value={area.id}>{area.name}</option> 
                    ))}
                    </select>
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="name">
                        Назва
                    </label>
                    <input 
                        name="name"
                        className="border rounded p-2 w-full"
                        id="name"
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="description">
                        Опис
                    </label>
                    <textarea 
                        name="description"
                        className="border rounded p-2 w-full"
                        id="description"
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