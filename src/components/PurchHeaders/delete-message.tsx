'use client'
import { useState } from 'react';
import * as actions from '@/actions';
import { useFormState } from 'react-dom';

interface PurchHeaderEditFormProps {
    header: {
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
    },
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PurchHeaderDeleteForm({header, setShowModal} : PurchHeaderEditFormProps){

    const deletePurchHeaderAction = actions.deletePurchRecord.bind(null, header.id)

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return(        
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-8 rounded shadow-lg w-1/2">
                <h2 className="text-lg font-semibold mb-4">Ви дійсно хочете видалити накладну?</h2>
                <form action={deletePurchHeaderAction} onSubmit={handleCloseModal}>
                    <div className="flex justify-between mt-4">
                        <button 
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            type="submit"
                            >
                            Видалити
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