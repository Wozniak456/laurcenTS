'use client'

import { useFormState } from "react-dom";
import * as CRUDactions from '@/actions'

export default function ProdAreaCreatePage(){
    const [formState, action] = useFormState(CRUDactions.createProdArea, {message: ''});

    return(
        <form className="container mx-auto px-4 m-4 max-w-[800px]" action={action}>
            <h3 className="font-bold m-3">Create a Production Area</h3>
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="name">
                        Name
                    </label>
                    <input 
                        name="name"
                        className="border rounded p-2 w-full"
                        id="name"
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="description">
                        Description
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