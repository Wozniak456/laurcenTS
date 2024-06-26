'use client'

import React, { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import * as actions from '@/actions';
import PurchLinesList from '@/components/PurchLines/purchlines-table'
import Image from 'next/image';
import deleteButton from '../../../public/icons/delete.svg'
import newFileButton from '../../../public/icons/create.svg'
import editButton from '../../../public/icons/edit.svg'
import registerGoodsButton from '../../../public/icons/goods-in.svg'
import CreateEditPurchHeaderForm from '../PurchHeaders/create-edit-header-form'
import PurchHeaderDeleteForm from '../PurchHeaders/delete-message'
import RegisteringGoods from '../PurchHeaders/registering-form'
import { headers } from "next/headers";

interface PurchTableComponentProps {
    purchtables: {
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
    }[];
    vendors: {
        id: number;
        name: string;
        description: string | null;
    }[],
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

export default function PurchTableComponent({ purchtables, vendors, items }: PurchTableComponentProps){
    const [formState, action] = useFormState(actions.createPurchTableRecord, { message: '' });
    const [selectedRow, setSelectedRow] = useState<bigint | undefined>(undefined);
    const [showCreatePurchHeaderModal, setShowCreatePurchHeaderModal] = useState<boolean>(false);
    

    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);

    const handleRowClick = (purchID: bigint) => {
        setSelectedRow(purchID);
    };
    
    function handleCreateNewPurchTable(){
        setShowCreatePurchHeaderModal(true)
    }

    function handleEditPurchHeader(){
        setShowEditModal(true)
    }

    function handleDeletePurchHeader(){
        setShowDeleteModal(true)
    }

    function handleRegisterGoodsInProduction() {
        setShowRegisterModal(true)
    }

    return(
        <div className="flex flex-col gap-4 my-4">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-xl font-bold">Прибуткові накладні</h1>
                <div>
                    <button className="hover:bg-blue-100 py-2 px-2 rounded" onClick={handleCreateNewPurchTable}>
                        <Image
                            src={newFileButton}
                            alt="New Document Icon"
                            width={30}
                            height={30}
                            title="Це зображення видаляє елемент" 
                        />
                    </button>
                </div>
                
            </div>
            <table className="w-full text-sm">

                <thead>
                    <tr className="bg-blue-100">
                        <th className="px-2 py-2 text-center border border-gray-400">Doc ID</th>
                        <th className="px-2 py-2 text-center border border-gray-400">Delivery Date</th>
                        <th className="px-2 py-2 text-center border border-gray-400">Vendor Doc ID</th>
                        <th className="px-2 py-2 text-center border border-gray-400">Vendor ID</th>
                        <th className="px-2 py-2 text-center border border-gray-400">Vendor Name</th>            
                        <th className="px-2 py-2 text-center border border-gray-400">Status</th> 
                        <th colSpan={3} className="py-2 text-center border border-gray-400">Edit</th>            
                    </tr> 
                </thead>

                <tbody>
                    {purchtables
                    .sort((a, b) => Number(b.id) - Number(a.id))
                    .map(header => (
                    <tr 
                    key={header.id} 
                    onClick={() => handleRowClick(header.id)} 
                    className={selectedRow === header.id ? "cursor-pointer bg-blue-50" : "cursor-pointer"}>
                        <td className="px-2 py-2 border border-gray-400 text-center">
                            {header.doc_id !== null ? Number(header.doc_id) : ''}
                        </td>
                        <td className="px-2 py-2 border border-gray-400 text-center">{header.date_time.toISOString().split("T")[0]}</td>
                        <td className="px-2 py-2 border border-gray-400 text-center">{header.vendor_doc_number}</td>
                        <td className="px-2 py-2 border border-gray-400 text-center">{header.vendor_id}</td>
                        <td className="px-2 py-2 border border-gray-400 text-center">{header.vendors.name}</td>            
                        <td className="px-2 py-2 border border-gray-400 text-center">
                            {header.purchaselines.length === 0 ? 
                                'None' : 
                                header.doc_id === null ? 
                                    'Saved' : 
                                    'Posted'
                            }
                        </td>
                        {header.doc_id === null && 

                        <td className=" border border-gray-400 text-center w-16">
                            <button 
                            className="hover:bg-blue-100  rounded" 
                            onClick={handleEditPurchHeader}>
                                <Image
                                    src={editButton}
                                    alt="Edit"
                                    width={30}
                                    height={30}
                                />
                            </button> 

                        {showEditModal 
                        && selectedRow === header.id 
                        && <CreateEditPurchHeaderForm 
                            header={header}
                            vendors={vendors}
                            setShowForm={setShowEditModal}
                        /> }
                        </td>
                        }

                        {header.doc_id === null &&
                        <td className=" border border-gray-400 text-center  w-16">
                            
                            <button 
                            className="hover:bg-red-100 rounded" 
                            onClick={handleDeletePurchHeader}>
                                <Image
                                    src={deleteButton}
                                    alt="Delete"
                                    width={30}
                                    height={30}
                                />
                            </button>

                            {showDeleteModal 
                            && selectedRow === header.id
                            && <PurchHeaderDeleteForm
                            header={header}
                            setShowModal={setShowDeleteModal} 
                            />}
                        </td>
                        }

                        {header.doc_id === null && 
                        <td className=" border border-gray-400 text-center w-16">
                            
                            {header.purchaselines.length > 0 && 
                            <button 
                            className="hover:bg-green-100 rounded" 
                            onClick={handleRegisterGoodsInProduction}>
                                <Image
                                    src={registerGoodsButton}
                                    alt="Register goods"
                                    width={30}
                                    height={30}
                                />
                            </button> 
                            } 

                            {showRegisterModal 
                            && selectedRow === header.id
                            && <RegisteringGoods
                            header={header}
                            setShowForm={setShowRegisterModal} 
                            />}
                        </td>
                    }
                        
                    </tr>
                    ))}
                    
                </tbody>

            </table>
            

            {selectedRow !== undefined && 
            <PurchLinesList 
            lines={purchtables.find(table => table.id === selectedRow)?.purchaselines}
            purchHeader={purchtables.find(table => table.id === selectedRow)} 
            items={items}
            />}

            {/* для створення накладної */}
            { showCreatePurchHeaderModal && <CreateEditPurchHeaderForm vendors={vendors} setShowForm={setShowCreatePurchHeaderModal}/>}
        </div>
    )
}