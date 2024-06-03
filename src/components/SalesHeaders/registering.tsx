'use client'
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import * as actions from '@/actions';
import { salestable, saleslines, items, units } from "@prisma/client";
import Link from "next/link";
import Image from 'next/image';
import deleteButton from '../../../../../public/icons/delete.svg'
import CloseButton from '../../../public/icons/close-square-light.svg'

interface RegisteringGoodsProps{
    header?: {
        id: bigint;
        doc_id: bigint | null;
        date_time: Date;
        customer_id: number;
        saleslines: {
            id: number;
            salestable_id: bigint;
            item_transaction_id: bigint | null;
            item_id: number;
            quantity: number;
            unit_id: number;
            items: {
                id: number;
                name: string;
                description: string | null;
                item_type_id: number | null;
                feed_type_id: number | null;
                default_unit_id: number | null;
                parent_item: number | null;
                units: units | null
            },
        }[]
    } | null
}

export default function RegisteringGoods({
    header
} : RegisteringGoodsProps){

    const [formState, action] = useFormState(actions.registerGoodsInProduction, { message: '' });

    return(
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex justify-center items-center cursor-default">
            <div className="bg-white p-8 rounded shadow-lg w-3/5">
                <div className="flex justify-between">
                    <h2 className="text-lg font-semibold mb-4">Реєстрація відвантаження товару</h2>
                    <Link href={'/realization/headers/view'}>
                        <button className="hover:bg-blue-100 py-2 px-2 rounded">
                            <Image
                                src={CloseButton}
                                alt="New Document Icon"
                                width={30}
                                height={30}
                                title="Це зображення видаляє елемент" 
                            />
                        </button>
                    </Link>

                </div>
            
            <form className="mb-4" action={action}>

                <table className="min-w-full">
                    <thead>
                        <tr className="bg-green-100 ">
                            <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Назва товару
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                К-сть
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Од. Виміру
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Назва партії
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-w-32">
                            Ціна, грн
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {header?.saleslines.map((line, index) => (
                        <tr key={index}>
                            <td className="py-4">
                                <div className="text-sm text-gray-900">{line.items.name}</div>
                            </td>
                            <td className="px-6 py-4 ">
                                <div className="text-sm text-gray-900">{line.quantity}</div>
                            </td>
                            <td className="px-6 py-4 ">
                                <div className="text-sm text-gray-900">{line.items.units?.name}</div>
                            </td>
                            <td className="px-6 py-4 max-w-32">
                                <div className="text-sm text-gray-900">
                                <input
                                        name={`price_${line.id}`}
                                        className="border rounded p-2 w-full"
                                        id={`price_${line.id}`}
                                        required
                                        type="number"
                                        min={0}
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