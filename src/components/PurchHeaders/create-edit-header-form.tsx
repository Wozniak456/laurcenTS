'use client'
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import * as actions from '@/actions';

interface PurchHeaderComponentProps{
    header?: {
        id: bigint;
        doc_id: bigint | null;
        date_time: Date;
        vendor_id: number;
        vendor_doc_number: string;
        vendors: {
            id: number;
            name: string;
            description: string | null;
        };
        purchaselines: {
            id: number;
            items: {
                id: number;
                name: string;
                feed_type_id: number | null;
            };
            quantity: number;
            units: {
                id: number;
                name: string;
            };
            item_id: number;
        }[];
    }
    vendors: {
        id: number;
        name: string;
        description: string | null;
    }[],
    setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CreateEditPurchHeaderForm({
    header,
    vendors,
    setShowForm: setShowCreatePurchHeaderModal
} : PurchHeaderComponentProps){

    const [selectedVendor, setSelectedVendor] = useState<string | undefined>('');

    const handleCloseModal = () => {
        setSelectedVendor('')
        setShowCreatePurchHeaderModal(false);
    };

    const handleSelectedVendor = (vendor_id: number) => {
        const name = vendors.find(vendor => vendor.id === vendor_id)?.name
        
        setSelectedVendor(name)
    };

    const [formState, action] = useFormState(header ? actions.editPurchtable : actions.createPurchTableRecord, { message: '' });

    return(
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-8 rounded shadow-lg w-2/3">
                {header ? <h2 className="text-lg font-semibold mb-4">Редагування накладної</h2> : <h2 className="text-lg font-semibold mb-4">Нова накладна</h2>}
         
                <form className="mb-4" action={action} onSubmit={handleCloseModal}>
                    <div className="flex flex-row gap-2 justify-between items-start">
                        <div className=" flex items-center gap-2">
                            <label className="" htmlFor='delivery_date'>
                                Дата приходу: 
                            </label>
                            <input
                                name='delivery_date'
                                type="date"
                                className="border rounded p-2 h-10" // Додайте висоту тут
                                id='delivery_date'
                                required
                                defaultValue={header ? header.date_time.toISOString().split("T")[0] : ''}
                            />
                        </div>
                        <div className="flex flex-row gap-4 flex-wrap items-start justify-end">
                            <div className="flex flex-col gap-2">
                                <div className=" flex flex-col  gap-2">
                                    <label className="" htmlFor='vendor_id'>
                                        Постачальник:
                                    </label>
                                    <select 
                                        name='vendor_id'
                                        className="border rounded p-2 h-10 " 
                                        id='vendor_id'
                                        required
                                        onChange={(e) => handleSelectedVendor(Number(e.target.value)) }  
                                        defaultValue={header ? header?.vendor_id : undefined}
                                    >
                                        <option value="">Оберіть...</option>
                                        {vendors
                                            .map(vendor => (
                                                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* <div>
                                    {selectedVendor ? <p>{selectedVendor}</p> : ''}
                                </div> */}

                            </div>
                            
                            <div className=" flex flex-col gap-2">
                                <label className="" htmlFor='vendor_doc_id'>
                                    Документ постачальника: 
                                </label>
                                <input
                                    name='vendor_doc_id'
                                    className="border rounded p-2  h-10" // Додайте висоту тут
                                    id='vendor_doc_id'
                                    required
                                    defaultValue={header ? header.vendor_doc_number : undefined}
                                />
                            </div>
                        </div> 
                    </div>
                    <input type="hidden" name="header_id" value={String(header?.id)} /> 
                    <div className="flex justify-between mt-4">
                        <button 
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            type="submit"
                            >
                            Зберегти
                        </button>
                        <button className="hover:bg-blue-500 hover:text-white border font-bold py-2 px-4 rounded" 
                        onClick={handleCloseModal}>
                            Скасувати
                        </button>
                    </div>
                </form>
                
            </div>
        </div>
    )
}