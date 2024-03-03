'use client'

import { useFormState } from "react-dom";
import * as actions from '@/actions';

export default function PurchaseLinesCreatePage(){
    const [formState, action] = useFormState(actions.createPurchLineRecord, {message: ''});

    return(
        <form action={action}>
            <h3 className="font-bold m-3">Create a purchaseline</h3>
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="purchase_id">
                        PurchaseTableId
                    </label>
                    <input 
                        name="purchase_id"
                        className="border rounded p-2 w-full"
                        id="purchase_id"
                        required
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="item_id">
                        ItemId
                    </label>
                    <input 
                        name="item_id"
                        className="border rounded p-2 w-full"
                        id="item_id"
                        required
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="quantity">
                        Quantity
                    </label>
                    <input 
                        name="quantity"
                        className="border rounded p-2 w-full"
                        id="quantity"
                        required
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="unit_id">
                        UnitId
                    </label>
                    <input 
                        name="unit_id"
                        className="border rounded p-2 w-full"
                        id="unit_id"
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