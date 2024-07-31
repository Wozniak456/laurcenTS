'use client'

import { useFormState } from "react-dom";
import * as actions from '@/actions';

export default function PurchtableCreatePage(){
    const [formState, action] = useFormState(actions.createPurchTable, {message: ''});

    return(
        <form action={action}>
            <h3 className="font-bold m-3">Create a record to purchtable</h3>
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="date">
                        Date
                    </label>
                    <input 
                        name="date"
                        className="border rounded p-2 w-full"
                        id="date"
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="vendor_id">
                        Vendor_id
                    </label>
                    <input 
                        name="vendor_id"
                        className="border rounded p-2 w-full"
                        id="vendor_id"
                        required
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="vendor_doc_number">
                        Vendor_doc_number
                    </label>
                    <input 
                        name="vendor_doc_number"
                        className="border rounded p-2 w-full"
                        id="vendor_doc_number"
                        required
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