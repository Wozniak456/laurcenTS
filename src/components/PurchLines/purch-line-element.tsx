'use client'

import React, { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import * as actions from '@/actions';
import Image from 'next/image';
import deleteButton from '../../../public/icons/delete.svg'
import newFileButton from '../../../public/icons/create.svg'
import editButton from '../../../public/icons/edit.svg'
import CreateEditLineForm from '../PurchLines/create-edit-form'
import PurchLineDeleteForm from '../PurchLines/delete-message'

interface PurchLinesComponentProps {
    purch_header: {
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
    line: {
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
    },
    index: number,
    items: {
        id: number;
        name: string;
        units: {
            id: number;
            name: string;
        } | null;
    }[],
    
    setSelectedLine: React.Dispatch<React.SetStateAction<number | undefined>>,
    selectedLine: number | undefined
    // selectedItem: number | undefined
}

// ЦЕ КОЖНА ЛІНІЯ
export default function PurchLineItem( {purch_header, line, index, items, setSelectedLine, selectedLine} : PurchLinesComponentProps){

    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
   
    function handleEditPurchLine(){
        setShowEditModal(true)
        setSelectedLine(line.id)
    }

    function handleDeletePurchLine(){
        setShowDeleteModal(true)
        setSelectedLine(line.id)
        //setSelectedLine(line.id)
    }

    return(
        <tr key={line?.id}>
            <React.Fragment>
                <td className="px-4 py-2 border border-gray-400 text-center">{index + 1}</td>
                <td className="px-4 py-2 border border-gray-400 text-center">{line?.item_id}</td>
                <td className="px-4 py-2 border border-gray-400 text-center">{line?.items.name}</td>
                <td className="px-4 py-2 border border-gray-400 text-center">{line?.items.feed_type_id}</td>
                <td className="px-4 py-2 border border-gray-400 text-center">{line?.units.name}</td>            

                <td className="px-4 py-2 border border-gray-400 text-center">{line?.quantity}</td> 

                <td className="text-center">
                {purch_header?.doc_id === null && (
                    <div>
                        <button className="hover:bg-blue-100 py-1 px-1 rounded" onClick={handleEditPurchLine}>
                            <Image
                                src={editButton}
                                alt="Edit"
                                width={30}
                                height={30}
                            />
                        </button> 
                        <button className="hover:bg-red-100 py-1 px-1 rounded" onClick={handleDeletePurchLine}>
                            <Image
                                src={deleteButton}
                                alt="Delete"
                                width={30}
                                height={30}
                            />
                        </button> 
                    </div>
                )}


                    {showEditModal 
                        && selectedLine === line.id 
                       && <CreateEditLineForm purchId={purch_header?.id} line={line} index={index} items={items} setShowModal={setShowEditModal} 
                       // setSelectedLine={setSelectedLine}
                       />}
       
                       {showDeleteModal 
                        && selectedLine === line.id 
                       && <PurchLineDeleteForm 
                       line={line} 
                       setShowModal={setShowDeleteModal}
                       // setSelectedLine={setSelectedLine}
                       />}
                
                    
                </td>
            </React.Fragment>
            
            

        </tr>
        
      )
}