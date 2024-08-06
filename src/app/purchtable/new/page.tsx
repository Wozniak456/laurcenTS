'use client'

import { useFormState } from "react-dom";
import * as actions from '@/actions';
import { Input } from "@nextui-org/react";
import FormButton from "@/components/common/form-button";

export default function PurchtableCreatePage(){
    const [formState, action] = useFormState(actions.createPurchTable, {errors: {}});

    return(
        <form action={action}>
            <h3 className="font-bold m-3">Create a record to purchtable</h3>
            <div className="flex flex-col gap-4">
                {/* <div className="flex gap-4">
                    <label className="w-24" htmlFor="date">
                        Date
                    </label>
                    <input 
                        name="date"
                        className="border rounded p-2 w-full"
                        id="date"
                    />
                </div> */}
                <Input 
                    name="date"
                    label="Date"
                    type="date"
                    labelPlacement="outside"
                    placeholder="Date"
                    isInvalid={!!formState.errors.delivery_date}
                    errorMessage={formState.errors.delivery_date?.join(', ')}
                />
                {/* <div className="flex gap-4">
                    <label className="w-24" htmlFor="vendor_id">
                        Vendor_id
                    </label>
                    <input 
                        name="vendor_id"
                        className="border rounded p-2 w-full"
                        id="vendor_id"
                        required
                    />
                </div> */}
                <Input 
                    name="vendor_id"
                    label="Vendor ID"
                    labelPlacement="outside"
                    placeholder="Vendor ID"
                    isInvalid={!!formState.errors.vendor_id}
                    errorMessage={formState.errors.vendor_id?.join(', ')}
                />
                {/* <div className="flex gap-4">
                    <label className="w-24" htmlFor="vendor_doc_number">
                        Vendor_doc_number
                    </label>
                    <input 
                        name="vendor_doc_number"
                        className="border rounded p-2 w-full"
                        id="vendor_doc_number"
                        required
                    />
                </div> */}

                <Input 
                    name="vendor_doc_number"
                    label="Vendor Doc Number"
                    labelPlacement="outside"
                    placeholder="Vendor Doc Number"
                    isInvalid={!!formState.errors.vendor_doc_number}
                    errorMessage={formState.errors.vendor_doc_number?.join(', ')}
                />
                
                {/* <button type="submit" className="rounded p-2 bg-blue-200">
                    Create
                </button> */}
                <FormButton color="primary">
                    Create
                </FormButton>
            </div>
        </form>
    )
}