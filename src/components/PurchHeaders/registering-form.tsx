'use client'
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import * as actions from '@/actions';

interface RegisteringGoodsProps{
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
    setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RegisteringGoods({
    header,
    setShowForm
} : RegisteringGoodsProps){

    const handleCloseModal = () => {
        setShowForm(false);
    };


    const [formState, action] = useFormState(actions.registerGoodsInProduction, { message: '' });

    return(
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-8 rounded shadow-lg w-2/3">
            <h2 className="text-lg font-semibold mb-4">Реєстрація приходу товару</h2>
            
            <form className="mb-4" action={action} onSubmit={handleCloseModal}>

                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr className="bg-green-100">
                            <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Item name
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Qty
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Unit
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Batch name
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {header?.purchaselines.map((line, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{line.items.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{line.quantity}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{line.units.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                <input
                                        name={`batch_name_${line.id}`}
                                        className="border rounded p-2 w-full"
                                        id={`batch_name_${line.id}`}
                                        required
                                    />
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                    
                <input type="hidden" name="header_id" value={String(header?.id)} /> 
                <div className="flex justify-between mt-4">
                    <button 
                        className="bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
            {formState && formState.message && (
                <div className="my-2 p-2 border rounded border-red-400">
                    {formState.message}
                </div>
            )}
        </div>
        
    )
}