'use client'
import type {purchaselines} from '@prisma/client'
import { useState } from 'react';
import * as actions from '@/actions';

interface PurchlineEditFormProps{
    purchline: purchaselines
}

export default function PurchlineEditForm({purchline: purchline} : PurchlineEditFormProps){
    const [purchase_id, setPurchase_id] = useState(purchline.purchase_id)
    const [item_id, setItem_id] = useState(purchline.item_id)
    const [quantity, setQuantity] = useState(purchline.quantity)
    const [unit_id, setUnit_id] = useState(purchline.unit_id)

    const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuantity(parseInt(event.target.value));
    };

    const handleUnitIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUnit_id(parseInt(event.target.value));
    };

    const handlePurchaseIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPurchase_id(BigInt(event.target.value));
    };

    const handleItemIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setItem_id(parseInt(event.target.value));
    };

    // const editPurchlineAction = actions.editPurchline.bind(null, purchline.id, purchase_id, item_id, quantity, unit_id)
    
    return(
        <div className="p-3 border rounded border-gray-200">
            <form 
            // action={editPurchlineAction} 
            className='flex flex-col'>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="purchase_id">
                        PurchaseId
                    </label>
                    <input 
                        id="purchase_id" 
                        name="purchase_id"
                        defaultValue={purchase_id.toString()}
                        onChange={handlePurchaseIdChange}
                        className='p-3 border border-gray-200'
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="item_id">
                        ItemId
                    </label>
                    <input 
                        id="item_id" 
                        name="item_id"
                        defaultValue={item_id} 
                        onChange={handleItemIdChange}
                        className='p-3 border border-gray-200'
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="quantity">
                        Quantity
                    </label>
                    <input 
                        id="quantity" 
                        name="quantity"
                        defaultValue={quantity} 
                        onChange={handleQuantityChange}
                        className='p-3 border border-gray-200'
                    />
                </div>
                <div className="flex gap-4">
                    <label className="w-24" htmlFor="unit_id">
                        UnitId
                    </label>
                    <input 
                        id="unit_id" 
                        name="unit_id"
                        defaultValue={unit_id} 
                        onChange={handleUnitIdChange}
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