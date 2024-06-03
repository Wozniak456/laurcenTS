'use client'
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import * as actions from '@/actions';
import { salestable, saleslines, customers } from "@prisma/client";
import Image from 'next/image';
import CloseButton from '../../../public/icons/close-square-light.svg'
import EditButton from '../../../public/icons/edit.svg'
import DeleteButton from '../../../public/icons/delete.svg'
import RegisterButton from '../../../public/icons/goods-in.svg'
import { useRouter } from 'next/navigation'

interface SalesHeadersProps{
    header: {
        id: bigint,
        doc_id: bigint | null,
        date_time: Date,
        saleslines: saleslines[],
        customers: customers
    }
}

export default function SalesHeaders({
    header
} : SalesHeadersProps){
    const [formState, action] = useFormState(actions.createSalesTableRecord, { message: '' });
    const [UpdateActionState, UpdateAction] = useFormState(actions.updateSalesTable, {message: ''});

    const router = useRouter();

    const handleRowClick = (id: number) => {
        router.push(`/realization/headers/${id}`);
      };

      const handleRegisterClick = (id: number, event: React.MouseEvent) => {
        event.stopPropagation();
        router.push(`/realization/headers/${id}/registering`);
      };

    return(
        <tr key={header.id} onClick={() => handleRowClick(Number(header.id))} className="hover:cursor-pointer">
            <td className="px-2 py-2 border border-gray-400 text-center">{Number(header.id)}</td>
            <td className="px-2 py-2 border border-gray-400 text-center">
                {header.doc_id !== null ? Number(header.doc_id) : ''}
            </td>
            <td className="px-2 py-2 border border-gray-400 text-center">{header.date_time.toISOString().split("T")[0]}</td>
            <td className="px-2 py-2 border border-gray-400 text-center">{header.customers.id}</td>
            <td className="px-2 py-2 border border-gray-400 text-center">{header.customers.name}</td>            
            <td className="px-2 py-2 border border-gray-400 text-center">
                {header.saleslines.length === 0 ? 
                    'None' : 
                    header.doc_id === null ? 
                        'Saved' : 
                        'Posted'
                }
            </td>
            <td className=" border border-gray-400 text-center w-16">
                <button> 
                    <Image
                        src={EditButton}
                        alt="Edit"
                        width={30}
                        height={30}
                    />
                </button> 
            </td>
            <td className=" border border-gray-400 text-center  w-16">
                <button 
                className="hover:bg-red-100 rounded">
                    <Image
                        src={DeleteButton}
                        alt="Delete"
                        width={30}
                        height={30}
                    />
                </button>
            </td>
            <td className=" border border-gray-400 text-center w-16">
                <button 
                className="hover:bg-green-100 rounded" 
                onClick={(event) => handleRegisterClick(Number(header.id), event)}
                >
                    <Image
                        src={RegisterButton}
                        alt="Register goods"
                        width={30}
                        height={30}
                    />
                </button> 
            </td>
                    
        </tr>
    )
}