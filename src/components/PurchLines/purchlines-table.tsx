'use client'

import React, { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import * as actions from '@/actions';
import Image from 'next/image';
// import deleteButton from '../../public/icons/delete.svg'
import newFileButton from '../../../public/icons/create.svg'
// import editButton from '../../public/icons/edit.svg'
import PurchLineItem from '@/components/PurchLines/purch-line-element'
import CreateEditLineForm from '../PurchLines/create-edit-form'

interface PurchLinesComponentProps {
    lines: {
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
    }[] | undefined,
    purchHeader: {
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
    } | undefined,
    items: {
        id: number;
        name: string;
        units: {
            id: number;
            name: string;
        } | null;
        vendor_id: number | null;
    }[]
}

export default function PurchLinesList( {lines, purchHeader, items} : PurchLinesComponentProps){
    const [showModal, setShowModal] = useState<boolean>(false);

    const [selectedLine, setSelectedLine] = useState<number | undefined>(undefined);

    const handleCreateNewPurchLine = () => {
        setShowModal(true);
    };

    return(
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Рядки прибуткової накладної</h1>
                <div>
                    {purchHeader?.doc_id === null && (
                        <button className="hover:bg-blue-100 py-2 px-2 rounded" onClick={handleCreateNewPurchLine}>
                        <Image
                            src={newFileButton}
                            alt="New Document Icon"
                            width={30}
                            height={30}
                        />
                    </button>
                    )}
                    
                </div>
            </div>
            <table className="w-full text-sm">
                <thead className="bg-blue-200">
                    <tr>
                        <th className="px-4 py-2 text-center border border-gray-400"># Line</th>
                        <th className="px-4 py-2 text-center border border-gray-400">Item ID</th>
                        <th className="px-4 py-2 text-center border border-gray-400">Item name</th>
                        <th className="px-4 py-2 text-center border border-gray-400">Feed type</th>
                        <th className="px-4 py-2 text-center border border-gray-400">Unit ID</th>            
                        <th className="px-4 py-2 text-center border border-gray-400">Qty</th>  
                        <th className="px-4 py-2 text-center border border-gray-400">Edit</th> 
                    </tr>
                </thead>
                <tbody>
                {lines
                ?.sort((a, b) => Number(a.id) - Number(b.id))
                .map((line, index)=> {
                    return(
                        <PurchLineItem 
                        key={line.id}
                        purch_header={purchHeader} 
                        line={line} 
                        index={index} 
                        items={items} 
                        setSelectedLine={setSelectedLine}
                        selectedLine={selectedLine}
                        />            
                    )}
                )}
                </tbody> 
            </table>

            {showModal && (
                <CreateEditLineForm 
                purchHeader={purchHeader} 
                items={items} 
                setShowModal={setShowModal} 
                />
            )}
            
        </div>
        
      )
}