'use client'
import type {purchtable} from '@prisma/client'
import { useState } from 'react';
import * as actions from '@/actions';

interface PurchRecordEditFormProps{
    purchtableRecord: purchtable
}

export default function PurchRecordEditForm({purchtableRecord: purchtableRecord} : PurchRecordEditFormProps){
    const [vendorId, setVendorId] = useState(purchtableRecord.vendor_id)
    const [vendorDocNumber, setVendorDocNumber] = useState(purchtableRecord.vendor_doc_number)
    
    const handleVendorIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVendorId(parseInt(event.target.value));;
    };

    const handleVendorDocNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVendorDocNumber(event.target.value);
    };

    const editPurchRecordAction = actions.editPurchtable.bind(null, Number(purchtableRecord.id), vendorId, vendorDocNumber)
    
    return(
        <div className="p-3 border rounded border-gray-200">
            <form action={editPurchRecordAction} className='flex flex-col'>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="vendor_id">
                        VendorId
                    </label>
                    <input 
                        id="vendor_id" 
                        name="vendor_id"
                        defaultValue={vendorId}
                        onChange={handleVendorIdChange}
                        className='p-3 border border-gray-200'
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="vendor_doc_number">
                        VendorDocNumber
                    </label>
                    <input 
                        id="vendor_doc_number" 
                        name="vendor_doc_number"
                        defaultValue={vendorDocNumber} 
                        onChange={handleVendorDocNumberChange}
                        className='p-3 border border-gray-200'
                    />
                </div>
        
                <button type='submit' className='p-2 border rounded'>
                    Save
                </button>
            </form>
        </div>
    )
}